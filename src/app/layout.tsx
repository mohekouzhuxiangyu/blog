import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Blog",
  description: "A blog written with love",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-[var(--border)]">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/blog" className="text-lg font-bold hover:opacity-70">
              My Blog
            </a>
            <a
              href="/blog/admin"
              className="text-sm text-[var(--muted)] hover:text-[var(--fg)]"
            >
              Write
            </a>
          </div>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-[var(--border)] text-center text-sm text-[var(--muted)] py-6">
          &copy; {new Date().getFullYear()} My Blog
        </footer>
      </body>
    </html>
  );
}
