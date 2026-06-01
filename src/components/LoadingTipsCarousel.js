"use client";

import { useState, useEffect, useMemo } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const GROUP_TIPS = [
  {
    title: "High-Quality Portraits",
    description: "Ensure the uploaded face is well-lit, sharp, and facing forward for the best group photo integration results."
  },
  {
    title: "Lighting & Skin Harmony",
    description: "Our AI automatically balances the skin tones, shadows, and light source directions between the portrait and the group scene."
  },
  {
    title: "Preserving Scene Details",
    description: "The surrounding group members, background details, poses, and clothing in the templates are kept intact."
  },
  {
    title: "Multiple Categories",
    description: "Switch between Friends, Family, Corporate, Festive, and Graduation templates to find the perfect setting."
  },
  {
    title: "Seamless Jawline Blending",
    description: "The AI blends facial boundaries smoothly, ensuring natural transitions around hair and jaw lines."
  }
];

export default function LoadingTipsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GROUP_TIPS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const currentTip = useMemo(() => GROUP_TIPS[currentIndex], [currentIndex]);

  return (
    <div className="w-full max-w-md mx-auto px-6 py-8 flex flex-col items-center justify-center text-center">
      
      {/* Spinning loading icon */}
      <div className="relative mb-6">
        <AiOutlineLoading3Quarters className="w-12 h-12 text-fuchsia-500 animate-spin" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border border-fuchsia-500/20"></div>
      </div>

      <h3 className="text-lg font-bold text-zinc-100 mb-2">
        {currentTip.title}
      </h3>
      <p className="text-sm text-zinc-400 leading-relaxed min-h-[48px]">
        {currentTip.description}
      </p>

      {/* Slide indicators */}
      <div className="flex gap-1.5 mt-4">
        {GROUP_TIPS.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-4 bg-fuchsia-500" : "w-1.5 bg-zinc-700"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
