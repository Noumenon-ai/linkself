"use client";

import { useEffect, useState } from "react";
import { Download, QrCode } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

type QrSize = "200" | "300" | "500";

const SIZE_OPTIONS: { value: QrSize; label: string }[] = [
  { value: "200", label: "Small (200x200)" },
  { value: "300", label: "Medium (300x300)" },
  { value: "500", label: "Large (500x500)" },
];

export default function QrCodePage() {
  const [username, setUsername] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState<QrSize>("300");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiFetch<{ username: string; display_name: string }>("/api/auth/me");
        setUsername(data.username);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const profileUrl = username ? `https://linkself-black.vercel.app/${username}` : "";

  // QR server API uses hex without #
  const fgHex = fgColor.replace("#", "");
  const bgHex = bgColor.replace("#", "");
  const qrUrl = profileUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(profileUrl)}&color=${fgHex}&bgcolor=${bgHex}&format=png`
    : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">QR Code</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Generate a QR code for your LinkSelf profile. Share it on business cards, flyers, or social media.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview */}
        <div className="flex flex-col items-center gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-8 shadow-sm">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt={`QR code for ${profileUrl}`}
                width={parseInt(size)}
                height={parseInt(size)}
                className="rounded-lg"
              />
            ) : (
              <div className="flex h-[300px] w-[300px] items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                <QrCode className="h-16 w-16 text-slate-300 dark:text-slate-500" />
              </div>
            )}
          </div>

          {profileUrl && (
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Encodes:</p>
              <code className="rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 font-mono">
                {profileUrl}
              </code>
            </div>
          )}

          {qrUrl && (
            <a
              href={qrUrl}
              download={`linkself-qr-${username}.png`}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2.5 text-sm font-medium text-white transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              Download QR Code
            </a>
          )}
        </div>

        {/* Customization */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Customize</h2>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Size</label>
              <div className="flex gap-2">
                {SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSize(opt.value)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border transition-all ${
                      size === opt.value
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-600"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Foreground Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Foreground Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Reset Colors */}
            <button
              onClick={() => { setFgColor("#000000"); setBgColor("#ffffff"); }}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Reset to default colors
            </button>
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tips</h3>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li>Use high contrast colors for best scanning results</li>
              <li>The large size works best for print materials</li>
              <li>Test your QR code with a phone camera before printing</li>
              <li>Avoid light foreground colors on light backgrounds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
