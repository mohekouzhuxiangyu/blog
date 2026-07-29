"use client";

import { useState, useEffect } from "react";
import { listContent, readFile, deleteFile, GhFile } from "@/lib/github-api";
import Link from "next/link";

const STORAGE_KEY = "gh_token";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState("");
  const [files, setFiles] = useState<GhFile[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setToken(saved);
  }, []);

  async function loadPosts(t: string) {
    setLoading(true);
    setError("");
    try {
      const list = await listContent(t, "content");
      setFiles(list.sort((a, b) => (a.name > b.name ? -1 : 1)));
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

  async function handleDelete(name: string) {
    if (!token || !confirm(`Delete "${name.replace(/\.md$/, "")}"?`)) return;
    try {
      const { sha } = await readFile(token, `content/${name}`);
      await deleteFile(token, `content/${name}`, sha, `Delete post: ${name}`);
      setFiles((f) => f.filter((x) => x.name !== name));
    } catch (e: any) {
      alert("Delete failed: " + (e.message || "unknown error"));
    }
  }

  useEffect(() => {
    if (token) loadPosts(token);
  }, [token]);

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        <p className="text-sm text-[var(--muted)] mb-4">
          Enter your{" "}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            className="text-blue-600 underline"
          >
            GitHub Personal Access Token
          </a>{" "}
          (classic, <code>public_repo</code> scope). It is stored locally in
          your browser and never sent elsewhere.
        </p>
        <input
          type="password"
          value={inputToken}
          onChange={(e) => setInputToken(e.target.value)}
          placeholder="paste your GitHub token"
          className="w-full border border-[var(--border)] rounded px-3 py-2 mb-3 text-sm"
        />
        <button
          onClick={handleLogin}
          className="bg-black text-white px-4 py-2 rounded text-sm hover:opacity-80"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Posts</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/editor"
            className="bg-black text-white px-3 py-1.5 rounded text-sm hover:opacity-80"
          >
            + New Post
          </Link>
          <button
            onClick={handleLogout}
            className="border border-[var(--border)] px-3 py-1.5 rounded text-sm hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-[var(--muted)]">Loading...</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {files.length === 0 && !loading && (
        <p className="text-[var(--muted)]">
          No posts yet.{" "}
          <Link href="/admin/editor" className="text-blue-600 underline">
            Write one
          </Link>
        </p>
      )}

      <div className="space-y-2">
        {files.map((f) => {
          const slug = f.name.replace(/\.md$/, "");
          return (
            <div
              key={f.name}
              className="flex items-center justify-between border border-[var(--border)] rounded px-4 py-3"
            >
              <Link
                href={`/posts/${slug}`}
                className="font-medium hover:text-blue-600"
              >
                {slug}
              </Link>
              <div className="flex gap-2">
                <Link
                  href={`/admin/editor?slug=${slug}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(f.name)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
