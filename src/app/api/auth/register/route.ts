import { NextResponse } from "next/server";
import crypto from "crypto";

const GH_TOKEN = process.env.GH_TOKEN || "";
const OWNER = "mohekouzhuxiangyu";
const REPO = "blog";
const BRANCH = "main";

async function readUsers(): Promise<any[]> {
  if (!GH_TOKEN) return [];
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/admin/users.json?ref=${BRANCH}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github.v3+json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const content = JSON.parse(Buffer.from(data.content, "base64").toString("utf-8"));
    return Array.isArray(content) ? content : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: any[], sha?: string) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/admin/users.json`;
  const body: any = {
    message: "Update users",
    content: Buffer.from(JSON.stringify(users, null, 2)).toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github.v3+json" },
    body: JSON.stringify(body),
  });
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const users = await readUsers();
    if (users.find((u: any) => u.username === username)) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    users.push({ username, passwordHash, createdAt: new Date().toISOString() });

    // Get sha if updating
    let sha: string | undefined;
    try {
      const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/admin/users.json?ref=${BRANCH}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github.v3+json" },
      });
      if (res.ok) {
        const data = await res.json();
        sha = data.sha;
      }
    } catch {}

    await writeUsers(users, sha);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
