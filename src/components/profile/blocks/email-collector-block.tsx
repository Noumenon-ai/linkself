"use client";

import { useState } from "react";

interface EmailCollectorBlockProps {
  title: string;
  buttonText: string;
  placeholder: string;
  textClass?: string;
  textStyle?: React.CSSProperties;
}

export function EmailCollectorBlock({ title, buttonText, placeholder, textClass, textStyle }: EmailCollectorBlockProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // Store in localStorage as a simple collection mechanism
    try {
      const existing = JSON.parse(localStorage.getItem("linkself_emails") || "[]") as string[];
      existing.push(email);
      localStorage.setItem("linkself_emails", JSON.stringify(existing));
    } catch {
      // Ignore storage errors
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="w-full text-center py-4">
        <p className={`text-sm font-medium ${textClass || ""}`} style={textStyle}>
          Thanks for subscribing!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <p className={`text-sm font-medium mb-3 text-center ${textClass || ""}`} style={textStyle}>{title}</p>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          className="flex-1 rounded-lg border border-current/20 bg-white/10 px-3 py-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          style={textStyle}
        />
        <button
          type="submit"
          className="rounded-lg bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors border border-current/20"
          style={textStyle}
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
}
