import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Posts</h1>
      {posts.length === 0 ? (
      <p className="text-[var(--muted)]">
          No posts yet.{" "}
          <a href="/admin/" className="text-blue-600 underline">
            Write the first one
          </a>
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link
                href={`/posts/${post.slug}`}
                className="block group"
              >
                <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <time className="text-sm text-[var(--muted)]">{post.date}</time>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-2 mt-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
