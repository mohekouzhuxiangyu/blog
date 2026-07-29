"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("blog_logged_in") === "1") setAuthed(true);
    setChecking(false);
  }, []);

  if (checking) return <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>;

  if (!authed) {
    return <AuthPage mode={mode} setMode={setMode} onLogin={() => { sessionStorage.setItem("blog_logged_in", "1"); setAuthed(true); }} />;
  }

  return <Dashboard />;
}

function AuthPage({ mode, setMode, onLogin }: { mode: "login" | "register"; setMode: (m: "login" | "register") => void; onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!username.trim() || !password.trim()) { setError("Fill in all fields"); return; }
    const key = "blog_users";
    if (mode === "register") {
      const users = JSON.parse(localStorage.getItem(key) || "[]");
      if (users.find((u: any) => u.username === username.trim())) { setError("Username already exists"); return; }
      users.push({ username: username.trim(), password });
      localStorage.setItem(key, JSON.stringify(users));
      setMode("login");
      setError("Registered! Please login.");
    } else {
      const users = JSON.parse(localStorage.getItem(key) || "[]");
      if (!users.find((u: any) => u.username === username.trim() && u.password === password)) { setError("Wrong username or password"); return; }
      onLogin();
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center tracking-tight">小米粥</h1>
        <p className="text-sm text-gray-500 text-center mt-2 mb-8">Blog Admin</p>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex mb-6 border-b border-gray-200">
            <button onClick={() => { setMode("login"); setError(""); }} className={`flex-1 pb-2 text-sm font-medium text-center transition-colors ${mode === "login" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-600"}`}>Login</button>
            <button onClick={() => { setMode("register"); setError(""); }} className={`flex-1 pb-2 text-sm font-medium text-center transition-colors ${mode === "register" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-600"}`}>Register</button>
          </div>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          {error && <p className={`text-sm mb-3 ${error === "Registered! Please login." ? "text-green-600" : "text-red-600"}`}>{error}</p>}
          <button onClick={handleSubmit} className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{mode === "login" ? "Login" : "Register"}</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [files, setFiles] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/github/repos/mohekouzhuxiangyu/blog/contents/content?ref=main");
        if (!res.ok) throw new Error("Failed to load posts");
        const data = await res.json();
        if (!Array.isArray(data)) { setFiles([]); return; }
        setFiles(data.filter((f: any) => f.type === "file").map((f: any) => ({ name: f.name, slug: f.name.replace(/\.md$/, "") })).sort((a: any, b: any) => (a.name > b.name ? -1 : 1)));
      } catch (e: any) { setError(e.message); }
      setLoading(false);
    })();
  }, []);

  async function handleDelete(name: string, slug: string) {
    if (!confirm(`Delete "${slug}"?`)) return;
    try {
      const readRes = await fetch(`/api/github/repos/mohekouzhuxiangyu/blog/contents/content/${name}?ref=main`);
      const readData = await readRes.json();
      const res = await fetch(`/api/github/repos/mohekouzhuxiangyu/blog/contents/content/${name}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Delete post: ${name}`, sha: readData.sha, branch: "main" }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setFiles((fs) => fs.filter((x) => x.name !== name));
    } catch { alert("Delete failed"); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold tracking-tight">Posts</h1><p className="text-sm text-gray-500 mt-1">{files.length} {files.length === 1 ? "post" : "posts"}</p></div>
        <div className="flex items-center gap-3">
          <Link href="/admin/editor" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Post
          </Link>
          <button onClick={() => { sessionStorage.removeItem("blog_logged_in"); window.location.reload(); }} className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-2 py-1">Logout</button>
        </div>
      </div>
      {loading && <div className="text-center py-12"><p className="text-sm text-gray-400">Loading...</p></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6"><p className="text-sm text-red-700">{error}</p></div>}
      {!loading && files.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-4">No posts yet</p>
          <Link href="/admin/editor" className="text-sm text-blue-600 hover:underline font-medium">Write your first post</Link>
        </div>
      )}
      <div className="space-y-2">
        {files.map((f) => (
          <div key={f.name} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors">
            <Link href={`/posts/${f.slug}`} className="font-medium text-sm hover:text-blue-600 transition-colors">{f.slug}</Link>
            <div className="flex items-center gap-3">
              <Link href={`/admin/editor?slug=${f.slug}`} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Edit</Link>
              <button onClick={() => handleDelete(f.name, f.slug)} className="text-sm text-gray-400 hover:text-red-600 transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
