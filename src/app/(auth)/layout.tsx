import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <Link href="/" className="mb-8 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
        LinkSelf
      </Link>
      <div className="w-full max-w-md">
        {children}
      </div>
    </main>
  );
}
