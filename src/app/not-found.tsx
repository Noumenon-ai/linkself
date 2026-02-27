import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-slate-300 dark:text-slate-700">404</h1>
      <p className="text-slate-600 dark:text-slate-400">Page not found</p>
      <Link href="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
        Go home
      </Link>
    </div>
  );
}
