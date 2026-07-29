"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { readFile, writeFile, frontmatter } from "@/lib/github-api";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

const STORAGE_KEY = "gh_token";

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--muted)] mt-8">Loading editor...</div>}>
      <Editor />
    </Suspense>
  );
}

function Editor() {
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
          const t = fm.match(/title:\s*"(.+?)"/)?.[1] || "";
          const d = fm.match(/date:\s*(.+)/)?.[1] || "";
          const tg = fm.match(/tags:\s*\[(.+?)\]/)?.[1] || "";
          setTitle(t);
          setDate(d.replace(/T.*$/, ""));
          setTagsStr(tg ? tg.replace(/"/g, "") : "");
          setBody(match[2].trim());
        }
      } catch {}
    })();
  }, [slug]);

  async function handleSave() {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      setMsg({ ok: false, text: "Not logged in" });
      return;
    }
    if (!title.trim()) {
      setMsg({ ok: false, text: "Title is required" });
      return;
    }
    setSaving(true);
    setMsg(null);

    const tags = tagsStr
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
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
      setMsg({ ok: true, text: `Post saved! View it ` });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Save failed" });
    }
    setSaving(false);
  }

  const preview = body ? `# ${title}\n\n${body}` : "";

  return (
    <div>
      <Link
        href="/admin"
        className="text-sm text-[var(--muted)] hover:text-[var(--fg)]"
      >
        &larr; Back to Admin
      </Link>

      <h1 className="text-xl font-bold mt-4 mb-6">
        {isEdit ? "Edit Post" : "New Post"}
      </h1>

      <div className="space-y-3 mb-6">
        <div>
          <label className="text-sm font-medium block mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-[var(--border)] rounded px-3 py-2 text-sm"
            placeholder="Post title"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-[var(--border)] rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium block mb-1">
              Tags (comma separated)
            </label>
            <input
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full border border-[var(--border)] rounded px-3 py-2 text-sm"
              placeholder="tech, life"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Body (Markdown)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="w-full border border-[var(--border)] rounded px-3 py-2 text-sm font-mono"
            placeholder="Write your post in Markdown..."
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-black text-white px-5 py-2 rounded text-sm hover:opacity-80 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save & Publish"}
      </button>

      {msg && (
        <p className={`mt-4 text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>
          {msg.text}
          {msg.ok && isEdit && <Link href={`/posts/${slug}`} className="text-blue-600 underline ml-1">here</Link>}
          {msg.ok && !isEdit && <Link href={`/admin`} className="text-blue-600 underline ml-1">Go to Admin</Link>}
        </p>
      )}

      {body && (
        <div className="mt-10 border-t border-[var(--border)] pt-6">
          <h2 className="text-sm font-medium mb-3 text-[var(--muted)]">
            Preview
          </h2>
          <div className="prose">
            <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
