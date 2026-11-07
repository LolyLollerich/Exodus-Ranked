
"use client";

import { useEffect, useState } from "react";
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

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, summary, content, category, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Could not load news:", error.message);
      } else {
        setNews(data ?? []);
      }

      setLoading(false);
    }

    loadNews();
  }, []);

  return (
    <main className="min-h-screen bg-[#090711] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <Link
          href="/"
          className="text-sm font-bold text-purple-400 transition hover:text-white"
        >
          ← BACK TO HOME
        </Link>

        <div className="mb-12 mt-12">
          <div className="text-xs font-bold tracking-[0.3em] text-purple-400">
            EXODUS RANKED UPDATES
          </div>

          <h1 className="mt-3 text-5xl font-black">
            NEWS<span className="text-purple-500">.</span>
          </h1>

          <p className="mt-3 text-gray-500">
            Latest announcements, tournaments and competitive updates.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">
            Loading news...
          </div>
        ) : news.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#110e1c] p-6 transition hover:border-purple-500/40"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
                    {item.category}
                  </span>

                  <span className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString("de-AT")}
                  </span>
                </div>

                <h2 className="text-xl font-black">
                  {item.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {item.summary}
                </p>

                <Link
                  href={`/news/${item.id}`}
                  className="mt-6 inline-block text-sm font-bold text-purple-400 transition hover:text-white"
                >
                  READ MORE →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#110e1c] px-6 py-20 text-center">
            <h2 className="text-xl font-black">No news yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Check back later for EXODUS RANKED updates.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
