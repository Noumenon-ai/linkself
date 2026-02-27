"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Link as LinkIcon,
  Check,
  X,
  Zap,
  Crown,
  Building2,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  PLAN DATA                                                          */
/* ------------------------------------------------------------------ */

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started",
    icon: Zap,
    cta: "Get Started",
    ctaHref: "/register",
    highlight: false,
    features: [
      { text: "5 links", included: true },
      { text: "5 basic themes", included: true },
      { text: "Basic analytics (7 days)", included: true },
      { text: "Social icons (5 max)", included: true },
      { text: "LinkSelf branding", included: true },
      { text: "All 21 themes", included: false },
      { text: "Custom CSS", included: false },
      { text: "Link scheduling", included: false },
      { text: "SEO controls", included: false },
      { text: "Advanced block types", included: false },
      { text: "Custom domain", included: false },
    ],
  },
  {
    name: "Pro",
    price: { monthly: 9, yearly: 86 },
    description: "For creators who want it all",
    icon: Crown,
    cta: "Upgrade to Pro",
    ctaHref: "/api/stripe/checkout?plan=pro",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "Unlimited links", included: true },
      { text: "All 21 themes", included: true },
      { text: "Full analytics (30 days)", included: true },
      { text: "Unlimited social icons", included: true },
      { text: "No branding", included: true },
      { text: "Custom CSS", included: true },
      { text: "Link scheduling", included: true },
      { text: "All block types (embeds, email collector, countdown, FAQ, gallery, testimonials, map)", included: true },
      { text: "SEO controls", included: true },
      { text: "UTM builder", included: true },
      { text: "Video & pattern backgrounds", included: true },
      { text: "Link animations", included: true },
      { text: "Pinned links", included: true },
      { text: "Custom domain", included: false },
      { text: "Google Analytics integration", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Business",
    price: { monthly: 29, yearly: 278 },
    description: "For brands and businesses",
    icon: Building2,
    cta: "Upgrade to Business",
    ctaHref: "/api/stripe/checkout?plan=business",
    highlight: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Analytics (90 days)", included: true },
      { text: "Google Analytics integration", included: true },
      { text: "Facebook & TikTok Pixel", included: true },
      { text: "Password-protected pages", included: true },
      { text: "Custom domain support", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated amount for the rest of your billing cycle. Downgrades take effect at the end of your current billing period.",
  },
  {
    q: "What happens when I downgrade to Free?",
    a: "Your existing links will remain, but you'll only be able to have 5 active links. Any extra links will be hidden (not deleted). Premium themes and features will be disabled until you upgrade again.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not happy, just reach out and we'll refund your payment, no questions asked.",
  },
  {
    q: "Is there a yearly discount?",
    a: "Yes! When you choose yearly billing, you save 20% compared to monthly billing. That's like getting over 2 months free.",
  },
  {
    q: "Can I use my own custom domain?",
    a: "Custom domains are available on the Business plan. You can point your own domain (like links.yourbrand.com) to your LinkSelf page.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, American Express) through Stripe. All payments are securely processed.",
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENTS                                                         */
/* ------------------------------------------------------------------ */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-700/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-base font-medium text-slate-900 dark:text-white pr-4">
          {q}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-40 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {a}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

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
              Link<span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">Self</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
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

      <main className="pt-28 pb-20">
        {/* ---- HEADER ---- */}
        <section className="px-6 text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 dark:border-cyan-800/40 bg-cyan-50/80 dark:bg-cyan-950/30 px-4 py-1.5 text-sm text-cyan-700 dark:text-cyan-300 mb-6">
            <Zap className="h-3.5 w-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Choose your{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              plan
            </span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>

          {/* Monthly/Yearly toggle */}
          <div className="mt-10 inline-flex items-center gap-4 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1.5">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                !yearly
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                yearly
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Yearly
              <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Save 20%
              </span>
            </button>
          </div>
        </section>

        {/* ---- PRICING CARDS ---- */}
        <section className="px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {plans.map((plan) => {
              const price = yearly ? plan.price.yearly : plan.price.monthly;
              const perMonth = yearly && plan.price.yearly > 0
                ? Math.round((plan.price.yearly / 12) * 100) / 100
                : plan.price.monthly;
              const interval = yearly ? "/yr" : "/mo";
              const ctaHref =
                plan.ctaHref.startsWith("/api/stripe")
                  ? `${plan.ctaHref}&interval=${yearly ? "yearly" : "monthly"}`
                  : plan.ctaHref;

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                    plan.highlight
                      ? "border-transparent bg-white dark:bg-slate-900 shadow-2xl shadow-cyan-500/10 ring-2 ring-cyan-500/50 dark:ring-cyan-400/30 scale-[1.02] md:scale-105 z-10"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm hover:shadow-lg"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25">
                        <Crown className="h-3 w-3" />
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        plan.highlight
                          ? "bg-gradient-to-br from-cyan-500 to-violet-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <plan.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                        ${price === 0 ? "0" : yearly ? perMonth.toFixed(0) : price}
                      </span>
                      {price > 0 && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          /mo
                        </span>
                      )}
                    </div>
                    {yearly && price > 0 && (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        ${plan.price.yearly}{interval} billed annually
                        <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          Save ${plan.price.monthly * 12 - plan.price.yearly}/yr
                        </span>
                      </p>
                    )}
                    {!yearly && price === 0 && (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Free forever
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href={ctaHref}
                    className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-300 mb-8 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-0.5"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {plan.cta}
                    {plan.highlight && (
                      <ArrowRight className="inline-block ml-2 h-4 w-4" />
                    )}
                  </Link>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.text}
                        className="flex items-start gap-3 text-sm"
                      >
                        {feature.included ? (
                          <Check className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                        ) : (
                          <X className="h-4 w-4 mt-0.5 shrink-0 text-slate-300 dark:text-slate-600" />
                        )}
                        <span
                          className={
                            feature.included
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-400 dark:text-slate-600"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---- FAQ ---- */}
        <section className="px-6 mt-24 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Everything you need to know about our pricing.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 md:p-8">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>

        {/* ---- BOTTOM CTA ---- */}
        <section className="px-6 mt-24 max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-600 px-8 py-16 md:px-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/3 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to grow your audience?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto">
                Start with our free plan and upgrade when you need more power.
              </p>
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
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
                Link<span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">Self</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
              <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-slate-900 dark:text-white">Pricing</Link>
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
