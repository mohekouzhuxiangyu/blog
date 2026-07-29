import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="text-gray-500 mt-4 mb-8">This page could not be found</p>
      <Link href="/" className="text-sm text-blue-600 hover:underline font-medium">
        Go home
      </Link>
    </div>
  );
}
