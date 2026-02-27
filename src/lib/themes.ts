export interface Theme {
  id: string;
  name: string;
  bgClass: string;
  cardClass: string;
  textClass: string;
  avatarClass: string;
  footerClass: string;
  preview: { bg: string; card: string; text: string };
}

export const themes: Record<string, Theme> = {
  default: {
    id: "default",
    name: "Default",
    bgClass: "bg-white",
    cardClass: "bg-indigo-600 text-white hover:bg-indigo-700 border-0",
    textClass: "text-slate-900",
    avatarClass: "ring-4 ring-indigo-200",
    footerClass: "text-slate-600",
    preview: { bg: "#ffffff", card: "#4f46e5", text: "#0f172a" },
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    bgClass: "bg-[#0f172a]",
    cardClass: "bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20 border border-cyan-500/30",
    textClass: "text-white",
    avatarClass: "ring-4 ring-cyan-500/40",
    footerClass: "text-slate-400",
    preview: { bg: "#0f172a", card: "#164e63", text: "#ffffff" },
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    bgClass: "bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600",
    cardClass: "bg-white/20 text-white hover:bg-white/30 border border-white/20 backdrop-blur-sm",
    textClass: "text-white",
    avatarClass: "ring-4 ring-white/40",
    footerClass: "text-white/70",
    preview: { bg: "#f97316", card: "#ffffff33", text: "#ffffff" },
  },
  forest: {
    id: "forest",
    name: "Forest",
    bgClass: "bg-[#064e3b]",
    cardClass: "bg-emerald-400/20 text-emerald-50 hover:bg-emerald-400/30 border border-emerald-400/30",
    textClass: "text-emerald-50",
    avatarClass: "ring-4 ring-emerald-400/40",
    footerClass: "text-emerald-300/60",
    preview: { bg: "#064e3b", card: "#34d39933", text: "#ecfdf5" },
  },
  neon: {
    id: "neon",
    name: "Neon",
    bgClass: "bg-black",
    cardClass: "bg-transparent text-[#39ff14] hover:bg-[#39ff14]/10 border border-[#39ff14]/60 shadow-[0_0_12px_rgba(57,255,20,0.3)]",
    textClass: "text-[#39ff14]",
    avatarClass: "ring-4 ring-[#39ff14]/50",
    footerClass: "text-[#39ff14]/70",
    preview: { bg: "#000000", card: "#39ff1433", text: "#39ff14" },
  },
  pastel: {
    id: "pastel",
    name: "Pastel",
    bgClass: "bg-violet-100",
    cardClass: "bg-gradient-to-r from-pink-300 to-blue-300 text-white hover:from-pink-400 hover:to-blue-400 border-0",
    textClass: "text-violet-900",
    avatarClass: "ring-4 ring-pink-300/50",
    footerClass: "text-violet-400",
    preview: { bg: "#ede9fe", card: "#f9a8d4", text: "#4c1d95" },
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    bgClass: "bg-white",
    cardClass: "bg-white text-black hover:bg-gray-100 border border-gray-200",
    textClass: "text-black",
    avatarClass: "ring-2 ring-gray-200",
    footerClass: "text-gray-500",
    preview: { bg: "#ffffff", card: "#f3f4f6", text: "#000000" },
  },
  glass: {
    id: "glass",
    name: "Glass",
    bgClass: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
    cardClass: "bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md",
    textClass: "text-white",
    avatarClass: "ring-4 ring-white/20",
    footerClass: "text-white/70",
    preview: { bg: "#1e1b4b", card: "#ffffff1a", text: "#ffffff" },
  },
};

export function getTheme(id: string): Theme {
  return themes[id] ?? themes.default;
}

export const themeList = Object.values(themes);
