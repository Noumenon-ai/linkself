import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Link as LinkIcon,
  Palette,
  BarChart3,
  Share2,
  Heart,
  Zap,
  UserPlus,
  Sparkles,
  Share,
  ArrowRight,
  Music,
  Camera,
  Briefcase,
  ExternalLink,
  Instagram,
  Youtube,
  Twitter,
  Globe,
} from "lucide-react";

const ThemeToggle = dynamic(
  () => import("@/components/ui/theme-toggle").then((m) => ({ default: m.ThemeToggle })),
  { ssr: false, loading: () => <div className="h-9 w-9" /> }
);

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: LinkIcon,
    title: "Unlimited Links",
    desc: "Add as many links as you want, completely free.",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-500/10 dark:bg-cyan-500/10",
  },
  {
    icon: Palette,
    title: "Full Customization",
    desc: "Themes, fonts, colors, animations — make it yours.",
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-500/10 dark:bg-violet-500/10",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Track every click, see what resonates.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10 dark:bg-blue-500/10",
  },
  {
    icon: Share2,
    title: "Social Icons",
    desc: "Connect all 25+ social platforms.",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-500/10 dark:bg-pink-500/10",
  },
  {
    icon: Heart,
    title: "Tip Jar",
    desc: "Accept tips and donations from your audience.",
    color: "from-rose-500 to-rose-600",
    bgColor: "bg-rose-500/10 dark:bg-rose-500/10",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "No bloat. Your page loads in under a second.",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-500/10 dark:bg-amber-500/10",
  },
];

const steps = [
  {
    icon: UserPlus,
    num: "01",
    title: "Sign up",
    desc: "Create your free account and claim your unique username.",
  },
  {
    icon: Sparkles,
    num: "02",
    title: "Add links & customize",
    desc: "Drop in your links, pick a theme, add your branding.",
  },
  {
    icon: Share,
    num: "03",
    title: "Share everywhere",
    desc: "One link in your bio. Every platform. All your content.",
  },
];

