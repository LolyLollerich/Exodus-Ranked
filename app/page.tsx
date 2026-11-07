
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AccountMenu from "@/app/components/AccountMenu";
import { supabase } from "@/lib/supabase";

const kits = ["Overall", "Mace", "Sword", "Axe", "Crystal", "UHC", "Spear", "Pot", "SMP"];

type Player = {
  name: string;
  rank: string;
  points: number;
  kit: string;
  wins: number;
  is_retired: boolean;
};

const rankPoints: Record<string, number> = {
  HT1: 10,
  LT1: 9,
  HT2: 8,
  LT2: 7,
  HT3: 6,
  LT3: 5,
  HT4: 4,
  LT4: 3,
  HT5: 2,
  LT5: 1,
};



const rankColors: Record<string, string> = {
  HT1: "text-yellow-300",
  LT1: "text-yellow-400",
  HT2: "text-purple-300",
  LT2: "text-purple-400",
  HT3: "text-blue-300",
  LT3: "text-blue-400",
  HT4: "text-green-300",
  LT4: "text-green-400",
  HT5: "text-gray-300",
  LT5: "text-gray-400",
};

export default function Home() {
  const [news, setNews] = useState<
  {
    id: string;
    category: string;
    title: string;
    summary: string;
    created_at: string;
  }[]
>([]);

useEffect(() => {
  async function loadLatestNews() {
    const { data, error } = await supabase
      .from("news")
      .select("id, category, title, summary, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error loading homepage news:", error);
      return;
    }

    setNews(data ?? []);
  }

  loadLatestNews();
}, []);
  const [selectedKit, setSelectedKit] = useState("Overall");
  const [searchTerm, setSearchTerm] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayers() {
      const { data, error } = await supabase
        .from("player_kit_ranks")
        .select(`
  rank_code,
  is_retired,
  profiles(username),
  kits(name)
`)

      if (error) {
        console.error("Could not load rankings:", error.message);
        setLoading(false);
        return;
      }

      const grouped: Record<string, Player[]> = {};

      for (const entry of data ?? []) {
        const username = (entry.profiles as any)?.username;
        const kitName = (entry.kits as any)?.name;

        if (!username || !kitName) continue;

        if (!grouped[username]) {
          grouped[username] = [];
        }

        grouped[username].push({
  name: username,
  rank: entry.rank_code,
  points: rankPoints[entry.rank_code] ?? 0,
  kit: kitName,
  wins: 0,
  is_retired: entry.is_retired ?? false,
});
      }

      const result = Object.values(grouped).flat();
      setPlayers(result);
      setLoading(false);
    }

    loadPlayers();
  }, []);

  const sortedPlayers = selectedKit === "Overall"
  ? Object.values(
      players.reduce<Record<string, Player>>((acc, player) => {
        if (!acc[player.name]) {
          acc[player.name] = {
            ...player,
            kit: "Overall",
            points: 0,
          };
        }

        // Alle Kit-Punkte addieren
        acc[player.name].points += player.points;

        // Immer den höchsten Rang übernehmen
       if (
  (rankPoints[player.rank] ?? 0) >
  (rankPoints[acc[player.name].rank] ?? 0)
) {
  acc[player.name].rank = player.rank;
  acc[player.name].is_retired = player.is_retired;
}

        return acc;
      }, {})
    ).sort((a, b) => b.points - a.points)
  : players
      .filter((player) => player.kit === selectedKit)
      .sort((a, b) => b.points - a.points);

const visiblePlayers = sortedPlayers.filter((player) =>
  player.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
);

        if (loading) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090711] text-white">
      Loading EXODUS RANKED...
    </main>
  );
}



  return (
    <main className="min-h-screen bg-[#090711] text-white">
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0a18]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-xl font-black shadow-lg shadow-purple-600/30">
              E
            </div>
            <div>
              <div className="text-lg font-black tracking-wider">
                EXODUS <span className="text-purple-400">RANKED</span>
              </div>
              <div className="text-[9px] tracking-[0.3em] text-gray-500">
                COMPETITIVE MINECRAFT
              </div>
            </div>
          
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium text-gray-400 md:flex">
            <a href="#rankings" className="transition hover:text-purple-400">Rankings</a>
            <a href="/players" className="transition hover:text-purple-400">Players</a>
            <a href="/news" className="transition hover:text-purple-400">News</a>
            <a href="/tournaments" className="transition hover:text-purple-400">Tournaments</a>
          </div>
          </div>
