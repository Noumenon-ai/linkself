"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Type, Minus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkForm, type LinkFormData } from "@/components/dashboard/link-form";
import { LinkListItem } from "@/components/dashboard/link-list-item";
import { SocialIconForm } from "@/components/dashboard/social-icon-form";
import { apiFetch } from "@/lib/api-client";
import type { LinkRow, SocialIconRow } from "@/lib/db/schema";
import { Trash2 } from "lucide-react";

type AddFormType = "link" | "header" | "divider" | "embed" | null;

export default function LinksPage() {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [socialIcons, setSocialIcons] = useState<SocialIconRow[]>([]);
  const [showAddForm, setShowAddForm] = useState<AddFormType>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [linksData, iconsData] = await Promise.all([
      apiFetch<{ links: LinkRow[] }>("/api/links"),
      apiFetch<{ icons: SocialIconRow[] }>("/api/social-icons"),
    ]);
    setLinks(linksData.links);
    setSocialIcons(iconsData.icons);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAddLink(data: LinkFormData) {
    await apiFetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowAddForm(null);
    fetchData();
  }

  async function handleUpdateLink(id: number, data: Record<string, unknown>) {
    await apiFetch(`/api/links/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchData();
  }

  async function handleDeleteLink(id: number) {
    await apiFetch(`/api/links/${id}`, { method: "DELETE" });
    fetchData();
  }

  async function handleMoveLink(index: number, direction: "up" | "down") {
    const newLinks = [...links];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newLinks.length) return;
    [newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]];
    setLinks(newLinks);
    await apiFetch("/api/links/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkIds: newLinks.map((l) => l.id) }),
    });
  }

  async function handleAddSocial(data: { platform: string; url: string }) {
    await apiFetch("/api/social-icons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchData();
  }

  async function handleDeleteSocial(id: number) {
    await apiFetch(`/api/social-icons/${id}`, { method: "DELETE" });
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Links</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddForm(showAddForm === "link" ? null : "link")}>
            <Plus className="h-4 w-4" /> Add Link
          </Button>
          <Button variant="secondary" onClick={() => setShowAddForm(showAddForm === "header" ? null : "header")}>
            <Type className="h-4 w-4" /> Header
          </Button>
          <Button variant="secondary" onClick={() => setShowAddForm(showAddForm === "divider" ? null : "divider")}>
            <Minus className="h-4 w-4" /> Divider
          </Button>
          <Button variant="secondary" onClick={() => setShowAddForm(showAddForm === "embed" ? null : "embed")}>
            <Play className="h-4 w-4" /> Embed
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:bg-slate-800 dark:border-slate-700">
          <LinkForm
            linkType={showAddForm}
            onSave={handleAddLink}
            onCancel={() => setShowAddForm(null)}
          />
        </div>
      )}

      <div className="space-y-2">
        {links.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
            <p className="text-slate-600 dark:text-slate-300">No links yet. Add your first one above.</p>
          </div>
        ) : (
          links.map((link, i) => (
            <LinkListItem
              key={link.id}
              link={link}
              onUpdate={handleUpdateLink}
              onDelete={handleDeleteLink}
              onMoveUp={i > 0 ? () => handleMoveLink(i, "up") : undefined}
              onMoveDown={i < links.length - 1 ? () => handleMoveLink(i, "down") : undefined}
            />
          ))
        )}
      </div>

      {/* Social Icons Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Social Icons</h2>

        {socialIcons.length > 0 && (
          <div className="space-y-2">
            {socialIcons.map((icon) => (
              <div key={icon.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:bg-slate-800 dark:border-slate-700">
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{icon.platform}</span>
                  <span className="ml-2 text-sm text-slate-500 dark:text-slate-400 truncate">{icon.url}</span>
                </div>
                <button onClick={() => handleDeleteSocial(icon.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <SocialIconForm onSave={handleAddSocial} />
      </div>
    </div>
  );
}
