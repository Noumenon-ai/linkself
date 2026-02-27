import type { SocialIconRow } from "@/lib/db/schema";
import {
  Github, Twitter, Instagram, Youtube, Linkedin,
  Globe, Music, MessageCircle, Mail,
} from "lucide-react";
import { cn } from "@/lib/cn";

const platformIcons: Record<string, React.ElementType> = {
  github: Github,
  twitter: Twitter,
  x: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: Music,
  discord: MessageCircle,
  email: Mail,
  website: Globe,
};

interface SocialIconsRowProps {
  icons: SocialIconRow[];
  textClass?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SocialIconsRow({ icons, textClass, className, style }: SocialIconsRowProps) {
  if (icons.length === 0) return null;

  return (
    <div className={cn("flex items-center justify-center gap-3", className)} style={style}>
      {icons.map((icon) => {
        const Icon = platformIcons[icon.platform.toLowerCase()] ?? Globe;
        return (
          <a
            key={icon.id}
            href={icon.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 opacity-70 hover:opacity-100",
              textClass
            )}
            aria-label={icon.platform}
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}