</nav>
<AccountMenu />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-purple-700/20 blur-[130px]" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[130px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-bold tracking-widest text-purple-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
              SEASON 1 · COMING SOON
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
              PROVE YOUR
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                SKILL.
              </span>
              <br />
              CLAIM YOUR
              <br />
              RANK.
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-relaxed text-gray-400">
              The competitive Minecraft PvP ranking platform.
              Challenge the best players, prove your skill and
              earn your place in the rankings.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a href="#rankings" className="rounded-xl bg-purple-600 px-7 py-4 font-bold shadow-xl shadow-purple-600/20 transition hover:-translate-y-1 hover:bg-purple-500">
                Explore Rankings →
              </a>
              <a href="/news" className="rounded-xl border border-white/10 bg-white/5 px-7 py-4 font-bold transition hover:bg-white/10">
                Latest News
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-purple-600/20 blur-3xl" />
            <div className="relative rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#211638] via-[#151025] to-[#0c0a15] p-8 shadow-2xl shadow-purple-950/50">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold tracking-widest text-purple-400">EXODUS RANKED</div>
                  <div className="mt-1 text-2xl font-black">THE ELITE</div>
                </div>
                <div className="rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-300">
                  TOP PLAYERS
                </div>
              </div>

              {sortedPlayers.slice(0, 4).map((player, index) => (
                <div key={player.name} className="mb-3 flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.04] p-4">
                  <div className="text-xl font-black text-gray-500">
                    0{index + 1}
                  </div>
                  <div className="flex-1">
                    <a
  href={`/players/${encodeURIComponent(player.name)}`}
  className="font-bold transition hover:text-purple-300"
>
  {player.name}
</a>
                    <div className="text-xs text-gray-500">{player.kit}</div>
                  </div>
                  <div className={`font-black ${rankColors[player.rank]}`}>
                    {player.rank}
                  </div>
                </div>
              ))}

              <div className="mt-6 border-t border-white/10 pt-5 text-center text-xs tracking-widest text-gray-500">
                COMPETE · IMPROVE · DOMINATE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 py-10 md:grid-cols-4">
        {[
          ["10", "RANK TIERS"],
          ["08", "PVP KITS"],
          ["01", "SEASON"],
          ["∞", "COMPETITION"],
        ].map(([number, label]) => (
          <div key={label} className="rounded-2xl border border-white/5 bg-[#110e1c] p-6 text-center">
            <div className="text-3xl font-black text-purple-400">{number}</div>
            <div className="mt-2 text-xs font-bold tracking-widest text-gray-500">{label}</div>
          </div>
        ))}
      </section>

      {/* RANKINGS */}
      <section id="rankings" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-[0.3em] text-purple-400">COMPETITIVE LADDER</div>
            <h2 className="mt-3 text-4xl font-black">RANKINGS<span className="text-purple-500">.</span></h2>
            <p className="mt-2 text-gray-500">Find the best players in every PvP kit.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400">
            SEASON 1
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-3">
          {kits.map((kit) => (
            <button
              key={kit}
              onClick={() => setSelectedKit(kit)}
              className={`whitespace-nowrap rounded-lg px-5 py-3 text-sm font-bold transition ${
                selectedKit === kit
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "border border-white/10 bg-white/[0.03] text-gray-400 hover:border-purple-500/40 hover:text-white"
              }`}
            >
              {kit}
            </button>
          ))}
                <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search players..."
            className="w-full rounded-xl border border-purple-500/20 bg-[#151020] px-5 py-4 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500"
          />
        </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#110e1c]">
          <div className="grid grid-cols-12 border-b border-white/10 bg-white/[0.03] px-5 py-4 text-xs font-bold tracking-wider text-gray-500">
            <div className="col-span-2">#</div>
            <div className="col-span-5">PLAYER</div>
            <div className="col-span-3">RANK</div>
            <div className="col-span-2 text-right">POINTS</div>
          </div>


