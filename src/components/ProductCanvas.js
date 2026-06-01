"use client";

import { IoDownloadOutline, IoSparkles } from "react-icons/io5";
import LoadingTipsCarousel from "./LoadingTipsCarousel";

export default function ProductCanvas({
  portraitUrls = [],
  resultImage,
  isGenerating,
  aspectRatio,
}) {
  const handleDownload = () => {
    if (!resultImage) return;
    const filename = `ai-group-photo-${Date.now()}.png`;
    const downloadUrl = `/api/download?url=${encodeURIComponent(resultImage)}`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "16:9":
        return "aspect-[16/9]";
      case "9:16":
        return "aspect-[9/16]";
      case "4:3":
        return "aspect-[4/3]";
      case "3:4":
        return "aspect-[3/4]";
      case "3:2":
        return "aspect-[3/2]";
      case "2:3":
        return "aspect-[2/3]";
      case "1:1":
      default:
        return "aspect-square";
    }
  };

  return (
    <div className="relative w-full h-full min-h-[450px] md:h-[calc(100vh-100px)] bg-zinc-950/20 flex flex-col items-center justify-center p-4">
      {/* Minimal Status Indicator */}
      <div className="absolute top-4 left-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
        {isGenerating ? "Generating" : resultImage ? "Result" : "Preview"}
      </div>

      {/* Floating Canvas Controls */}
      {resultImage && !isGenerating && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <IoDownloadOutline className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      )}

      {/* Canvas Contents */}
      <div className="w-full h-full flex items-center justify-center">
        {isGenerating ? (
          <div className="max-w-md w-full animate-in fade-in duration-200">
            <LoadingTipsCarousel />
          </div>
        ) : resultImage ? (
          <div className="relative max-w-full max-h-[85%] w-auto h-auto flex items-center justify-center transition-all duration-300">
            <div className={`relative ${getAspectRatioClass()} max-h-[70vh]`}>
              {/* Main Image */}
              <img
                src={resultImage}
                alt="Workspace canvas"
                className="w-full h-full object-cover rounded-xl border border-zinc-800/80 shadow-md"
              />

              {/* Floating Overlay Input Thumbnails */}
              {portraitUrls.length > 0 && (
                <div className="absolute bottom-4 left-4 z-10 flex gap-2 p-1.5 bg-zinc-950/80 border border-zinc-800 rounded-lg backdrop-blur-md shadow-2xl">
                  {portraitUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Reference Portrait ${idx + 1}`}
                      className="w-8 h-8 rounded object-cover border border-zinc-700"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : portraitUrls.length > 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
            <IoSparkles className="w-8 h-8 text-fuchsia-500 animate-pulse mb-4" />
            <h4 className="text-sm font-bold text-zinc-100 font-outfit">Ready to Generate</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              You have uploaded {portraitUrls.length} portrait {portraitUrls.length === 1 ? "shot" : "shots"} of the person. Choose an aspect ratio and target resolution on the sidebar, edit the prompt, and click the button to generate the combined group photo!
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-6 p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
              {portraitUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Person Portrait ${idx + 1}`}
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-800"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-xs">
            <IoSparkles className="w-6 h-6 text-zinc-600 mb-3" />
            <h4 className="text-xs font-semibold text-zinc-400">
              AI Group Photo Canvas
            </h4>
            <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
              Upload up to 6 portraits of a single person to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
