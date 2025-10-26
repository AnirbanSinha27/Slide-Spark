"use client";

import React, { useState, useRef, useEffect } from "react";
import { generatePptFromJson } from "../utils/generatePpt";
import SidePanel from "./SidePanel";
import PptPreview from "./PptPreview";
import { Send, Download, X, MessageSquare } from 'lucide-react';

interface Message {
  role: "user" | "assistant";
  content: string;
  metadata?: {
    slideCount?: number;
    error?: string;
  };
}

interface SlideContent {
  type: string;
  text?: string;
  points?: string[];
  items?: string[];
  header?: string;
  sections?: any[];
  content?: string;
}

interface Slide {
  title: string;
  content: SlideContent[];
}

interface SlideJSON {
  title: string;
  slides: Slide[];
}

// Standardized JSON schema for AI
const EXPECTED_JSON_SCHEMA = {
  title: "Presentation Title",
  slides: [
    {
      title: "Slide Title",
      content: [
        { type: "subtitle", text: "Optional subtitle" },
        { type: "bullet_points", points: ["Point 1", "Point 2"] },
        { type: "description", text: "Optional footer text" }
      ]
    }
  ]
};

// Validation & normalization
function validateAndNormalizeJson(aiJson: any): { valid: boolean; normalized?: any; error?: string; warnings?: string[] } {
  const warnings: string[] = [];

  if (!aiJson || typeof aiJson !== "object") {
    return { valid: false, error: "Invalid JSON: Expected an object" };
  }

  if (!aiJson.slides || !Array.isArray(aiJson.slides)) {
    return { valid: false, error: "Invalid JSON: Missing 'slides' array" };
  }

  if (aiJson.slides.length === 0) {
    return { valid: false, error: "Invalid JSON: No slides provided" };
  }

  const normalizedSlides = aiJson.slides.map((slide: any, idx: number) => {
    const slideNum = idx + 1;
    const heading = slide.title || slide.heading || `Slide ${slideNum}`;
    const bullets: string[] = [];
    const descriptions: string[] = [];
    const contentArray = Array.isArray(slide.content) ? slide.content : [];

    contentArray.forEach((item: any, itemIdx: number) => {
      if (!item || typeof item !== "object") return;

      const type = item.type || "";

      switch (type) {
        case "subtitle":
        case "description":
        case "footer":
        case "paragraph":
          if (item.text) descriptions.push(item.text);
          else if (item.content) descriptions.push(item.content);
          break;
        case "bullet_points":
        case "bullets":
        case "list":
        case "unordered_list":
          if (Array.isArray(item.points)) bullets.push(...item.points.map((p: any) => (typeof p === "string" ? p : p.text || p.content || "")));
          else if (Array.isArray(item.items)) bullets.push(...item.items.map((i: any) => (typeof i === "string" ? i : i.text || i.content || "")));
          break;
        case "numbered_list":
        case "ordered_list":
          if (Array.isArray(item.items)) bullets.push(...item.items.map((i: any, index: number) => `${index + 1}. ${typeof i === "string" ? i : i.text || i.content || ""}`));
          else if (Array.isArray(item.points)) bullets.push(...item.points.map((p: any, index: number) => `${index + 1}. ${typeof p === "string" ? p : p.text || p.content || ""}`));
          break;
        case "list_with_headers":
        case "section_list":
        case "sections":
          if (Array.isArray(item.sections)) {
            item.sections.forEach((section: any) => {
              if (section.header || section.title) bullets.push(`• ${section.header || section.title}`);
              if (Array.isArray(section.points)) bullets.push(...section.points.map((p: any) => `  - ${typeof p === "string" ? p : p.text || p.content || ""}`));
              if (Array.isArray(section.items)) bullets.push(...section.items.map((i: any) => `  - ${typeof i === "string" ? i : i.text || i.content || ""}`));
            });
          }
          break;
        case "point":
        case "bullet":
          if (item.text || item.content) bullets.push(item.text || item.content);
          break;
        default:
          if (item.text) descriptions.push(item.text);
          else if (item.content) descriptions.push(item.content);
      }
    });

    // Legacy properties fallback
    if (contentArray.length === 0) {
      if (slide.subtitle) descriptions.push(slide.subtitle);
      if (slide.description) descriptions.push(slide.description);
      if (slide.footer) descriptions.push(slide.footer);
      if (Array.isArray(slide.bullets)) bullets.push(...slide.bullets);
      if (Array.isArray(slide.points)) bullets.push(...slide.points);
      if (Array.isArray(slide.items)) bullets.push(...slide.items);
    }

    return { heading, bullets, descriptions };
  });

  return { valid: true, normalized: { title: aiJson.title || aiJson.slides[0]?.title || "Untitled Presentation", slides: normalizedSlides }, warnings: warnings.length > 0 ? warnings : undefined };
}

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'll help you create a PowerPoint presentation. Describe what you need, and I'll generate it for you.\n\n📋 Tip: Be specific about the topic, number of slides, and key points you want to cover."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [pptUrl, setPptUrl] = useState<string | null>(null);
  const [showSchema, setShowSchema] = useState(false);
  const [lastJsonResponse, setLastJsonResponse] = useState<any>(null);
  const [pastPrompts, setPastPrompts] = useState<Array<{ prompt: string; slideData: any }>>([]);

  useEffect(() => {
    // Only runs on the client
    const stored = localStorage.getItem("pastPrompts");
    if (stored) {
      setPastPrompts(JSON.parse(stored));
    }
  }, []);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add prompt immediately - ONLY ONCE
    const newPrompt = { prompt: input, slideData: null };
    setPastPrompts((prev) => {
      const updated = [...prev, newPrompt];
      localStorage.setItem("pastPrompts", JSON.stringify(updated));
      return updated;
    });

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setProgress(null);
    setPptUrl(null);

    try {
      setProgress("🤖 Generating presentation structure...");

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
      const data = await res.json();
      const aiContent = data?.result?.trim() || "";

      let cleanContent = aiContent.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();

      let parsed: any = null;
      let parseError: string | undefined;
      try {
        parsed = JSON.parse(cleanContent);
        setLastJsonResponse(parsed);
      } catch (err) {
        parseError = err instanceof Error ? err.message : "Unknown parse error";
      }

      if (parsed) {
        const validation = validateAndNormalizeJson(parsed);

        if (validation.valid) {
          const normalized = validation.normalized!;
          setPastPrompts((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].slideData = normalized;
            localStorage.setItem("pastPrompts", JSON.stringify(updated));
            return updated;
          });

          setLastJsonResponse(normalized);

          const slideCount = normalized.slides.length;
          let aiMsg = `✅ Generated: ${normalized.title}\n📊 ${slideCount} slide${slideCount !== 1 ? "s" : ""}`;
          if (validation.warnings && validation.warnings.length > 0) {
            aiMsg += `\n\n⚠️ Warnings:\n${validation.warnings.slice(0, 5).map(w => `• ${w}`).join("\n")}`;
            if (validation.warnings.length > 5) aiMsg += `\n• ... and ${validation.warnings.length - 5} more warnings`;
          }

          setMessages((prev) => [...prev, { role: "assistant", content: aiMsg, metadata: { slideCount } }]);
          setLoading(false);

          // Generate PPT
          setProgress("📝 Creating PowerPoint file...");
          const { blob } = await generatePptFromJson(normalized, ({ slideIndex, total }) => {
            setProgress(`📝 Building slide ${slideIndex} of ${total}...`);
          });

          const url = URL.createObjectURL(blob);
          setPptUrl(url);
          setProgress("✅ Presentation ready for download!");
        } else {
          setMessages((prev) => [...prev, { role: "assistant", content: `❌ Invalid presentation structure\n\n${validation.error}`, metadata: { error: validation.error } }]);
        }
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: `❌ Failed to parse AI response\n\n${parseError || "The AI didn't return valid JSON"}` }]);
      }

      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ Error\n\n${errorMessage}`, metadata: { error: errorMessage } }]);
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#262624]">

    <SidePanel
            pastPrompts={[...pastPrompts].reverse()}
            onSelectPrompt={(slideData) => setLastJsonResponse(slideData)}
          />


      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-center px-6 py-4 bg-[#262624] border-b border-[#e5e5dc]">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#c17855] to-[#9b5a3c] flex items-center justify-center">
      <MessageSquare className="w-5 h-5 text-white" />
    </div>
    <h2 className="text-white font-medium text-lg">
      Slide Spark
    </h2>
  </div>
</div>


        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className="shrink-0 mt-1">
                  {msg.role === 'assistant' ? (
                    <div className="w-8 h-8 rounded-md bg-linear-to-br from-[#c17855] to-[#9b5a3c] flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">AI</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-[#4a90e2] flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">You</span>
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                <div className={`mb-1.5 ${msg.role === 'assistant' ? 'text-right' : 'text-left'}`}>
                <span
  className="text-sm font-medium"
  style={{ color: msg.role === 'assistant' ? '#c88465' : '#4a90e2' }}
>
  {msg.role === 'assistant' ? 'Assistant' : 'You'}
</span>

                  </div>
                  <div className={`prose prose-sm max-w-none ${msg.role === 'assistant' ? 'text-right' : 'text-left'}`}>
                    <p className="text-white leading-relaxed whitespace-pre-wrap m-0">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading State */}
            {loading && (
              <div className="flex gap-4 flex-row-reverse">
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-md bg-linear-to-br from-[#c17855] to-[#9b5a3c] flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">AI</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-1.5">
                    <span className="text-sm font-medium text-[#BB7C60]">Assistant</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#666666]">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#c17855] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#c17855] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#c17855] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Download Section */}
            {pptUrl && (
              <div className="flex gap-4 flex-row-reverse">
                <div className="shrink-0 w-8"></div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-3 px-4 py-3 bg-white border border-[#d4d4c8] rounded-xl shadow-sm hover:shadow-md transition-all">
                    <Download className="w-5 h-5 text-[#c17855]" />
                    <a
                      href={pptUrl}
                      download="presentation.pptx"
                      className="text-[#2c2c2c] font-medium hover:text-[#c17855] transition-colors"
                    >
                      Download presentation.pptx
                    </a>
                    <button
                      onClick={() => setPptUrl(null)}
                      className="ml-auto p-1 hover:bg-[#f5f5f0] rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-[#666666]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-[#e5e5dc] bg-[#262624] px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Describe your presentation..."
                  disabled={loading}
                  rows={1}
                  className="w-full px-4 py-3 pr-12 border border-[#d4d4c8] rounded-xl bg-white text-[#2c2c2c] placeholder-[#999999] resize-none outline-none focus:border-[#c17855] focus:ring-2 focus:ring-[#c17855]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: '52px', maxHeight: '200px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="shrink-0 p-3 rounded-xl bg-[#c17855] text-white hover:bg-[#a86647] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow disabled:hover:shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 text-xs text-[#999999] text-center">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
      {/* PPT Preview Panel */}
      {lastJsonResponse?.slides?.length > 0 && (
        <PptPreview slides={lastJsonResponse.slides} />
      )}
    </div>
  );
};

export default ChatPanel;
