import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-[var(--muted)] mb-6">Page not found</p>
      <Link href="/" className="text-blue-600 underline">
        Go home
      </Link>
    </div>
  );
}
