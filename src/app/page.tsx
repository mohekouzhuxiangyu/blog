import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
        <p className="text-gray-500 mt-2">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No posts yet.</p>
          <Link
            href="/admin/"
            className="inline-block bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Write the first post
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <Link href={`/posts/${post.slug}`} className="block">
                <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <time>{post.date}</time>
                  {post.tags && post.tags.length > 0 && (
                    <>
                      <span className="text-gray-300">&middot;</span>
                      <div className="flex gap-1.5">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
