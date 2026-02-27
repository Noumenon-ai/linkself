import Link from "next/link";
import { Link as LinkIcon } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-violet-50/20 dark:from-slate-950 dark:via-cyan-950/20 dark:to-violet-950/15" />

      {/* Ambient blobs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-400/8 dark:bg-cyan-400/5 blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-400/8 dark:bg-violet-400/5 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-gradient-to-r from-cyan-500/3 to-violet-500/3 blur-[80px]" />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <LinkIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            Link<span className="gradient-text">Self</span>
          </span>
        </Link>

        {/* Tagline */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8">
          Your links. Your brand. Your page.
        </p>

        {/* Content */}
        {children}
      </div>
    </main>
  );
}
