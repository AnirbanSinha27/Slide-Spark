"use client";
import React, { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Clock, FileText } from 'lucide-react';

interface PastPrompt {
  prompt: string;
  slideData: any;
}

interface SidePanelProps {
  pastPrompts: PastPrompt[];
  onSelectPrompt: (slideData: any) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ pastPrompts, onSelectPrompt }) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={togglePanel}
          className="fixed top-4 left-4 z-50 p-2.5 bg-white border border-[#d4d4c8] rounded-lg shadow-sm hover:shadow-md hover:bg-[#fafaf8] transition-all group"
          title="Open History"
        >
          <PanelLeftOpen className="w-5 h-5 text-[#666666] group-hover:text-[#c17855] transition-colors" />
        </button>
      )}

      {/* Side Panel */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r border-[#e5e5dc] shadow-lg z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-80 translate-x-0' : 'w-80 -translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#e5e5dc]">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#c17855]" />
            <h3 className="font-medium text-[#2c2c2c] text-base">History</h3>
          </div>
          <button
            onClick={togglePanel}
            className="p-1.5 hover:bg-[#f5f5f0] rounded-lg transition-colors group"
            title="Close History"
          >
            <PanelLeftClose className="w-5 h-5 text-[#666666] group-hover:text-[#c17855] transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-65px)] px-3 py-3">
          {pastPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f0] flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-[#999999]" />
              </div>
              <p className="text-[#999999] text-sm text-center">
                No past prompts yet.
              </p>
              <p className="text-[#bbbbbb] text-xs text-center mt-1">
                Your conversation history will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {pastPrompts.map((entry, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(entry.slideData)}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-[#f5f5f0] transition-all duration-200 text-sm text-[#2c2c2c] group border border-transparent hover:border-[#e5e5dc] hover:shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-[#999999] group-hover:text-[#c17855] mt-0.5 shrink-0 transition-colors" />
                    <span className="line-clamp-3 leading-relaxed">
                      {entry.prompt.length > 80
                        ? entry.prompt.slice(0, 80) + "…"
                        : entry.prompt}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={togglePanel}
          className="fixed inset-0 bg-black/10 z-40 backdrop-blur-[1px] transition-opacity duration-300"
        />
      )}
    </>
  );
};

// Demo wrapper to show the component
const SidePanelDemo = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<{ id: number } | null>(null);
  
  const samplePrompts = [
    { prompt: 'Create a presentation about renewable energy with 5 slides covering solar, wind, and hydro power', slideData: { id: 1 } },
    { prompt: 'Make a business pitch deck for a tech startup', slideData: { id: 2 } },
    { prompt: 'Educational slides about the solar system for elementary school kids', slideData: { id: 3 } },
    { prompt: 'Company quarterly review presentation with charts and performance graphs', slideData: { id: 4 } },
    { prompt: 'Marketing strategy presentation for new product launch in Q2 2025', slideData: { id: 5 } },
    { prompt: 'Training materials for onboarding new employees', slideData: { id: 6 } },
  ];

  return (
    <div className="h-screen w-full bg-[#f5f5f0] relative overflow-hidden">
      <SidePanel 
        pastPrompts={samplePrompts}
        onSelectPrompt={(data) => {
          setSelectedPrompt(data);
          console.log('Selected:', data);
        }}
      />
      
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-lg px-6">
          <h1 className="text-2xl font-medium text-[#2c2c2c] mb-3">
            PowerPoint Generator
          </h1>
          <p className="text-[#666666] mb-2">
            Click the button in the top-left to open the history panel
          </p>
          {selectedPrompt && (
            <div className="mt-6 p-4 bg-white border border-[#e5e5dc] rounded-lg">
              <p className="text-sm text-[#2c2c2c]">
                Selected prompt ID: <strong>{selectedPrompt.id}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SidePanel;