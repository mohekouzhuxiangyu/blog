import { NextResponse } from "next/server";

const GH_TOKEN = process.env.GH_TOKEN || "";
const OWNER = "mohekouzhuxiangyu";
const REPO = "blog";
const BRANCH = "main";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const ext = file.name.split(".").pop() || "png";
    const filename = `public/images/${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filename}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: `Upload image: ${filename}`,
        content: base64,
        branch: BRANCH,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${filename}`;
    return NextResponse.json({ url: rawUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
