import { NextRequest, NextResponse } from "next/server";

const GH_TOKEN = process.env.GH_TOKEN || "";

async function ghFetch(url: string, options?: any) {
  const headers: any = {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  };
  return fetch(url, { ...options, headers: { ...headers, ...options?.headers } });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const search = request.nextUrl.search;
  if (!GH_TOKEN) return NextResponse.json({ error: "GH_TOKEN not configured" }, { status: 500 });
  const res = await ghFetch(`https://api.github.com/${path.join("/")}${search}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (!GH_TOKEN) return NextResponse.json({ error: "GH_TOKEN not configured" }, { status: 500 });
  const body = await request.json();
  const res = await ghFetch(`https://api.github.com/${path.join("/")}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (!GH_TOKEN) return NextResponse.json({ error: "GH_TOKEN not configured" }, { status: 500 });
  const body = await request.json();
  const res = await ghFetch(`https://api.github.com/${path.join("/")}`, {
    method: "DELETE",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
