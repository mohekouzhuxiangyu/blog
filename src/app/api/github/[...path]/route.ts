import { NextRequest, NextResponse } from "next/server";

const GH_TOKEN = process.env.GH_TOKEN || "";
const DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK || "";

async function ghFetch(url: string, options?: any) {
  const headers: any = {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  };
  return fetch(url, { ...options, headers: { ...headers, ...options?.headers } });
}

async function triggerDeploy() {
  if (DEPLOY_HOOK) {
    fetch(DEPLOY_HOOK, { method: "POST" }).catch(() => {});
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (!GH_TOKEN) return NextResponse.json({ error: "GH_TOKEN not configured" }, { status: 500 });
  const res = await ghFetch(`https://api.github.com/${path.join("/")}${request.nextUrl.search}`);
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (!GH_TOKEN) return NextResponse.json({ error: "GH_TOKEN not configured" }, { status: 500 });
  const body = await request.json();
  const res = await ghFetch(`https://api.github.com/${path.join("/")}`, { method: "PUT", body: JSON.stringify(body) });
  const data = await res.json();
  if (res.ok && path[1] === "contents" && path[0] === "repos") triggerDeploy();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (!GH_TOKEN) return NextResponse.json({ error: "GH_TOKEN not configured" }, { status: 500 });
  const body = await request.json();
  const res = await ghFetch(`https://api.github.com/${path.join("/")}`, { method: "DELETE", body: JSON.stringify(body) });
  if (res.ok && path[1] === "contents" && path[0] === "repos") triggerDeploy();
  return NextResponse.json(await res.json(), { status: res.status });
}
