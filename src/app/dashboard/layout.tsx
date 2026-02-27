import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { LogoutButton } from "@/components/layout/logout-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardNav />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              linkself.com/<span className="font-medium text-slate-900 dark:text-white">{session.username}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/${session.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors"
            >
              View Page
            </a>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 p-6 pb-24 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
