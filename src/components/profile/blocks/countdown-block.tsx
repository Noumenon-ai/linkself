"use client";

import { useEffect, useState } from "react";

interface CountdownBlockProps {
  title: string;
  targetDate: string;
  textClass?: string;
  textStyle?: React.CSSProperties;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calcTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function CountdownBlock({ title, targetDate, textClass, textStyle }: CountdownBlockProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="w-full text-center py-4">
      <p className={`text-sm font-medium mb-3 ${textClass || ""}`} style={textStyle}>{title}</p>
      {timeLeft.expired ? (
        <p className={`text-lg font-bold ${textClass || ""}`} style={textStyle}>Event has started!</p>
      ) : (
        <div className="flex justify-center gap-3">
          {[
            { value: timeLeft.days, label: "Days" },
            { value: timeLeft.hours, label: "Hours" },
            { value: timeLeft.minutes, label: "Min" },
            { value: timeLeft.seconds, label: "Sec" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <span
                className={`text-2xl sm:text-3xl font-bold tabular-nums ${textClass || ""}`}
                style={textStyle}
              >
                {pad(value)}
              </span>
              <span className="text-[10px] uppercase tracking-wider opacity-60" style={textStyle}>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
