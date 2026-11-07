
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NewsManager from "@/app/components/NewsManager";
import TournamentManager from "@/app/components/TournamentManager";
import TierTestManager from "@/app/components/TierTestManager";

type Profile = {
  id: string;
  username: string;
};

type Kit = {
  id: number;
  name: string;
};

type Rank = {
  code: string;
  tier_group: string;
  rank_order: number;
  points: number;
};

type PlayerRank = {
  player_id: string;
  kit_id: number;
  rank_code: string;
};

export default function OperatorPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Profile[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [playerRanks, setPlayerRanks] = useState<PlayerRank[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedKit, setSelectedKit] = useState("");
  const [selectedRank, setSelectedRank] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!profile || !["operator", "admin"].includes(profile.role)) {
        setLoading(false);
        return;
      }

      setAuthorized(true);

      const [playerResult, kitResult, rankResult, playerRankResult] =
        await Promise.all([
          supabase.from("profiles").select("id, username").order("username"),
          supabase.from("kits").select("id, name").eq("active", true),
          supabase.from("ranks").select("code, tier_group, rank_order, points").order("rank_order"),
          supabase.from("player_kit_ranks").select("player_id, kit_id, rank_code"),
        ]);

      if (
        playerResult.error ||
        kitResult.error ||
        rankResult.error ||
        playerRankResult.error
      ) {
        setMessage("Could not load dashboard data.");
      } else {
        setPlayers(playerResult.data ?? []);
        setKits(kitResult.data ?? []);
        setRanks(rankResult.data ?? []);
        setPlayerRanks(playerRankResult.data ?? []);
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  async function saveRank() {
    setMessage("");

    if (!selectedPlayer || !selectedKit || !selectedRank) {
      setMessage("Please select a player, kit and rank.");
      return;
    }

    const { error } = await supabase
      .from("player_kit_ranks")
      .upsert(
        {
          player_id: selectedPlayer,
          kit_id: Number(selectedKit),
          rank_code: selectedRank,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "player_id,kit_id" }
      );

    if (error) {
      setMessage(error.message);
      return;
    }

    setPlayerRanks((current) => [
      ...current.filter(
        (item) =>
          !(
            item.player_id === selectedPlayer &&
            item.kit_id === Number(selectedKit)
          )
      ),
      {
        player_id: selectedPlayer,
        kit_id: Number(selectedKit),
        rank_code: selectedRank,
      },
    ]);

    setMessage("Ranking successfully updated!");
  }
  async function removeRank() {
  setMessage("");

  if (!selectedPlayer || !selectedKit) {
    setMessage("Please select a player and kit.");
    return;
  }

  const player = players.find((p) => p.id === selectedPlayer);
  const kit = kits.find((k) => k.id === Number(selectedKit));

  if (
    !window.confirm(
      `Remove ${player?.username}'s rank in ${kit?.name}? The player will become UNRANKED.`
    )
  ) {
    return;
  }

  const { error } = await supabase
    .from("player_kit_ranks")
    .delete()
    .eq("player_id", selectedPlayer)
    .eq("kit_id", Number(selectedKit));

  if (error) {
    setMessage("Error removing rank: " + error.message);
    return;
  }

  setPlayerRanks((current) =>
    current.filter(
      (item) =>
        !(
          item.player_id === selectedPlayer &&
          item.kit_id === Number(selectedKit)
        )
    )
  );

  setSelectedRank("");
  setMessage("Rank successfully removed. Player is now UNRANKED!");
}

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090711] text-white">
        Loading dashboard...
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#090711] px-6 text-center text-white">
        <h1 className="text-3xl font-black">ACCESS DENIED</h1>
        <p className="mt-3 text-gray-400">
          You must be logged in as an operator or admin.
        </p>
        <Link href="/" className="mt-6 text-purple-400 hover:text-purple-300">
          Back to homepage
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090711] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-purple-400 hover:text-purple-300">
          ← Back to EXODUS RANKED
        </Link>

        <div className="mt-8">
          <div className="text-xs font-bold tracking-[0.3em] text-purple-400">
            STAFF CONTROL CENTER
          </div>
          <h1 className="mt-3 text-4xl font-black">OPERATOR DASHBOARD</h1>
          <p className="mt-3 text-gray-400">
            Manage official player rankings across all kits.
          </p>
        </div>

        <section className="mt-10 rounded-2xl border border-white/10 bg-[#110e1c] p-8">
          <h2 className="text-xl font-black">ASSIGN PLAYER RANK</h2>

          <div className="mt-7 grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Player
              </label>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#090711] px-4 py-3 text-white"
              >
                <option value="">Select player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Kit
              </label>
              <select
                value={selectedKit}
                onChange={(e) => setSelectedKit(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#090711] px-4 py-3 text-white"
              >
                <option value="">Select kit</option>
                {kits.map((kit) => (
                  <option key={kit.id} value={kit.id}>
                    {kit.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Rank
              </label>
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#090711] px-4 py-3 text-white"
              >
                <option value="">Select rank</option>
                {ranks.map((rank) => (
                  <option key={rank.code} value={rank.code}>
                    {rank.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
  <button
    onClick={saveRank}
    className="rounded-lg bg-purple-600 px-7 py-3 font-bold transition hover:bg-purple-500"
  >
    SAVE RANKING
  </button>

  <button
    onClick={removeRank}
    className="rounded-lg border border-red-500/30 bg-red-500/10 px-7 py-3 font-bold text-red-300 transition hover:bg-red-500/20"
  >
    REMOVE RANK
  </button>
</div>

          {message && (
            <p className="mt-5 rounded-lg border border-purple-500/20 bg-purple-500/10 p-4 text-sm text-purple-200">
              {message}
            </p>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-[#110e1c] p-8">
          <h2 className="text-xl font-black">CURRENT RANKINGS</h2>

          <div className="mt-6 space-y-3">
            {playerRanks.map((item) => {
              const player = players.find((p) => p.id === item.player_id);
              const kit = kits.find((k) => k.id === item.kit_id);

              return (
                <div
                  key={`${item.player_id}-${item.kit_id}`}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-4"
                >
                  <div>
                    <div className="font-bold">
                      {player?.username ?? "Unknown player"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {kit?.name ?? "Unknown kit"}
                    </div>
                  </div>
                  <span className="rounded-lg bg-purple-500/15 px-3 py-2 text-sm font-black text-purple-300">
                    {item.rank_code}
                  </span>
                </div>
              );
            })}

            {playerRanks.length === 0 && (
              <p className="text-sm text-gray-500">
                No rankings assigned yet.
              </p>
            )}
          </div>
        </section>

        {/* NEWS MANAGEMENT */}
        <section className="mt-8">
          <NewsManager />
        </section>
        <TournamentManager />
        <TierTestManager />
      </div>
    </main>
  );
}