{selectedKit === "Overall" ? (
  visiblePlayers.length > 0 ? (
    visiblePlayers.map((player, index) => (
    <div
      key={player.name}
      className="grid grid-cols-12 items-center border-b border-white/5 px-5 py-5 transition last:border-0 hover:bg-purple-500/5"
    >
      <div className="col-span-2 font-bold text-gray-500">
        #{index + 1}
      </div>
      <a
  href={`/players/${encodeURIComponent(player.name)}`}
  className="col-span-5 font-bold transition hover:text-purple-400"
>
  {player.name}
</a>
      <div className={`col-span-3 font-black ${rankColors[player.rank]}`}>
        {player.rank}
      </div>
      <div className="col-span-2 text-right font-bold text-gray-300">
        {player.points}
      </div>
    </div>
  ))   ) : (
    <div className="px-6 py-12 text-center">
      <p className="text-lg font-bold text-white">No players found</p>
      <p className="mt-2 text-sm text-gray-500">
        Try another player name.
      </p>
    </div>
  )
) : visiblePlayers.length > 0 ? (
  <>
    {/* HT1 CHAMPION */}
    <div className="border-b border-purple-500/20 bg-purple-500/10 p-5">
      <div className="mb-3 text-xs font-bold tracking-widest text-purple-400">
        OFFICIAL TOURNAMENT CHAMPION
      </div>

      {visiblePlayers.filter((player) => player.rank === "HT1").map((player) => (
        <div
          key={player.name}
          className="flex items-center justify-between rounded-xl border border-purple-500/30 bg-purple-500/10 p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <div className="font-black text-purple-300">HT1</div>
              <div className="font-bold">{player.name}</div>
            </div>
          </div>
          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300">
            CHAMPION
          </span>
        </div>
      ))}

      {!sortedPlayers.some((player) => player.rank === "HT1") && (
        <p className="text-sm text-gray-500">No champion yet.</p>
      )}
    </div>

    {/* TIER ROWS */}
    {[
      { tier: "T1", ranks: ["LT1"] },
      { tier: "T2", ranks: ["HT2", "LT2"] },
      { tier: "T3", ranks: ["HT3", "LT3"] },
      { tier: "T4", ranks: ["HT4", "LT4"] },
      { tier: "T5", ranks: ["HT5", "LT5"] },
    ].map((group) => {
      const tierPlayers = visiblePlayers.filter((player) =>
        group.ranks.includes(player.rank)
      );

      return (
        <div
          key={group.tier}
          className="border-b border-white/5 px-5 py-5 last:border-0"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-purple-400">
              {group.tier}
            </h3>
            <span className="text-xs text-gray-500">
              {tierPlayers.length} PLAYERS
            </span>
          </div>

          {tierPlayers.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {tierPlayers.map((player) => (
                <div
                  key={player.name}
                  className="min-w-36 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className={`text-xs font-black ${rankColors[player.rank]}`}>
                    {player.rank}
                  </div>
                  <a
  href={`/players/${encodeURIComponent(player.name)}`}
  className="mt-1 block font-bold transition hover:text-purple-400"
>
  {player.name}
</a>
                  <div className="mt-1 text-xs text-gray-500">
                    {player.points} points
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              No players ranked yet.
            </p>
          )}
        </div>
      );
    })}
  </>
) : (
  <div className="px-6 py-12 text-center">
    <p className="text-lg font-bold text-white">No players found</p>
    <p className="mt-2 text-sm text-gray-500">
      Try another player name.
    </p>
  </div>
)}

        </div>
        <p className="mt-3 text-xs text-gray-600">
          Rankings can be changed at any time based on based on player performance and tournament results.
        </p>
      </section>

      {/* NEWS */}
      <section id="news" className="border-y border-white/5 bg-[#0e0b18] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10">
            <div className="text-xs font-bold tracking-[0.3em] text-purple-400">WHAT'S HAPPENING</div>
            <h2 className="mt-3 text-4xl font-black">LATEST NEWS<span className="text-purple-500">.</span></h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
           <div className="grid gap-5 md:grid-cols-3">
  {news.map((item) => (
    <Link
      key={item.id}
      href={`/news/${item.id}`}
      className="group rounded-2xl border border-white/10 bg-[#151120] p-7 transition hover:-translate-y-1 hover:border-purple-500/40"
    >
      <div className="text-xs font-black tracking-widest text-purple-400">
        {item.category}
      </div>

      <h3 className="mt-6 text-xl font-black">{item.title}</h3>

      <p className="mt-3 min-h-12 text-sm leading-relaxed text-gray-400">
        {item.summary}
      </p>

      <div className="mt-7 border-t border-white/10 pt-5 text-xs font-bold tracking-widest text-gray-500">
        {new Date(item.created_at).toLocaleDateString("de-AT")}
      </div>
    </Link>
  ))}
</div>
            
          </div>
          
        </div>

      </section>

      {/* TOURNAMENT CTA */}
      <section id="tournaments" className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-r from-[#28164a] to-[#151025] p-10 md:p-16">
          <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="text-xs font-bold tracking-[0.3em] text-purple-300">THE ROAD TO HT1</div>
            <h2 className="mt-5 text-4xl font-black md:text-5xl">
              ONLY ONE CAN CLAIM THE TOP.
            </h2>
            <p className="mt-5 text-gray-300">
              HT1 is reserved for the official tournament champion.
              Compete, win and make history.
            </p>
            <button className="mt-8 rounded-xl bg-white px-7 py-4 font-black text-purple-950 transition hover:bg-purple-100">
              TOURNAMENTS COMING SOON
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#07060d] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <div className="text-lg font-black tracking-wider">
            EXODUS <span className="text-purple-400">RANKED</span>
          </div>
          <div className="text-center text-xs text-gray-600">
            AN INDEPENDENT MINECRAFT PVP RANKING PROJECT.
            <br />
            NOT AN OFFICIAL MINECRAFT PRODUCT.
          </div>
          <div className="text-xs text-gray-500">© 2026 EXODUS RANKED</div>
        </div>
      </footer>
    </main>
  );
}
