"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "zh" | "en";

const translations: Record<Lang, Record<string, string>> = {
  zh: {
    blogName: "小米粥",
    posts: "文章",
    write: "写文章",
    postCount: "{n} 篇文章",
    noPosts: "暂无文章",
    writeFirst: "写第一篇文章",
    login: "登录",
    logout: "退出",
    newPost: "新文章",
    edit: "编辑",
    delete: "删除",
    deleting: "删除中...",
    loginTitle: "请输入 GitHub Token",
    loginHint: "获取 Token",
    loginScope: "权限范围",
    tokenLocal: "Token 仅保存在本地浏览器",
    savePublish: "发布",
    update: "更新",
    saving: "保存中...",
    back: "返回",
    backToAdmin: "回到后台",
    title: "标题",
    date: "日期",
    tags: "标签",
    tagsHint: "逗号分隔",
    content: "正文",
    contentHint: "使用 Markdown 格式写作",
    published: "已发布！",
    viewPost: "查看文章",
    loadPosts: "加载文章...",
    noPostsAdmin: "还没有文章",
    writeFirstPost: "写第一篇文章",
    deleteConfirm: '确认删除 "{name}"？',
    deleteFailed: "删除失败",
    pageNotFound: "页面未找到",
    goHome: "返回首页",
    writeFirstAdmin: "写第一篇文章",
    preview: "预览",
    admin: "管理后台",
    postList: "文章列表",
    loginBtn: "登录",
  },
  en: {
    blogName: "Xiaomi Porridge",
    posts: "Posts",
    write: "Write",
    postCount: "{n} posts",
    noPosts: "No posts yet",
    writeFirst: "Write the first post",
    login: "Login",
    logout: "Logout",
    newPost: "New Post",
    edit: "Edit",
    delete: "Delete",
    deleting: "Deleting...",
    loginTitle: "Enter your GitHub Token",
    loginHint: "Get Token",
    loginScope: "scope",
    tokenLocal: "Token is stored locally in your browser",
    savePublish: "Publish",
    update: "Update",
    saving: "Saving...",
    back: "Back",
    backToAdmin: "Back to Admin",
    title: "Title",
    date: "Date",
    tags: "Tags",
    tagsHint: "comma separated",
    content: "Content",
    contentHint: "Write in Markdown",
    published: "Published!",
    viewPost: "View post",
    loadPosts: "Loading posts...",
    noPostsAdmin: "No posts yet",
    writeFirstPost: "Write your first post",
    deleteConfirm: 'Delete "{name}"?',
    deleteFailed: "Delete failed",
    pageNotFound: "Page not found",
    goHome: "Go home",
    writeFirstAdmin: "Write your first post",
    preview: "Preview",
    admin: "Admin",
    postList: "Post List",
    loginBtn: "Login",
  },
};

export function t(lang: Lang, key: string, params?: Record<string, string>): string {
  let text = translations[lang]?.[key] || translations.zh[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}

export const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string>) => string;
}>({
  lang: "zh",
  setLang: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("blog_lang") as Lang | null;
    if (saved === "en" || saved === "zh") setLang(saved);
  }, []);

  function handleSetLang(l: Lang) {
    setLang(l);
    localStorage.setItem("blog_lang", l);
  }

  const value = {
    lang,
    setLang: handleSetLang,
    t: (key: string, params?: Record<string, string>) => t(lang, key, params),
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  return useContext(LangContext);
}
