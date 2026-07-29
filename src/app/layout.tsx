"use client";

import Link from "next/link";
import "./globals.css";
import { I18nProvider, useI18n } from "@/lib/i18n";

function Nav() {
  const { t, lang, setLang } = useI18n();
  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight hover:text-blue-600 transition-colors">
          {t("blogName")}
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            {t("posts")}
          </Link>
          <Link
            href="/admin/"
            className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors font-medium"
          >
            {t("write")}
          </Link>
          <button
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 rounded px-2 py-1"
          >
            {lang === "zh" ? "EN" : "中文"}
          </button>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-gray-200 text-center text-sm text-gray-400 py-8">
      &copy; {new Date().getFullYear()} {t("blogName")}
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <I18nProvider>
          <Nav />
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
