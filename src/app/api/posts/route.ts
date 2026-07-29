import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/server-posts";

export async function GET() {
  const posts = await getAllPosts();
  return NextResponse.json(posts);
}
