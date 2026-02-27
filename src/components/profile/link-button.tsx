import { cn } from "@/lib/cn";

interface LinkButtonProps {
  linkId: number;
  title: string;
  icon?: string;
  cardClass: string;
  className?: string;
}

export function LinkButton({ linkId, title, icon, cardClass, className }: LinkButtonProps) {
  const isPreview = linkId === 0;

  if (isPreview) {
    return (
      <div
        className={cn(
          "block w-full rounded-xl px-6 py-4 text-center font-medium transition-all duration-200",
          cardClass,
          className
        )}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </div>
    );
  }

  return (
    <a
      href={`/api/click/${linkId}`}
      className={cn(
        "block w-full rounded-xl px-6 py-4 text-center font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
        cardClass,
        className
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </a>
  );
}
