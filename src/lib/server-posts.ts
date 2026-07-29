const GH_TOKEN = process.env.GH_TOKEN || "";
const OWNER = "mohekouzhuxiangyu";
const REPO = "blog";
const BRANCH = "main";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
}

export interface Post extends PostMeta {
  content: string;
}

async function ghFetch(path: string) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/${path}?ref=${BRANCH}`, {
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github.v3+json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}

function parseFrontmatter(raw: string): { data: Record<string, any>; content: string } | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  const fm: Record<string, any> = {};
  match[1].split("\n").forEach((line) => {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) {
      let val: any = kv[2].replace(/^"(.*)"$/, "$1");
      if (kv[1] === "tags") {
        try { val = JSON.parse(kv[2]); } catch { val = []; }
      }
      fm[kv[1]] = val;
    }
  });
  return { data: fm, content: match[2].trim() };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  try {
    const files = await ghFetch("contents/content");
    if (!files || !Array.isArray(files)) return [];
    
    const posts = await Promise.all(
      files.filter((f: any) => f.name.endsWith(".md")).map(async (f: any) => {
        try {
          const data = await ghFetch(`git/blobs/${f.sha}`);
          if (!data) return null;
          const raw = Buffer.from(data.content, "base64").toString("utf-8");
          const parsed = parseFrontmatter(raw);
          if (!parsed) return null;
          return {
            slug: f.name.replace(/\.md$/, ""),
            title: parsed.data.title || f.name,
            date: (parsed.data.date || "").replace(/T.*$/, ""),
            tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
          };
        } catch { return null; }
      })
    );
    return posts.filter((p): p is PostMeta => p !== null).sort((a: any, b: any) => (a.date > b.date ? -1 : 1));
  } catch { return []; }
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const data = await ghFetch(`contents/content/${slug}.md`);
    if (!data) return null;
    const raw = Buffer.from(data.content, "base64").toString("utf-8");
    const parsed = parseFrontmatter(raw);
    if (!parsed) return null;
    return {
      slug,
      title: parsed.data.title || slug,
      date: (parsed.data.date || "").replace(/T.*$/, ""),
      tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
      content: parsed.content,
    };
  } catch { return null; }
}