const exampleProfiles = [
  {
    name: "Nova Beat",
    role: "Music Producer",
    avatar: "NB",
    bio: "Making beats that move the world",
    icon: Music,
    links: ["Latest Album", "Spotify", "Tour Dates"],
    outer: "bg-black",
    card: "border border-[#39ff14]/40 text-[#39ff14]",
    text: "text-[#39ff14]",
    accent: "ring-[#39ff14]/30",
    glow: "shadow-[0_0_40px_rgba(57,255,20,0.12)]",
    linkBg: "bg-[#39ff14]/10 border border-[#39ff14]/30",
  },
  {
    name: "Aria Lux",
    role: "Photographer",
    avatar: "AL",
    bio: "Capturing moments, one frame at a time",
    icon: Camera,
    links: ["Portfolio", "Book a Session", "Prints Shop"],
    outer: "bg-white",
    card: "border border-gray-200 text-gray-900",
    text: "text-gray-900",
    accent: "ring-gray-200",
    glow: "shadow-xl",
    linkBg: "bg-gray-50 border border-gray-200",
  },
  {
    name: "Vertex Labs",
    role: "Digital Agency",
    avatar: "VL",
    bio: "Building the future of digital",
    icon: Briefcase,
    links: ["Our Work", "Services", "Contact Us"],
    outer: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
    card: "bg-white/10 border border-white/10 backdrop-blur-md text-white",
    text: "text-white",
    accent: "ring-white/20",
    glow: "shadow-2xl shadow-purple-500/10",
    linkBg: "bg-white/10 border border-white/10 backdrop-blur-sm",
  },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* ---- NAV ---- */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl">
        <nav className="flex items-center justify-between px-6 py-3.5 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <LinkIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Link<span className="gradient-text">Self</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ---- HERO ---- */}
        <section className="relative px-6 pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
          {/* Ambient background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-500/8 dark:bg-cyan-500/5 blur-[100px]" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-500/8 dark:bg-violet-500/5 blur-[100px]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r from-cyan-500/3 to-violet-500/3 blur-[100px]" />
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
              {/* Left: Copy */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 dark:border-cyan-800/40 bg-cyan-50/80 dark:bg-cyan-950/30 px-4 py-1.5 text-sm text-cyan-700 dark:text-cyan-300 mb-8 backdrop-blur-sm">
                  <Zap className="h-3.5 w-3.5" />
                  Free forever. No credit card needed.
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
                  <span className="text-slate-900 dark:text-white">One Link for</span>
                  <br />
                  <span className="gradient-text">Everything</span>
                </h1>

                <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed lg:pr-8">
                  Create your personalized link-in-bio page in seconds. Share all
                  your content, social profiles, and more with a single link.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center">
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="#examples"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    See Examples
                    <span className="text-lg">&darr;</span>
                  </Link>
                </div>
              </div>

              {/* Right: Phone mockup */}
              <div className="flex-shrink-0 animate-float">
                <div className="relative">
                  {/* Phone frame */}
                  <div className="w-[280px] rounded-[2.5rem] border-[8px] border-slate-800 dark:border-slate-600 bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-900 p-6 shadow-2xl">
                    {/* Notch */}
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-1 rounded-full bg-white/20" />
                    </div>

                    {/* Profile content */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center text-lg font-bold text-white ring-4 ring-white/20">
                        LS
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-white text-base">LinkSelf Demo</p>
                        <p className="text-sm text-white/60">Creator & Developer</p>
                      </div>

                      {/* Social icons row */}
                      <div className="flex gap-3">
                        {[Instagram, Youtube, Twitter, Globe].map((Icon, i) => (
                          <div key={i} className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                            <Icon className="h-3.5 w-3.5 text-white/80" />
                          </div>
                        ))}
                      </div>

                      {/* Links */}
                      <div className="w-full space-y-2.5 mt-1">
                        {["My Portfolio", "Latest Blog Post", "YouTube Channel", "Buy Me Coffee"].map((text) => (
                          <div
                            key={text}
                            className="w-full rounded-xl bg-white/10 border border-white/10 backdrop-blur-md px-4 py-3 text-center text-sm font-medium text-white flex items-center justify-center gap-2"
                          >
                            {text}
                            <ExternalLink className="h-3 w-3 text-white/40" />
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] text-white/30 mt-2">linkself.com/demo</p>
                    </div>
                  </div>

                  {/* Glow behind phone */}
                  <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-r from-cyan-500/20 to-violet-500/20 blur-3xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---- FEATURES ---- */}
        <section id="features" className="px-6 py-24 md:py-32 bg-slate-50/80 dark:bg-slate-900/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-3">
                Features
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Everything you need. Nothing you don&apos;t.
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                A powerful link-in-bio platform that stays out of your way.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-7 hover:border-cyan-300/80 dark:hover:border-cyan-800/60 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bgColor} transition-colors`}>
                    <f.icon className="h-5.5 w-5.5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- HOW IT WORKS ---- */}
        <section className="px-6 py-24 md:py-32">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3">
                How it works
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Three steps. That&apos;s it.
              </h2>
            </div>

            <div className="relative">
              {/* Connecting dashed line */}
              <div className="hidden md:block absolute top-[3.5rem] left-[16.67%] right-[16.67%] border-t-2 border-dashed border-slate-300 dark:border-slate-700" />
              <div className="hidden md:block absolute top-[3.5rem] left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-cyan-400/40 via-violet-400/40 to-cyan-400/40 blur-sm" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                {steps.map((s) => (
                  <div key={s.num} className="relative flex flex-col items-center text-center">
                    <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/20 ring-4 ring-white dark:ring-slate-950">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-2">
                      Step {s.num}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-[240px]">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---- EXAMPLE PROFILES ---- */}
        <section id="examples" className="px-6 py-24 md:py-32 bg-slate-50/80 dark:bg-slate-900/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-3">
                Examples
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Made for every creator
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Musicians, photographers, businesses — LinkSelf adapts to your style.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {exampleProfiles.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-3xl ${p.outer} ${p.glow} p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
                >
                  <div className="flex flex-col items-center gap-4">
                    {/* Avatar */}
                    <div
                      className={`h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center text-lg font-bold text-white ring-4 ${p.accent}`}
                    >
                      {p.avatar}
                    </div>

                    {/* Info */}
                    <div className="text-center">
                      <p className={`font-bold text-base ${p.text}`}>{p.name}</p>
                      <div className={`flex items-center gap-1.5 justify-center mt-1 ${p.text} opacity-60`}>
                        <p.icon className="h-3.5 w-3.5" />
                        <span className="text-sm">{p.role}</span>
                      </div>
                      <p className={`text-xs mt-1.5 ${p.text} opacity-40`}>{p.bio}</p>
                    </div>

                    {/* Links */}
                    <div className="w-full space-y-2.5 mt-2">
                      {p.links.map((link) => (
                        <div
                          key={link}
                          className={`w-full rounded-xl px-4 py-2.5 text-center text-sm font-medium ${p.linkBg} ${p.text} transition-all duration-200 cursor-default hover:scale-[1.02]`}
                        >
                          {link}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- CTA ---- */}
        <section className="px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-600 px-8 py-16 md:px-16 md:py-20 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/3 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-white/5 rounded-full blur-3xl" />

              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to stand out?
                </h2>
                <p className="text-lg text-white/80 mb-10 max-w-lg mx-auto leading-relaxed">
                  Join thousands of creators using LinkSelf to share everything they
                  do with a single link.
                </p>
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Create Your Page
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---- FOOTER ---- */}
      <footer className="px-6 py-12 border-t border-slate-200/80 dark:border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                <LinkIcon className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Link<span className="gradient-text">Self</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
              <Link href="#examples" className="hover:text-slate-900 dark:hover:text-white transition-colors">Examples</Link>
              <Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Login</Link>
            </div>

            <p className="text-sm text-slate-400 dark:text-slate-500">
              &copy; 2026 LinkSelf
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
