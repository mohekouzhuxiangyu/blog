import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  draft?: boolean;
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(contentDir)) return [];
  const files = fs.readdirSync(contentDir);
  const posts = files
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(contentDir, f), "utf-8");
      const { data } = matter(raw);
      return {
        slug: f.replace(/\.md$/, ""),
        title: data.title || f,
        date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
        tags: data.tags || [],
        draft: data.draft || false,
      };
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
  return posts;
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(contentDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title || slug,
    date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
    tags: data.tags || [],
    content,
  };
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
