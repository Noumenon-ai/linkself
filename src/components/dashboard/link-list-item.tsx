"use client";

import { useState } from "react";
import { GripVertical, Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import type { LinkRow } from "@/lib/db/schema";
import { LinkForm } from "./link-form";
import { cn } from "@/lib/cn";

interface LinkListItemProps {
  link: LinkRow;
  onUpdate: (id: number, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function LinkListItem({ link, onUpdate, onDelete, onMoveUp, onMoveDown }: LinkListItemProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:bg-indigo-900/20 dark:border-indigo-800">
        <LinkForm
          initial={{ title: link.title, url: link.url, icon: link.icon }}
          onSave={async (data) => {
            await onUpdate(link.id, data);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:bg-slate-800 dark:border-slate-700 group">
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
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{link.url}</p>
      </div>

      <span className="text-sm text-slate-600 dark:text-slate-400 tabular-nums">{link.clicks} clicks</span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onUpdate(link.id, { is_active: !link.is_active })}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
          aria-label={link.is_active ? "Hide link" : "Show link"}
        >
          {link.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
          aria-label="Open link in new tab"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <button onClick={() => setEditing(true)} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500" aria-label="Edit link">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={() => onDelete(link.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Delete link">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
