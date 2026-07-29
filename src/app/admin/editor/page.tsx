"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import RichEditor from "@/components/RichEditor";

const OWNER = "mohekouzhuxiangyu";
const REPO = "blog";
const BRANCH = "main";

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400 mt-8 text-center py-12">Loading...</div>}>
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
    (async () => {
      try {
        const res = await fetch(`/api/github/repos/${OWNER}/${REPO}/contents/content/${slug}.md?ref=${BRANCH}`);
        if (!res.ok) return;
        const data = await res.json();
        const raw = Buffer
          ? Buffer.from(data.content, "base64").toString("utf-8")
          : atob(data.content.replace(/\n/g, ""));
        
        // Handle both browser and server decoding
        let decoded: string;
        if (typeof Buffer !== "undefined") {
          decoded = Buffer.from(data.content, "base64").toString("utf-8");
        } else {
          decoded = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ""))));
        }
        
        const match = decoded.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
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
    if (!title.trim()) { setMsg({ ok: false, text: "Title is required" }); return; }
    setSaving(true);
    setMsg(null);

    const tags = tagsStr.split(/[,，]/).map((t: string) => t.trim()).filter(Boolean);
    const s = slug || title.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
    const fullContent = `---\ntitle: "${title.trim()}"\ndate: ${date}${tags.length ? `\ntags: [${tags.map((t: string) => `"${t}"`).join(", ")}]` : ""}\ndraft: false\n---\n\n${body.trim()}`;
    const encoded = btoa(unescape(encodeURIComponent(fullContent)));
    const commitMsg = isEdit ? `Update post: ${s}` : `New post: ${s}`;

    try {
      const body: any = { message: commitMsg, content: encoded, branch: BRANCH };
      if (isEdit) {
        const existing = await fetch(`/api/github/repos/${OWNER}/${REPO}/contents/content/${s}.md?ref=${BRANCH}`);
        if (existing.ok) {
          const data = await existing.json();
          body.sha = data.sha;
        }
      }
      const res = await fetch(`/api/github/repos/${OWNER}/${REPO}/contents/content/${s}.md`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Save failed");
      }
      setMsg({ ok: true, text: "Published!" });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Save failed" });
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
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mt-2">{isEdit ? "Edit" : "New Post"}</h1>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" placeholder="Post title" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Tags</label>
            <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" placeholder="tech, life" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Content</label>
          <RichEditor value={body} onChange={setBody} />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button onClick={handleSave} disabled={saving || !title.trim()} className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {saving ? "Saving..." : (isEdit ? "Update" : "Publish")}
        </button>
        {msg && <span className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
