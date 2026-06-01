"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  IoSparkles,
  IoWalletOutline,
  IoCloudUploadOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { FaExclamationTriangle } from "react-icons/fa";
import ProductCanvas from "@/components/ProductCanvas";
import { FaAngleDown } from "react-icons/fa6";

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 (Square)" },
  { id: "16:9", label: "16:9 (Landscape)" },
  { id: "9:16", label: "9:16 (Portrait)" },
  { id: "4:3", label: "4:3 (Standard)" },
  { id: "3:4", label: "3:4 (Vertical)" },
  { id: "3:2", label: "3:2 (Wide)" },
  { id: "2:3", label: "2:3 (Photo)" },
];

const RESOLUTIONS = [
  { id: "1k", label: "1K Resolution" },
  { id: "2k", label: "2K Ultra HD" },
];

export default function Home() {
  const { data: session, status } = useSession();

  // Workspace settings states
  const [customPrompt, setCustomPrompt] = useState("A happy group photo of the person in different outfits and settings standing together smiling, cinematic lighting, realistic, high detailed");
  const [portraitUrls, setPortraitUrls] = useState([]);
  const [aspectRatio, setAspectRatioChange] = useState("1:1");
  const [resolution, setResolution] = useState("1k");
  const [aspectRatioDropdownOpen, setAspectRatioDropdownOpen] = useState(false);
  const [resolutionDropdownOpen, setResolutionDropdownOpen] = useState(false);
  const [settings, setSettings] = useState({
    strictAlign: true,
    hdRestore: true,
  });

  // Generation status states
  const [resultImage, setResultImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [processingCreations, setProcessingCreations] = useState([]);

  // Auto-refresh gallery poll if any creations are "processing"
  useEffect(() => {
    if (!session?.user) return;

    let intervalId;

    const checkProcessing = async () => {
      try {
        const res = await fetch("/api/creations");
        if (res.ok) {
          const data = await res.json();
          const processing = data.filter((c) => c.status === "processing");
          setProcessingCreations(processing);

          // If a creation was processing and is now completed, show the result
          if (isGenerating && processing.length === 0) {
            // Find the most recent completed creation
            const completed = data.find((c) => c.status === "completed");
            if (completed) {
              setResultImage(completed.resultImage);
              setIsGenerating(false);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch creations:", err);
      }
    };

    // Initial check
    checkProcessing();

    // Check every 4 seconds
    intervalId = setInterval(checkProcessing, 4000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [session, isGenerating]);

  const handlePortraitUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files || files.length === 0) return;

    const remaining = 6 - portraitUrls.length;
    const filesToAdd = files.slice(0, remaining);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortraitUrls((prev) => [...prev, reader.result].slice(0, 6));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePortrait = (index) => {
    setPortraitUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!session) {
      signIn("google");
      return;
    }

    if (portraitUrls.length === 0) {
      setErrorMessage("Please upload at least one portrait image first.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      // Trigger generation (Sequential uploads are handled elegantly on the server side)
      const genRes = await fetch("/api/generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: customPrompt || "A happy group photo of the person in different outfits and settings standing together smiling, cinematic lighting, realistic, high detailed",
          inputImages: portraitUrls,
          aspectRatio,
          resolution,
        }),
      });

      if (genRes.status === 402) {
        throw new Error(
          "Insufficient credits. Please purchase more credits to continue.",
        );
      }

      if (!genRes.ok) {
        throw new Error("AI generation server error. Please try again.");
      }

      const genJson = await genRes.json();
      if (genJson.resultImage) {
        setResultImage(genJson.resultImage);
      } else {
        throw new Error(
          "Generation timed out. Refreshing history might retrieve it later.",
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.message || "An unexpected error occurred during generation.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#09090b]">
      {/* Sidebar Controls (Left) */}
      <div className="w-full md:w-[350px] shrink-0 border-r border-zinc-900 bg-zinc-950 p-6 overflow-y-auto max-h-[none] md:max-h-[calc(100vh-64px)] flex flex-col gap-6">
        
        {/* Header Title Section */}
        <div>
          <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
            Group Studio
          </h1>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Upload up to 6 portraits of a single person and combine them seamlessly.
          </p>
        </div>

        {/* Guest Warning Banner */}
        {status !== "loading" && !session?.user && (
          <div className="flex items-start gap-3 p-4 bg-amber-950/20 border border-amber-900/60 rounded-xl text-amber-200">
            <FaExclamationTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold">Unauthenticated Guest</p>
              <p className="text-[10px] text-amber-300/80 leading-relaxed">
                You are playing as a guest. Please sign in with Google to enable predictions and creations.
              </p>
            </div>
          </div>
        )}

        {/* Multi-Portrait Uploader Grid */}
        <div className="border border-zinc-900 bg-[#0d0d10]/40 rounded p-4 space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-[11px] font-bold text-zinc-400">
              1. Portrait Face Images ({portraitUrls.length}/6)
            </label>
            {portraitUrls.length > 0 && (
              <button
                type="button"
                onClick={() => setPortraitUrls([])}
                className="text-[9px] text-zinc-500 hover:text-red-400 font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Uploaded Portraits */}
            {portraitUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded overflow-hidden border border-zinc-800 bg-zinc-900 group">
                <img
                  src={url}
                  alt={`Portrait ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePortrait(idx)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity rounded duration-150"
                  title="Remove Image"
                >
                  <IoTrashOutline className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Empty Upload Slots */}
            {portraitUrls.length < 6 && (
              <label className="aspect-square rounded border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 hover:bg-zinc-900/40 flex flex-col items-center justify-center cursor-pointer transition-all duration-150">
                <IoCloudUploadOutline className="w-5 h-5 text-zinc-500" />
                <span className="text-[9px] text-zinc-400 mt-1 font-semibold">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePortraitUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-[9px] text-zinc-600 leading-tight">
            Upload up to 6 different portrait shots of the same person for the best blend result.
          </p>
        </div>

        {/* Editable Prompt Area */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-zinc-400">
            2. Describe Scene / Prompt
          </label>
          <textarea
            rows="4"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe the group photo settings, outfits, pose..."
            className="w-full rounded bg-zinc-900 border border-zinc-800 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 p-3.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none resize-none transition-all duration-200"
          />
        </div>

        {/* Output Parameters Block */}
        <div className="border-t border-zinc-900 pt-5 space-y-4">
          <label className="block text-xs font-bold text-zinc-300">
            3. Workspace Options
          </label>

          {/* Aspect Ratio Selector (Upward Opening) */}
          <div className="relative">
            <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
              Aspect Ratio
            </label>
            <button
              onClick={() => {
                setAspectRatioDropdownOpen(!aspectRatioDropdownOpen);
                setResolutionDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between rounded bg-zinc-900 border border-zinc-800 p-3 text-xs font-semibold text-zinc-200 outline-none hover:bg-zinc-800 transition-colors"
            >
              <span>{ASPECT_RATIOS.find((r) => r.id === aspectRatio)?.label || "1:1 (Square)"}</span>
              <span className={`transition-transform duration-250 ${aspectRatioDropdownOpen ? "rotate-180" : ""}`}>
                <FaAngleDown />
              </span>
            </button>

            {aspectRatioDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAspectRatioDropdownOpen(false)}></div>
                <div className="absolute bottom-12 left-0 right-0 z-50 bg-zinc-900 border border-zinc-800 shadow-2xl rounded overflow-hidden overscroll-contain max-h-48 overflow-y-auto">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => {
                        setAspectRatioChange(ratio.id);
                        setAspectRatioDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors duration-150 ${
                        aspectRatio === ratio.id ? "bg-fuchsia-600 text-white" : "text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Resolution Selector (Upward Opening) */}
          <div className="relative">
            <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
              Target Resolution
            </label>
            <button
              onClick={() => {
                setResolutionDropdownOpen(!resolutionDropdownOpen);
                setAspectRatioDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between rounded bg-zinc-900 border border-zinc-800 p-3 text-xs font-semibold text-zinc-200 outline-none hover:bg-zinc-800 transition-colors"
            >
              <span>{RESOLUTIONS.find((r) => r.id === resolution)?.label || "1K Resolution"}</span>
              <span className={`transition-transform duration-250 ${resolutionDropdownOpen ? "rotate-180" : ""}`}>
                <FaAngleDown />
              </span>
            </button>

            {resolutionDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setResolutionDropdownOpen(false)}></div>
                <div className="absolute bottom-12 left-0 right-0 z-50 bg-zinc-900 border border-zinc-800 shadow-2xl rounded overflow-hidden overscroll-contain max-h-48 overflow-y-auto">
                  {RESOLUTIONS.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => {
                        setResolution(res.id);
                        setResolutionDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors duration-150 ${
                        resolution === res.id ? "bg-fuchsia-600 text-white" : "text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sliding settings toggles */}
          <div className="space-y-3 pt-2">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between bg-zinc-900/40 p-2.5 rounded border border-zinc-900">
              <div>
                <p className="text-[11px] font-semibold text-zinc-200">Strict Face Align</p>
                <p className="text-[9px] text-zinc-500">Pose aligned strictly to target</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, strictAlign: !prev.strictAlign }))}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-all duration-200 ${
                  settings.strictAlign ? "bg-fuchsia-600" : "bg-zinc-800"
                }`}
              >
                <div className={`bg-white w-3.8 h-3.8 rounded-full shadow transform transition-all duration-200 ${
                  settings.strictAlign ? "translate-x-4" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between bg-zinc-900/40 p-2.5 rounded border border-zinc-900">
              <div>
                <p className="text-[11px] font-semibold text-zinc-200">HD Face Restoration</p>
                <p className="text-[9px] text-zinc-500">Enhance final facial details</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, hdRestore: !prev.hdRestore }))}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-all duration-200 ${
                  settings.hdRestore ? "bg-fuchsia-600" : "bg-zinc-800"
                }`}
              >
                <div className={`bg-white w-3.8 h-3.8 rounded-full shadow transform transition-all duration-200 ${
                  settings.hdRestore ? "translate-x-4" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-2.5 bg-red-950/20 border border-red-900/30 rounded">
            <p className="text-[11px] text-red-400 font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* Generate Trigger Button */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-100 disabled:opacity-50 text-zinc-950 font-bold py-3 rounded transition-all duration-200 text-xs shadow-sm"
          >
            <IoSparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating..." : session ? "Generate Group Photo" : "Sign In to Generate"}
          </button>

          {session && (
            <div className="flex items-center justify-center gap-1.5 text-zinc-600 text-[10px]">
              <IoWalletOutline className="w-3.5 h-3.5" />
              <span>Costs 18 credits.</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas (Right) */}
      <div className="flex-1 bg-transparent overflow-y-auto max-h-[none] md:max-h-[calc(100vh-64px)] flex items-center justify-center">
        <ProductCanvas
          portraitUrls={portraitUrls}
          resultImage={resultImage}
          isGenerating={isGenerating}
          aspectRatio={aspectRatio}
        />
      </div>
    </div>
  );
}
