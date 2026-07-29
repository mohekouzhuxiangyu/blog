import { notFound } from "next/navigation";
import { getPost } from "@/lib/server-posts";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ShareButton from "@/components/ShareButton";


export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to posts
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-gray-900">{post.title}</h1>
        <div className="flex items-center gap-3 mt-4 text-sm text-gray-400">
          <time className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </header>

      <div className="prose max-w-none">
        <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Share this post</span>
          <ShareButton title={post.title} />
        </div>
      </div>
    </article>
  );
}
