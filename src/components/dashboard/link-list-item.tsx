"use client";

import { useState } from "react";
import { GripVertical, Pencil, Trash2, Eye, EyeOff, ExternalLink, Clock, Calendar, Pin } from "lucide-react";
import type { LinkRow } from "@/lib/db/schema";
import { LinkForm } from "./link-form";
import { cn } from "@/lib/cn";

type LinkType = "link" | "header" | "divider" | "embed" | "email-collector" | "countdown" | "contact-form" | "faq" | "image-gallery" | "testimonial" | "map";

interface LinkListItemProps {
  link: LinkRow;
  onUpdate: (id: number, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function formatScheduleDate(dateStr: string): string {
  if (!dateStr || dateStr.trim() === "") return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function getScheduleStatus(link: LinkRow): { label: string; color: string } | null {
  const now = new Date();
  const hasStart = link.scheduled_start && link.scheduled_start.trim() !== "";
  const hasEnd = link.scheduled_end && link.scheduled_end.trim() !== "";

  if (hasStart && new Date(link.scheduled_start) > now) {
    return { label: `Goes live ${formatScheduleDate(link.scheduled_start)}`, color: "text-amber-600 dark:text-amber-400" };
  }
  if (hasEnd && new Date(link.scheduled_end) < now) {
    return { label: `Expired ${formatScheduleDate(link.scheduled_end)}`, color: "text-red-500 dark:text-red-400" };
  }
  if (hasEnd) {
    return { label: `Expires ${formatScheduleDate(link.scheduled_end)}`, color: "text-blue-500 dark:text-blue-400" };
  }
  if (hasStart) {
    return { label: `Live since ${formatScheduleDate(link.scheduled_start)}`, color: "text-green-500 dark:text-green-400" };
  }
  return null;
}

const BLOCK_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  embed: { label: "Embed", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  "email-collector": { label: "Email Collector", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
  countdown: { label: "Countdown", bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400" },
  "contact-form": { label: "Contact Form", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  faq: { label: "FAQ", bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  "image-gallery": { label: "Gallery", bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400" },
  testimonial: { label: "Testimonial", bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400" },
  map: { label: "Map", bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-600 dark:text-teal-400" },
};

export function LinkListItem({ link, onUpdate, onDelete, onMoveUp, onMoveDown }: LinkListItemProps) {
  const [editing, setEditing] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledStart, setScheduledStart] = useState(link.scheduled_start || "");
  const [scheduledEnd, setScheduledEnd] = useState(link.scheduled_end || "");
  const [savingSchedule, setSavingSchedule] = useState(false);

  const scheduleStatus = getScheduleStatus(link);
  const hasSchedule = (link.scheduled_start && link.scheduled_start.trim() !== "") ||
    (link.scheduled_end && link.scheduled_end.trim() !== "");

  async function handleSaveSchedule() {
    setSavingSchedule(true);
    try {
      await onUpdate(link.id, {
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
      });
      setShowSchedule(false);
    } finally {
      setSavingSchedule(false);
    }
  }

  async function handleClearSchedule() {
    setSavingSchedule(true);
    try {
      await onUpdate(link.id, { scheduled_start: "", scheduled_end: "" });
      setScheduledStart("");
      setScheduledEnd("");
      setShowSchedule(false);
    } finally {
      setSavingSchedule(false);
    }
  }

  const linkType = (link.link_type || "link") as LinkType;

  if (editing) {
    return (
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:bg-indigo-900/20 dark:border-indigo-800">
        <LinkForm
          initial={{
            title: link.title,
            url: link.url,
            icon: link.icon,
            link_type: linkType,
            embed_url: link.embed_url || "",
            nsfw: link.nsfw === 1,
            block_config: link.block_config || "",
            thumbnail_url: link.thumbnail_url || "",
            utm_source: link.utm_source || "",
            utm_medium: link.utm_medium || "",
            utm_campaign: link.utm_campaign || "",
          }}
          linkType={linkType}
          onSave={async (data) => {
            await onUpdate(link.id, data as unknown as Record<string, unknown>);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  // Divider rendering
  if (linkType === "divider") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 group">
        <div className="flex items-center gap-3 p-4">
          <div className="flex flex-col gap-0.5">
            {onMoveUp && <button onClick={onMoveUp} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-colors" aria-label="Move up">&#9650;</button>}
            <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600" aria-hidden="true" />
            {onMoveDown && <button onClick={onMoveDown} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-colors" aria-label="Move down">&#9660;</button>}
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 border-t border-slate-300 dark:border-slate-600" />
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Divider</span>
            <div className="flex-1 border-t border-slate-300 dark:border-slate-600" />
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onDelete(link.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Delete divider">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Header rendering
  if (linkType === "header") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 group">
        <div className="flex items-center gap-3 p-4">
          <div className="flex flex-col gap-0.5">
            {onMoveUp && <button onClick={onMoveUp} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-colors" aria-label="Move up">&#9650;</button>}
            <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600" aria-hidden="true" />
            {onMoveDown && <button onClick={onMoveDown} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-colors" aria-label="Move down">&#9660;</button>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {link.icon && <span>{link.icon}</span>}
              <span className="font-bold text-slate-900 dark:text-white">{link.title}</span>
              <span className="inline-flex items-center rounded bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">Header</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500" aria-label="Edit header">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(link.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Delete header">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Badge for block types
  const badge = BLOCK_BADGES[linkType];

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 group">
      <div className="flex items-center gap-3 p-4">
        <div className="flex flex-col gap-0.5">
          {onMoveUp && <button onClick={onMoveUp} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-colors" aria-label="Move link up">&#9650;</button>}
          <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600" aria-hidden="true" />
          {onMoveDown && <button onClick={onMoveDown} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-colors" aria-label="Move link down">&#9660;</button>}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {link.icon && <span>{link.icon}</span>}
            <span className={cn("font-medium text-slate-900 dark:text-white truncate", !link.is_active && "opacity-50")}>
              {link.title}
            </span>
            {badge && (
              <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", badge.bg, badge.text)}>
                {badge.label}
              </span>
            )}
            {link.nsfw === 1 && (
              <span className="inline-flex items-center rounded bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:text-red-400">18+</span>
            )}
            {link.is_pinned === 1 && (
              <Pin className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0 fill-current" />
            )}
            {hasSchedule && (
              <Clock className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{linkType === "embed" ? (link.embed_url || link.url) : link.url || (badge ? badge.label + " block" : "")}</p>
          {scheduleStatus && (
            <p className={cn("text-xs mt-0.5 flex items-center gap-1", scheduleStatus.color)}>
              <Calendar className="h-3 w-3" />
              {scheduleStatus.label}
            </p>
          )}
        </div>

        <span className="text-sm text-slate-600 dark:text-slate-400 tabular-nums">{link.clicks} clicks</span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onUpdate(link.id, { is_pinned: !link.is_pinned })}
            className={cn(
              "p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors",
              link.is_pinned ? "text-indigo-500" : "text-slate-500"
            )}
            aria-label={link.is_pinned ? "Unpin link" : "Pin link"}
            title={link.is_pinned ? "Unpin link" : "Pin to top"}
          >
            <Pin className={cn("h-4 w-4", link.is_pinned && "fill-current")} />
          </button>
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className={cn(
              "p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors",
              hasSchedule ? "text-amber-500" : "text-slate-500"
            )}
            aria-label="Schedule link"
            title="Schedule link"
          >
            <Clock className="h-4 w-4" />
          </button>
          <button
            onClick={() => onUpdate(link.id, { is_active: !link.is_active })}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
            aria-label={link.is_active ? "Hide link" : "Show link"}
          >
            {link.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          {linkType === "link" && link.url && (
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
              aria-label="Open link in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500" aria-label="Edit link">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(link.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Delete link">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Schedule panel */}
      {showSchedule && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Schedule</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Go live at</label>
              <input
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Expire at</label>
              <input
                type="datetime-local"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleSaveSchedule}
              disabled={savingSchedule}
              className="rounded-lg bg-cyan-600 hover:bg-cyan-700 px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50"
            >
              {savingSchedule ? "Saving..." : "Save Schedule"}
            </button>
            {hasSchedule && (
              <button
                onClick={handleClearSchedule}
                disabled={savingSchedule}
                className="rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
              >
                Clear Schedule
              </button>
            )}
            <button
              onClick={() => setShowSchedule(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
