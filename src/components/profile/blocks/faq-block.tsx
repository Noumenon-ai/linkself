"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqBlockProps {
  title: string;
  items: FaqItem[];
  textClass?: string;
  textStyle?: React.CSSProperties;
}

export function FaqBlock({ title, items, textClass, textStyle }: FaqBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full py-2">
      <p className={`text-sm font-medium mb-3 text-center ${textClass || ""}`} style={textStyle}>{title}</p>
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-lg overflow-hidden border border-current/10">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 text-sm font-medium transition-colors hover:bg-white/10 ${textClass || ""}`}
              style={textStyle}
            >
              <span>{item.q}</span>
              <svg
                className={`h-4 w-4 flex-shrink-0 transition-transform ${openIndex === idx ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === idx && (
              <div
                className={`px-4 pb-3 text-sm opacity-80 ${textClass || ""}`}
                style={textStyle}
              >
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
