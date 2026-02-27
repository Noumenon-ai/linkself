"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
      <p className="text-slate-600 dark:text-slate-400">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
