import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GGBond Blog",
  description: "A blog written with love",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white/95 backdrop-blur sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-tight hover:text-blue-600 transition-colors">
              GGBond Blog
            </Link>
            <nav className="flex items-center gap-5">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Posts
              </Link>
              <Link
                href="/admin/"
                className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors font-medium"
              >
                Write
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-10">
          {children}
        </main>
        <footer className="border-t border-gray-200 text-center text-sm text-gray-400 py-8">
          &copy; {new Date().getFullYear()} GGBond Blog
        </footer>
      </body>
    </html>
  );
}
