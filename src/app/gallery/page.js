"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { IoDownloadOutline, IoTrashOutline, IoExpandOutline, IoClose } from "react-icons/io5";

export default function Gallery() {
  const { data: session, status } = useSession();
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreation, setSelectedCreation] = useState(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchCreations = async () => {
      try {
        const res = await fetch("/api/creations");
        if (res.ok) {
          const data = await res.json();
          // Filter to show only completed or failed creations in gallery
          setCreations(data.filter((c) => c.status === "completed" || c.status === "failed"));
        }
      } catch (err) {
        console.error("Failed to load creations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreations();
  }, [status]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this creation?")) return;

    try {
      const res = await fetch(`/api/creations?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCreations((prev) => prev.filter((c) => c.id !== id));
        if (selectedCreation?.id === id) {
          setSelectedCreation(null);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDownload = (imageUrl, e) => {
    if (e) e.stopPropagation();
    const filename = `ai-group-photo-${Date.now()}.png`;
    const downloadUrl = `/api/download?url=${encodeURIComponent(imageUrl)}`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#09090b]">
        <div className="h-10 w-10 rounded-full border-4 border-zinc-800 border-t-fuchsia-500 animate-spin"></div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#09090b] text-center">
        <h2 className="text-xl font-bold text-zinc-100 font-outfit">Access Creations Gallery</h2>
        <p className="text-zinc-400 text-xs mt-2 max-w-sm leading-relaxed">
          Sign in to view your history of generated AI group photos, zoom in on details, and download them.
        </p>
        <button
          onClick={() => signIn("google")}
          className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold px-6 py-2.5 text-xs shadow-lg hover:brightness-110 active:scale-98 transition-all"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <main className="flex-1 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full bg-[#09090b]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="font-outfit text-3xl font-extrabold tracking-tight text-zinc-100">
            Creations Gallery
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Browse and download all your generated AI group photos.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 rounded-full border-4 border-zinc-800 border-t-fuchsia-500 animate-spin"></div>
        </div>
      ) : creations.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
          <p className="text-zinc-500 text-xs">No creations generated yet.</p>
          <a
            href="/"
            className="mt-4 inline-block text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300"
          >
            Start your first group photo &rarr;
          </a>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {creations.map((creation) => (
            <div
              key={creation.id}
              onClick={() => creation.status === "completed" && setSelectedCreation(creation)}
              className="group relative bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:border-zinc-700 transition duration-300"
            >
              {/* Image Preview Container */}
              <div className="aspect-square relative overflow-hidden bg-zinc-950">
                {creation.status === "completed" ? (
                  <img
                    src={creation.resultImage}
                    alt={creation.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <span className="text-[10px] font-bold text-red-500 bg-red-950/40 border border-red-900/50 px-2 py-1 rounded">
                      Generation Failed
                    </span>
                  </div>
                )}

                {/* Floating overlay on hover */}
                {creation.status === "completed" && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCreation(creation);
                      }}
                      className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg border border-zinc-800 transition"
                      title="Open details"
                    >
                      <IoExpandOutline className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDownload(creation.resultImage, e)}
                      className="p-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg transition"
                      title="Download image"
                    >
                      <IoDownloadOutline className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Info panel */}
              <div className="p-3.5 flex items-center justify-between border-t border-zinc-900 bg-zinc-950/60">
                <div className="truncate pr-4">
                  <p className="text-[10px] font-bold text-zinc-400 truncate">
                    {creation.prompt}
                  </p>
                  <p className="text-[9px] text-zinc-600 mt-0.5">
                    {new Date(creation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(creation.id, e)}
                  className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-950/20 rounded transition"
                  title="Delete creation"
                >
                  <IoTrashOutline className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-Screen Detail View Modal */}
      {selectedCreation && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedCreation(null)}
          ></div>
          
          <div className="relative max-w-4xl w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[85vh]">
            {/* Main image column */}
            <div className="flex-1 bg-zinc-900 flex items-center justify-center p-4 relative min-h-[300px] md:min-h-0">
              <img
                src={selectedCreation.resultImage}
                alt={selectedCreation.prompt}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            {/* Meta info column */}
            <div className="w-full md:w-[320px] shrink-0 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-900 bg-zinc-950">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-100">Creation Details</h3>
                  <button
                    onClick={() => setSelectedCreation(null)}
                    className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition"
                  >
                    <IoClose className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider">
                    Prompt Prompt Text
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/40 border border-zinc-900 p-3 rounded-lg">
                    {selectedCreation.prompt}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider">
                      Created At
                    </span>
                    <p className="text-zinc-300 font-semibold mt-0.5">
                      {new Date(selectedCreation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider">
                      Aspect Ratio
                    </span>
                    <p className="text-zinc-300 font-semibold mt-0.5">
                      {selectedCreation.aspectRatio}
                    </p>
                  </div>
                </div>

                {/* Overlay Thumbnails used for reference */}
                <div className="space-y-2">
                  <span className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider">
                    Input Assets
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedCreation.inputImage &&
                      selectedCreation.inputImage.split(",").map((imgUrl, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <img
                            src={imgUrl}
                            alt={`Input Face ${idx + 1}`}
                            className="w-12 h-12 rounded object-cover border border-zinc-800"
                          />
                          <span className="text-[8px] text-zinc-500 mt-1">Portrait {idx + 1}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-8 pt-4 border-t border-zinc-900">
                <button
                  onClick={(e) => handleDownload(selectedCreation.resultImage, e)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg transition-all hover:brightness-110 active:scale-98"
                >
                  <IoDownloadOutline className="w-4 h-4" />
                  Download HD
                </button>
                <button
                  onClick={(e) => handleDelete(selectedCreation.id, e)}
                  className="p-3 border border-zinc-900 bg-zinc-900/60 hover:bg-red-950/20 text-zinc-400 hover:text-red-500 rounded-xl transition"
                  title="Delete creation"
                >
                  <IoTrashOutline className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
