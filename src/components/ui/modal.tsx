"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className={cn("w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800 animate-slide-up", className)}>
        <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
