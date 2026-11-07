
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type News = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  created_at: string;
};

function NewsArticleContent() {
  const params = useParams<{ id: string }>();

  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, summary, content, category, created_at")
        .eq("id", params.id)
        .eq("published", true)
        .single();

      if (error) {
        console.error("Could not load article:", error.message);
        setArticle(null);
      } else {
        setArticle(data);
      }

      setLoading(false);
    }

    loadArticle();
  }, [params.id]);

  return (
    <main className="min-h-screen bg-[#090711] text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/news"
          className="text-sm font-bold text-purple-400 transition hover:text-white"
        >
          ← BACK TO NEWS
        </Link>

        {loading ? (
          <div className="py-24 text-center text-gray-500">
            Loading article...
          </div>
        ) : article ? (
          <article className="mt-12">
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
                {article.category}
              </span>

              <span className="text-sm text-gray-500">
                {new Date(article.created_at).toLocaleDateString("de-AT")}
              </span>
            </div>

            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              {article.title}
              <span className="text-purple-500">.</span>
            </h1>

            <p className="mt-6 border-l-2 border-purple-500 pl-5 text-lg leading-8 text-gray-400">
              {article.summary}
            </p>

            <div className="mt-12 whitespace-pre-wrap text-base leading-8 text-gray-300">
              {article.content}
            </div>

            <div className="mt-16 border-t border-white/10 pt-8">
              <Link
                href="/news"
                className="font-bold text-purple-400 transition hover:text-white"
              >
                ← BACK TO ALL NEWS
              </Link>
            </div>
          </article>
        ) : (
          <div className="mt-20 rounded-2xl border border-white/10 bg-[#110e1c] p-10 text-center">
            <h1 className="text-2xl font-black">Article not found</h1>
            <p className="mt-3 text-gray-500">
              This article does not exist or is no longer published.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function NewsArticlePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090711] text-white">
          <div className="py-24 text-center text-gray-500">
            Loading article...
          </div>
        </main>
      }
    >
      <NewsArticleContent />
    </Suspense>
  );
}
