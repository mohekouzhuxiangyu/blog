const API = "https://api.github.com";
const OWNER = "mohekouzhuxiangyu";
const REPO = "blog";
const BRANCH = "main";

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };
}

export interface GhFile {
  name: string;
  sha: string;
  path: string;
}

export async function listContent(
  token: string,
  dir: string = ""
): Promise<GhFile[]> {
  const url = `${API}/repos/${OWNER}/${REPO}/contents/${dir}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: headers(token) });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.filter((f: any) => f.type === "file").map((f: any) => ({
    name: f.name,
    sha: f.sha,
    path: f.path,
  }));
}

export async function readFile(
  token: string,
  path: string
): Promise<{ content: string; sha: string }> {
  const url = `${API}/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: headers(token) });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const decoded = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ""))));
  return { content: decoded, sha: data.sha };
}

export async function writeFile(
  token: string,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  const url = `${API}/repos/${OWNER}/${REPO}/contents/${path}`;
  const body: any = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function deleteFile(
  token: string,
  path: string,
  sha: string,
  message: string
): Promise<void> {
  const url = `${API}/repos/${OWNER}/${REPO}/contents/${path}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: headers(token),
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export function frontmatter(title: string, date: string, tags: string[]): string {
  const tagStr = tags.length ? `\ntags: [${tags.map((t) => `"${t}"`).join(", ")}]` : "";
  return `---\ntitle: "${title}"\ndate: ${date}${tagStr}\ndraft: false\n---\n\n`;
}
