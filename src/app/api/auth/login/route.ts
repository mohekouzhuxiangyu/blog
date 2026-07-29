import { NextResponse } from "next/server";
import crypto from "crypto";

const GH_TOKEN = process.env.GH_TOKEN || "";
const OWNER = "mohekouzhuxiangyu";
const REPO = "blog";
const BRANCH = "main";

async function readUsers() {
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

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const users = await readUsers();
    const user = users.find((u: any) => u.username === username);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const hash = crypto.createHash("sha256").update(password).digest("hex");
    if (hash !== user.passwordHash) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
