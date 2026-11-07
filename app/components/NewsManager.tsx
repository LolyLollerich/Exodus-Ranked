
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type News = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  published: boolean;
  created_at: string;
};

export default function NewsManager() {
  const [news, setNews] = useState<News[]>([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("ANNOUNCEMENT");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadNews() {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Could not load news: " + error.message);
    } else {
      setNews(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadNews();
  }, []);

  async function createNews(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("You must be logged in.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("news").insert({
      title,
      summary,
      content,
      category,
      published,
      created_by: user.id,
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setTitle("");
      setSummary("");
      setContent("");
      setCategory("ANNOUNCEMENT");
      setPublished(true);
      setMessage("News successfully created!");
      await loadNews();
    }

    setSaving(false);
  }

  async function togglePublished(item: News) {
    const { error } = await supabase
      .from("news")
      .update({ published: !item.published })
      .eq("id", item.id);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("News status updated!");
      await loadNews();
    }
  }

  async function deleteNews(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this news article?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("News deleted!");
      await loadNews();
    }
  }

  return (
    <section className="mt-10 space-y-8">
      <div>
        <div className="text-xs font-bold tracking-[0.3em] text-purple-400">
          CONTENT MANAGEMENT
        </div>
        <h2 className="mt-2 text-3xl font-black">
          NEWS MANAGER<span className="text-purple-500">.</span>
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Create and manage EXODUS RANKED announcements.
        </p>
      </div>

      <form
        onSubmit={createNews}
        className="space-y-5 rounded-2xl border border-white/10 bg-[#110e1c] p-6"
      >
        <h3 className="text-xl font-black">CREATE NEWS</h3>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-400">
            TITLE
          </label>
          <input
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter news title..."
            className="w-full rounded-xl border border-white/10 bg-[#090711] px-4 py-3 text-white outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-400">
            SUMMARY
          </label>
          <textarea
            required
            maxLength={300}
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short description..."
            className="w-full rounded-xl border border-white/10 bg-[#090711] px-4 py-3 text-white outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-400">
            CATEGORY
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#090711] px-4 py-3 text-white outline-none focus:border-purple-500"
          >
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="TOURNAMENT">Tournament</option>
            <option value="RANKING UPDATE">Ranking Update</option>
            <option value="SEASON">Season</option>
            <option value="COMMUNITY">Community</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-400">
            ARTICLE CONTENT
          </label>
          <textarea
            required
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your full news article here..."
            className="w-full rounded-xl border border-white/10 bg-[#090711] px-4 py-3 text-white outline-none focus:border-purple-500"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 accent-purple-500"
          />
          Publish immediately
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-500 disabled:opacity-50"
        >
          {saving ? "Saving..." : published ? "PUBLISH NEWS" : "SAVE DRAFT"}
        </button>

        {message && (
          <p className="text-sm text-purple-300">{message}</p>
        )}
      </form>

      <div className="space-y-4">
        <h3 className="text-xl font-black">EXISTING NEWS</h3>

        {loading ? (
          <p className="text-gray-500">Loading news...</p>
        ) : news.length === 0 ? (
          <p className="text-gray-500">No news created yet.</p>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-[#110e1c] p-5 sm:flex-row sm:items-center"
            >
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-purple-400">
                    {item.category}
                  </span>
                  <span className={`text-xs font-bold ${
                    item.published ? "text-green-400" : "text-yellow-400"
                  }`}>
                    {item.published ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>

                <h4 className="font-black">{item.title}</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString("de-AT")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => togglePublished(item)}
                  className="rounded-lg border border-purple-500/30 px-3 py-2 text-xs font-bold text-purple-300 transition hover:bg-purple-500/10"
                >
                  {item.published ? "UNPUBLISH" : "PUBLISH"}
                </button>

                <button
                  type="button"
                  onClick={() => deleteNews(item.id)}
                  className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/10"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
