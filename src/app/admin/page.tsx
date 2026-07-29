"use client";

import { useState, useEffect } from "react";
import { listContent, readFile, deleteFile } from "@/lib/github-api";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const STORAGE_KEY = "gh_token";

export default function AdminPage() {
  const { t } = useI18n();
  const [token, setToken] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState("");
  const [files, setFiles] = useState<{ name: string; slug: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) loadPosts(token);
  }, [token]);

  async function loadPosts(tk: string) {
    setLoading(true);
    setError("");
    try {
      const list = await listContent(tk, "content");
      setFiles(list.sort((a, b) => (a.name > b.name ? -1 : 1)).map((f) => ({
        name: f.name,
        slug: f.name.replace(/\.md$/, ""),
      })));
    } catch (e: any) {
      setError(e.message || "Failed to load posts");
    }
    setLoading(false);
  }

  function handleLogin() {
    const t = inputToken.trim();
    if (!t) return;
    localStorage.setItem(STORAGE_KEY, t);
    setToken(t);
    loadPosts(t);
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setFiles([]);
    setInputToken("");
  }

  async function handleDelete(name: string, slug: string) {
    if (!token || !confirm(t("deleteConfirm", { name: slug }))) return;
    setDeleting(name);
    try {
      const { sha } = await readFile(token, `content/${name}`);
      await deleteFile(token, `content/${name}`, sha, `Delete post: ${name}`);
      setFiles((f) => f.filter((x) => x.name !== name));
    } catch {
      alert(t("deleteFailed"));
    }
    setDeleting(null);
  }

  if (!token) {
    return (
      <div className="max-w-sm mx-auto mt-16">
        <h1 className="text-2xl font-bold tracking-tight text-center">{t("admin")}</h1>
        <p className="text-sm text-gray-500 text-center mt-2 mb-8">{t("loginTitle")}</p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <input
            type="password"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            onClick={handleLogin}
            disabled={!inputToken.trim()}
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium mt-3 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t("loginBtn")}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          {t("tokenLocal")}. {t("loginHint")}:{" "}
          <a href="https://github.com/settings/tokens" target="_blank" className="text-blue-600 underline">
            GitHub Settings
          </a>{" "}
          ({t("loginScope")}: <code className="bg-gray-100 px-1 rounded">public_repo</code>)
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("postList")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("postCount", { n: String(files.length) })}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/editor"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("newPost")}
          </Link>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-2 py-1">
            {t("logout")}
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-12"><p className="text-sm text-gray-400">{t("loadPosts")}</p></div>}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && files.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-4">{t("noPostsAdmin")}</p>
          <Link href="/admin/editor" className="text-sm text-blue-600 hover:underline font-medium">
            {t("writeFirstPost")}
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {files.map((f) => (
          <div key={f.name} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors">
            <Link href={`/posts/${f.slug}`} className="font-medium text-sm hover:text-blue-600 transition-colors">
              {f.slug}
            </Link>
            <div className="flex items-center gap-3">
              <Link href={`/admin/editor?slug=${f.slug}`} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                {t("edit")}
              </Link>
              <button
                onClick={() => handleDelete(f.name, f.slug)}
                disabled={deleting === f.name}
                className="text-sm text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                {deleting === f.name ? t("deleting") : t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
