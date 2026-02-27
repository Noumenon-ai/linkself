import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardNav username={session.username} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              linkself.com/<span className="font-medium text-slate-900 dark:text-white">{session.username}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
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
