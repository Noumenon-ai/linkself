import { cn } from "@/lib/cn";

interface AvatarProps {
  src?: string | null;
  name: string;
  ringClass?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-20 w-20 text-xl",
  lg: "h-24 w-24 text-2xl",
};

export function Avatar({ src, name, ringClass, size = "lg", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("rounded-full overflow-hidden flex-shrink-0", ringClass, sizeClasses[size], className)}>
      {src ? (
        <img src={src} alt={`${name}'s avatar`} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white" role="img" aria-label={`${name}'s avatar`}>
          {initials}
        </div>
      )}
    </div>
  );
}
