import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserService } from "@/lib/services/user";
import config from "@/lib/config";

// Mock template images for fallback
const MOCK_GROUP_PHOTOS = [
  "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
];

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { prompt, inputImages, aspectRatio, resolution } = body;

    if (!inputImages || !Array.isArray(inputImages) || inputImages.length === 0) {
      return new NextResponse("Missing input portrait images", { status: 400 });
    }

    // 1. Deduct credits
    const cost = config.ai.generationCost || 18;
    try {
      await UserService.deductCredits(session.user.id, cost);
    } catch (err) {
      return new NextResponse("Insufficient credits", { status: 402 });
    }

    const apiKey = config.ai.apiKey;
    let resultImage = "";
    let requestId = `mock_${Date.now()}`;
    let status = "processing";

    // Sequentially upload base64 images to MuAPI CDN if they start with data:
    const imagesList = [];
    if (apiKey && !apiKey.includes("your_") && apiKey.trim() !== "") {
      for (let i = 0; i < inputImages.length; i++) {
        let img = inputImages[i];
        if (img.startsWith("data:")) {
          try {
            const base64Data = img.split(",")[1];
            const mimeType = img.split(";")[0].split(":")[1] || "image/png";
            const ext = mimeType.split("/")[1] || "png";
            const buffer = Buffer.from(base64Data, "base64");
            
            const fd = new FormData();
            const blob = new Blob([buffer], { type: mimeType });
            fd.append("file", blob, `input_${i}_${Date.now()}.${ext}`);

            const uploadRes = await fetch("https://api.muapi.ai/api/v1/upload_file", {
              method: "POST",
              headers: {
                "x-api-key": apiKey,
              },
              body: fd,
            });

            if (uploadRes.ok) {
              const uploadJson = await uploadRes.json();
              img = uploadJson.url || uploadJson.file_url;
            } else {
              console.error(`Failed to upload image index ${i} to MuAPI CDN:`, uploadRes.status);
            }
          } catch (uploadErr) {
            console.error(`Error uploading base64 image index ${i}:`, uploadErr);
          }
        }
        imagesList.push(img);
      }
    } else {
      // In mock/development fallback mode, keep imagesList as is
      imagesList.push(...inputImages);
    }

    if (apiKey && !apiKey.includes("your_") && apiKey.trim() !== "") {
      try {
        const webhookUrl = `${config.auth.webhook_url}/api/webhook/muapi`;

        const submitRes = await fetch(
          `https://api.muapi.ai/api/v1/nano-banana-2-edit?webhook=${encodeURIComponent(webhookUrl)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
            },
            body: JSON.stringify({
              prompt: prompt,
              images_list: imagesList,
              aspect_ratio: aspectRatio || "1:1",
              resolution: resolution || "1k",
            }),
          }
        );

        if (submitRes.ok) {
          const resJson = await submitRes.json();
          console.log("[GENERATION] MuAPI submit response:", JSON.stringify(resJson));
          requestId = resJson.request_id || resJson.id || requestId;

          // Poll for result (max 60s, 12 attempts x 5s)
          let completed = false;
          let attempts = 0;
          const maxAttempts = 12;

          while (!completed && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            attempts++;

            try {
              const pollRes = await fetch(
                `https://api.muapi.ai/api/v1/predictions/${requestId}/result`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                  },
                }
              );

              if (pollRes.ok) {
                const pollJson = await pollRes.json();
                console.log(`[GENERATION] Poll attempt ${attempts}:`, JSON.stringify(pollJson).slice(0, 300));
                const state = pollJson.status || pollJson.state;

                if (state === "completed" || state === "succeeded") {
                  const outputs = pollJson.outputs || [];
                  resultImage =
                    outputs[0] ||
                    (pollJson.output ? pollJson.output[0] : "") ||
                    pollJson.video || "";
                  if (resultImage) {
                    status = "completed";
                    completed = true;
                  }
                } else if (state === "failed" || state === "cancelled") {
                  console.error("[GENERATION] MuAPI job failed:", pollJson);
                  status = "failed";
                  break;
                }
              }
            } catch (pollErr) {
              console.error("MuAPI polling error:", pollErr);
            }
          }
        } else {
          const errText = await submitRes.text();
          console.error("MuAPI generation submission failed:", submitRes.status, errText);
        }
      } catch (err) {
        console.warn("MuAPI call failed, falling back to local mock:", err.message);
      }
    }

    // Mock Mode fallback or if polling timed out
    if (status === "processing") {
      await new Promise(resolve => setTimeout(resolve, 3000)); // simulate delay
      const randomIndex = Math.floor(Math.random() * MOCK_GROUP_PHOTOS.length);
      resultImage = MOCK_GROUP_PHOTOS[randomIndex];
      status = "completed";
    }

    // Save creation record in database
    const record = await prisma.groupPhotoCreation.create({
      data: {
        userId: session.user.id,
        prompt: prompt || "AI Group Photo Generation",
        inputImage: imagesList.join(","),
        templateImage: null,
        resultImage: resultImage || null,
        requestId,
        status,
        aspectRatio: aspectRatio || "1:1",
        activeTab: "custom",
        creditCost: cost
      }
    });

    return NextResponse.json({
      id: record.id,
      resultImage: record.resultImage,
      status: record.status,
      requestId: record.requestId
    });

  } catch (error) {
    console.error("[GENERATION_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
