import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { getPlan, isAdmin } from "@/lib/plans";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  // Fetch user plan for dashboard-wide display
  const userRow = await queryOne<{ plan: string; username: string }>(
    "SELECT plan, username FROM users WHERE id = ?",
    session.userId
  );
  const effectivePlan = isAdmin(userRow?.username ?? "") ? "business" : (userRow?.plan ?? "free");
  const plan = getPlan(effectivePlan);

  const planBadgeColors: Record<string, string> = {
    free: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    pro: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    business: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardNav username={session.username} plan={plan.id} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              linkself.com/<span className="font-medium text-slate-900 dark:text-white">{session.username}</span>
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${planBadgeColors[plan.id] ?? planBadgeColors.free}`}>
              {plan.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {plan.id === "free" && (
              <a
                href="/pricing"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 transition-colors"
              >
                Upgrade
              </a>
            )}
            <a
              href={`/${session.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-900/20 transition-colors"
            >
              View Page
            </a>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-6 pb-24 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
