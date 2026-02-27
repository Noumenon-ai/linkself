import Link from "next/link";
import dynamic from "next/dynamic";
import { Link as LinkIcon, BarChart3, Palette, Zap, Globe, Smartphone } from "lucide-react";

const ThemeToggle = dynamic(
  () => import("@/components/ui/theme-toggle").then((m) => ({ default: m.ThemeToggle })),
  { ssr: false, loading: () => <div className="h-9 w-9" /> }
);

const features = [
  { icon: LinkIcon, title: "Unlimited Links", desc: "Add all your important links in one beautiful page" },
  { icon: BarChart3, title: "Click Analytics", desc: "Track who clicks what, from where, on what device" },
  { icon: Palette, title: "8 Stunning Themes", desc: "From minimal to neon — pick your vibe instantly" },
  { icon: Zap, title: "Blazing Fast", desc: "SQLite-powered. No cold starts. Sub-100ms page loads" },
  { icon: Globe, title: "Self-Hostable", desc: "Own your data. Run it on your own server" },
  { icon: Smartphone, title: "Mobile-First", desc: "Looks perfect on every screen, every time" },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["5 links", "Basic themes", "Click tracking", "Social icons"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$5",
    period: "/month",
    features: ["Unlimited links", "All 8 themes", "Custom CSS", "Priority links", "Full analytics", "Remove branding"],
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Business",
    price: "$15",
    period: "/month",
    features: ["Everything in Pro", "Custom domain", "API access", "Team support", "White-label"],
    cta: "Contact Us",
    featured: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Nav */}
      <header>
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">LinkSelf</span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Sign Up Free
          </Link>
        </div>
      </nav>
      </header>

      <main>
      {/* Hero */}
      <section className="px-6 py-20 md:py-32 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            One Link.
          </span>
          <br />
          <span className="text-slate-900 dark:text-white">Every Connection.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Create a beautiful link-in-bio page in seconds. Share all your links, track clicks,
          and own your online presence.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
          >
            Claim Your Link — Free
          </Link>
          <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200">
            See how it works &darr;
          </Link>
        </div>

        {/* Demo preview */}
        <div className="mt-16 mx-auto max-w-xs">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white ring-4 ring-white/20">
                LS
              </div>
              <div className="text-center">
                <p className="font-bold text-white">LinkSelf Demo</p>
                <p className="text-sm text-white/90">Creator & Developer</p>
              </div>
              <div className="w-full space-y-2.5">
                {["My Portfolio", "Latest Blog Post", "YouTube Channel"].map((text) => (
                  <div key={text} className="w-full rounded-xl bg-white/10 border border-white/10 backdrop-blur-md px-4 py-3 text-center text-sm font-medium text-white hover:bg-white/20 transition-colors cursor-default">
                    {text}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/80 mt-2">Powered by LinkSelf</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
          Everything you need. Nothing you don&apos;t.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
              <f.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Sign Up", desc: "Create your account and claim your unique username" },
              { step: "2", title: "Add Links", desc: "Add your website, social profiles, and anything else" },
              { step: "3", title: "Share", desc: "Share your linkself.com/you URL everywhere" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">Simple Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.featured
                  ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl scale-105"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              {plan.featured && (
                <span className="mb-4 self-start rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <svg className="h-4 w-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.featured
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-300">LinkSelf</span>
          <span className="text-sm text-slate-600 dark:text-slate-300">Your links. Your brand. Your page.</span>
        </div>
      </footer>
    </div>
  );
}
