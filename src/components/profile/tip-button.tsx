interface TipButtonProps {
  text: string;
  url: string;
  className?: string;
}

export function TipButton({ text, url, className }: TipButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-amber-400/50 bg-amber-400/10 px-5 py-3.5 text-sm font-semibold text-amber-300 transition-all duration-200 hover:border-amber-400 hover:bg-amber-400/20 hover:text-amber-200 ${className || ""}`}
    >
      <span className="transition-transform group-hover:scale-110">&#x1F49B;</span>
      <span>{text}</span>
    </a>
  );
}
