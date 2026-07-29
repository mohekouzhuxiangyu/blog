import Link from "next/link";
import { getAllPosts } from "@/lib/server-posts";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-14 mt-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">小米粥</h1>
        <p className="text-gray-500 mt-3 text-sm sm:text-base">A personal blog about code, life, and everything in between.</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No posts yet.</p>
          <Link href="/admin/" className="inline-block bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm">Write the first post</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post: any) => (
            <article key={post.slug} className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-md transition-all duration-200">
              <Link href={`/posts/${post.slug}`} className="block">
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">{post.title}</h2>
                <div className="flex items-center gap-3 mt-3 text-sm text-gray-400">
                  <time className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {post.date}
                  </time>
                  {post.tags?.length > 0 && (
                    <>
                      <span className="text-gray-200">&middot;</span>
                      <div className="flex gap-1.5">
                        {post.tags.map((tag: string) => (
                          <span key={tag} className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md text-xs border border-gray-100">#{tag}</span>
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
