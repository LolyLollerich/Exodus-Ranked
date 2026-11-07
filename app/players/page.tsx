
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Player = {
  id: string;
  username: string;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .order("username");

      if (error) {
        console.error("Could not load players:", error.message);
      } else {
        setPlayers(data ?? []);
      }

      setLoading(false);
    }

    loadPlayers();
  }, []);

  const filteredPlayers = players.filter((player) =>
    player.username.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#090711] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <Link
          href="/"
          className="text-sm font-bold text-purple-400 transition hover:text-white"
        >
          ← BACK TO HOME
        </Link>

        <div className="mb-10 mt-12">
          <div className="text-xs font-bold tracking-[0.3em] text-purple-400">
            EXODUS RANKED COMMUNITY
          </div>

          <h1 className="mt-3 text-5xl font-black">
            PLAYERS<span className="text-purple-500">.</span>
          </h1>

          <p className="mt-3 text-gray-500">
            Discover and search all registered EXODUS players.
          </p>

          <p className="mt-5 text-sm text-gray-400">
            {players.length} REGISTERED PLAYERS
          </p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players..."
            className="w-full rounded-xl border border-purple-500/20 bg-[#151020] px-5 py-4 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500"
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Loading players...
          </div>
        ) : filteredPlayers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlayers.map((player) => (
              <Link
                key={player.id}
                href={`/players/${encodeURIComponent(player.username)}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#110e1c] p-5 transition hover:border-purple-500/50 hover:bg-purple-500/5"
              >
                <img
                  src={`https://minotar.net/helm/${encodeURIComponent(player.username)}/64.png`}
                  alt=""
                  className="h-14 w-14 rounded-xl bg-purple-500/10"
                />

                <div>
                  <div className="font-black transition group-hover:text-purple-400">
                    {player.username}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    VIEW PLAYER PROFILE →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#110e1c] px-6 py-16 text-center">
            <p className="text-lg font-bold">No players found</p>
            <p className="mt-2 text-sm text-gray-500">
              Try another username.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
