import React, {useState} from "react";
import { Presentation, ChevronRight } from 'lucide-react';

interface SlideItem {
  heading?: string;
  bullets?: string[];
  descriptions?: string[];
  notes?: string;
}

interface PptPreviewProps {
  slides: SlideItem[];
}



const PptPreview: React.FC<PptPreviewProps> = ({ slides }) => {

  return (
    <div className="w-96 h-full overflow-y-auto bg-[#262624] border-l border-[#e5e5dc] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#e5e5dc] bg-[#262624]">
        <Presentation className="w-5 h-5 text-[#c17855]" />
        <h3 className="text-lg font-medium text-white">Slide Preview</h3>
        <span className="ml-auto mt-4 text-xs text-[#999999] font-medium">
          {slides.length} {slides.length === 1 ? 'slide' : 'slides'}
        </span>
      </div>

      {/* Slides */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#e5e5dc] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              {/* Slide Header */}
              <div className="px-4 py-2.5 bg-[#fafaf8] border-b border-[#e5e5dc] flex items-center justify-between">
                <span className="text-xs font-medium text-[#666666]">
                  Slide {idx + 1}
                </span>
                <span className="text-xs text-[#999999]">
                  {idx + 1} / {slides.length}
                </span>
              </div>

              {/* Slide Content */}
              <div className="p-4 min-h-[180px]">
                {/* Heading */}
                {slide.heading && (
                  <h4 className="text-lg font-semibold text-[#2c2c2c] mb-3 leading-snug">
                    {slide.heading}
                  </h4>
                )}

                {/* Descriptions */}
                {slide.descriptions && slide.descriptions.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {slide.descriptions.map((desc, i) => (
                      <p key={i} className="text-sm text-[#555555] leading-relaxed">
                        {desc}
                      </p>
                    ))}
                  </div>
                )}

                {/* Bullet points */}
                {slide.bullets && slide.bullets.length > 0 && (
                  <ul className="space-y-2 mt-3">
                    {slide.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#555555]">
                        <ChevronRight className="w-4 h-4 text-[#c17855] mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PptPreview;
