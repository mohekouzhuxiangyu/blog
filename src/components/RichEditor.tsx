"use client";

import { useCallback, useRef, useState, useMemo, useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Markdown from "react-markdown";
// Image upload uses server API
import remarkGfm from "remark-gfm";

function Toolbar({ editor, onImageUpload }: { editor: Editor; onImageUpload?: () => void }) {
  const btn = (label: string, action: () => void, active?: boolean) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); action(); }}
      className={`px-2 py-1 text-xs rounded border ${
        active ? "bg-gray-900 text-white border-gray-900" : "text-gray-600 border-gray-200 hover:bg-gray-50"
      } transition-colors`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      {btn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
      {btn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
      {btn("S", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
      <span className="w-px bg-gray-200 mx-1" />
      {btn("H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }))}
      {btn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
      {btn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}
      <span className="w-px bg-gray-200 mx-1" />
      {btn("• List", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
      {btn("1. List", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
      {btn("Quote", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
      {btn("<>", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock"))}
      <span className="w-px bg-gray-200 mx-1" />
      {btn("HR", () => editor.chain().focus().setHorizontalRule().run())}
      <span className="w-px bg-gray-200 mx-1" />
      {onImageUpload && (
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onImageUpload(); }}
          className="px-2 py-1 text-xs rounded border text-gray-600 border-gray-200 hover:bg-gray-50 transition-colors"
          title="Upload Image"
        >
          🖼
        </button>
      )}
    </div>
  );
}

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function RichEditor({ value, onChange }: Props) {
  const [mode, setMode] = useState<"rich" | "source">("rich");
  const [view, setView] = useState<"editor" | "preview" | "split">("split");
  const [uploading, setUploading] = useState(false);
  const mdRef = useRef(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Start writing..." }),
    ],
    content: convertMdToHtml(value),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const md = convertHtmlToMd(html);
      mdRef.current = md;
      onChange(md);
    },
    editorProps: {
      attributes: { class: "prose max-w-none focus:outline-none px-4 py-3 min-h-[320px]" },
    },
  });

  useEffect(() => {
    if (editor && value && mode === "rich") {
      const html = convertMdToHtml(value);
      const currentHtml = editor.getHTML();
      if (currentHtml !== html) {
        editor.commands.setContent(html);
      }
    }
  }, [value, editor, mode]);

  function handleSourceChange(val: string) {
    mdRef.current = val;
    onChange(val);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("gh_token");
    if (!token) { alert("Not logged in"); return; }
    if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)) {
      alert("Only PNG, JPEG, GIF, WebP allowed");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();
      const url = uploadData.url;
      const mdImg = `![${file.name}](${url})`;
      if (mode === "rich" && editor) {
        editor.chain().focus().setImage({ src: url }).run();
      } else {
        mdRef.current += `\n\n${mdImg}`;
        onChange(mdRef.current);
        if (editor && mode === "rich") {
          const html = convertMdToHtml(mdRef.current);
          editor.commands.setContent(html);
        }
      }
    } catch (e: any) {
      alert("Upload failed: " + (e.message || "unknown error"));
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function switchToRich() {
    setMode("rich");
    if (editor) {
      const html = convertMdToHtml(mdRef.current);
      editor.commands.setContent(html);
    }
  }

  const showEditor = view === "editor" || view === "split";
  const showPreview = view === "preview" || view === "split";

  const t = (key: string) => key === "rich" ? "富文本" : key === "source" ? "源码" : key;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Mode tabs */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
        <div className="flex gap-2">
          {(["editor", "split", "preview"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`text-xs px-2 py-1 rounded ${
                view === v ? "bg-white text-gray-900 border border-gray-200" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {v === "editor" ? "编辑" : v === "split" ? "分屏" : "预览"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            if (mode === "rich") {
              setMode("source");
            } else {
              switchToRich();
            }
          }}
          className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
        >
          {mode === "rich" ? "切换到 Markdown" : "切换到富文本"}
        </button>
      </div>

      <div className="flex" style={{ minHeight: 360 }}>
        {/* Editor pane */}
        {(showEditor) && (
          <div className={showPreview ? "w-1/2 border-r border-gray-200" : "w-full"}>
            {mode === "rich" && editor && (
              <>
                <Toolbar editor={editor} onImageUpload={() => fileInputRef.current?.click()} />
                <EditorContent editor={editor} />
              </>
            )}
            {mode === "source" && (
              <textarea
                value={mdRef.current}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="w-full h-full min-h-[360px] p-4 text-sm font-mono focus:outline-none resize-none"
                placeholder="Write Markdown..."
              />
            )}
          </div>
        )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={handleImageUpload}
        className="hidden"
      />

      {uploading && (
        <div className="text-xs text-blue-600 px-4 py-2 bg-blue-50 border-b border-blue-100">
          Uploading image...
        </div>
      )}

        {/* Preview pane */}
        {showPreview && (
          <div className={showEditor ? "w-1/2" : "w-full"}>
            <div className="p-4 prose max-w-none overflow-auto" style={{ minHeight: 360 }}>
              {mdRef.current ? (
                <Markdown remarkPlugins={[remarkGfm]}>{mdRef.current}</Markdown>
              ) : (
                <p className="text-gray-400 text-sm">Preview will appear here...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function convertMdToHtml(md: string): string {
  if (!md) return "";
  // Simple markdown to HTML for Tiptap
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  const lines = html.split("\n");
  const result: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        result.push(`<pre><code>${codeBuffer.join("\n")}</code></pre>`);
        codeBuffer = [];
      }
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) { result.push("<p></p>"); continue; }

    let processed = line;
    processed = processed.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    processed = processed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    processed = processed.replace(/\*(.+?)\*/g, "<em>$1</em>");
    processed = processed.replace(/~~(.+?)~~/g, "<s>$1</s>");
    processed = processed.replace(/`([^`]+)`/g, "<code>$1</code>");

    if (/^#{3}\s/.test(processed)) { result.push(`<h3>${processed.replace(/^#{3}\s*/, "")}</h3>`); continue; }
    if (/^#{2}\s/.test(processed)) { result.push(`<h2>${processed.replace(/^#{2}\s*/, "")}</h2>`); continue; }
    if (/^#{1}\s/.test(processed)) { result.push(`<h1>${processed.replace(/^#\s*/, "")}</h1>`); continue; }
    if (/^>\s/.test(processed)) { result.push(`<blockquote><p>${processed.replace(/^>\s*/, "")}</p></blockquote>`); continue; }
    if (/^-{3,}$/.test(trimmed)) { result.push("<hr />"); continue; }

    result.push(`<p>${processed}</p>`);
  }

  if (inCodeBlock) {
    result.push(`<pre><code>${codeBuffer.join("\n")}</code></pre>`);
  }

  return result.join("\n");
}

function convertHtmlToMd(html: string): string {
  if (!html) return "";
  // Simple HTML to Markdown using DOM parsing
  let md = html;
  
  // Remove paragraph tags
  md = md.replace(/<p><\/p>/g, "\n\n");
  md = md.replace(/<p>/g, "");
  md = md.replace(/<\/p>/g, "\n\n");
  
  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  
  // Bold and italic
  md = md.replace(/<strong><em>(.*?)<\/em><\/strong>/g, "***$1***");
  md = md.replace(/<strong>(.*?)<\/strong>/g, "**$1**");
  md = md.replace(/<em>(.*?)<\/em>/g, "*$1*");
  md = md.replace(/<s>(.*?)<\/s>/g, "~~$1~~");
  
  // Code
  md = md.replace(/<code>(.*?)<\/code>/g, "`$1`");
  md = md.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, "```\n$1\n```");
  
  // Blockquote
  md = md.replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/gi, "> $1\n\n");
  
  // Lists
  md = md.replace(/<li>(.*?)<\/li>/g, "- $1\n");
  md = md.replace(/<ul>([\s\S]*?)<\/ul>/g, "$1\n");
  md = md.replace(/<ol>([\s\S]*?)<\/ol>/g, "$1\n");
  
  // Horizontal rule
  md = md.replace(/<hr\s*\/?>/g, "\n---\n\n");
  
  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  
  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  
  // Clean up extra whitespace
  md = md.replace(/\n{4,}/g, "\n\n\n");
  md = md.trim();
  
  return md;
}
