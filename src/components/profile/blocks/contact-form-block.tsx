"use client";

import { useState } from "react";

interface ContactFormBlockProps {
  title: string;
  email: string;
  textClass?: string;
  textStyle?: React.CSSProperties;
}

export function ContactFormBlock({ title, email, textClass, textStyle }: ContactFormBlockProps) {
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Use mailto as a simple fallback
    const subject = encodeURIComponent(`Message from ${name}`);
    const body = encodeURIComponent(`From: ${name} (${senderEmail})\n\n${message}`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="w-full text-center py-4">
        <p className={`text-sm font-medium ${textClass || ""}`} style={textStyle}>
          Message sent! Check your email client.
        </p>
      </div>
    );
  }

  const inputClass = "w-full rounded-lg border border-current/20 bg-white/10 px-3 py-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30";

  return (
    <div className="w-full py-2">
      <p className={`text-sm font-medium mb-3 text-center ${textClass || ""}`} style={textStyle}>{title}</p>
      <form onSubmit={handleSubmit} className="space-y-2 max-w-sm mx-auto">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className={inputClass}
          style={textStyle}
        />
        <input
          type="email"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          placeholder="Your email"
          required
          className={inputClass}
          style={textStyle}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message"
          rows={3}
          required
          className={`${inputClass} resize-y`}
          style={textStyle}
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors border border-current/20"
          style={textStyle}
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
