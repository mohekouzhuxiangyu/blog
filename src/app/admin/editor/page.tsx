"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { readFile, writeFile, frontmatter } from "@/lib/github-api";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import RichEditor from "@/components/RichEditor";

const STORAGE_KEY = "gh_token";

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400 mt-8 text-center py-12">Loading...</div>}>
      <Editor />
    </Suspense>
  );
}

function Editor() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const isEdit = !!slug;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tagsStr, setTagsStr] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!slug) return;
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) return;
    (async () => {
      try {
        const { content } = await readFile(token, `content/${slug}.md`);
        const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (match) {
          const fm = match[1];
          setTitle(fm.match(/title:\s*"(.+?)"/)?.[1] || "");
          setDate((fm.match(/date:\s*(.+)/)?.[1] || "").replace(/T.*$/, ""));
          setTagsStr((fm.match(/tags:\s*\[(.+?)\]/)?.[1] || "").replace(/"/g, ""));
          setBody(match[2].trim());
        }
      } catch {}
    })();
  }, [slug]);

  async function handleSave() {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) { setMsg({ ok: false, text: "Not logged in" }); return; }
    if (!title.trim()) { setMsg({ ok: false, text: "Title is required" }); return; }

    setSaving(true);
    setMsg(null);

    const tags = tagsStr.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
    const s = slug || title.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
    const fullContent = frontmatter(title.trim(), date, tags) + body.trim();
    const path = `content/${s}.md`;
    const commitMsg = isEdit ? `Update post: ${s}` : `New post: ${s}`;

    try {
      let sha: string | undefined;
      if (isEdit) {
        const existing = await readFile(token, path);
        sha = existing.sha;
      }
      await writeFile(token, path, fullContent, commitMsg, sha);
      setMsg({ ok: true, text: t("published") });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || t("deleteFailed") });
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("back")}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mt-2">{isEdit ? t("update") : t("newPost")}</h1>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">{t("title")}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder={t("title")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">{t("date")}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{t("tags")}</label>
            <input
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder={t("tagsHint")}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">{t("content")}</label>
          <RichEditor value={body} onChange={setBody} />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {saving ? t("saving") : (isEdit ? t("update") : t("savePublish"))}
        </button>

        {msg && (
          <span className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>
            {msg.text}
            {msg.ok && isEdit && <Link href={`/posts/${slug}`} className="text-blue-600 underline ml-1">{t("viewPost")}</Link>}
            {msg.ok && !isEdit && <Link href="/admin/" className="text-blue-600 underline ml-1">{t("backToAdmin")}</Link>}
          </span>
        )}
      </div>
    </div>
  );
}
