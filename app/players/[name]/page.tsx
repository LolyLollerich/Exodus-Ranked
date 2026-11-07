
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MinecraftSkin from "@/app/components/MinecraftSkin";
import TierTestRequest from "@/app/components/TierTestRequest";

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
  HT1: "text-yellow-400",
  LT1: "text-orange-400",
  HT2: "text-red-400",
  LT2: "text-red-300",
  HT3: "text-purple-400",
  LT3: "text-purple-300",
  HT4: "text-blue-400",
  LT4: "text-blue-300",
  HT5: "text-green-400",
  LT5: "text-green-300",
};

type Kit = {
  id: number;
  name: string;
};

type KitRank = {
  kit_id: number;
  rank_code: string;
  is_retired: boolean;
};

type Profile = {
  id: string;
  username: string;
};

function PlayerProfileContent() {
  const params = useParams<{ name: string }>();
  const username = decodeURIComponent(params.name);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [kits, setKits] = useState<Kit[]>([]);
  const [playerRanks, setPlayerRanks] = useState<KitRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", username)
        .single();

      if (profileError || !profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const [kitResult, rankResult] = await Promise.all([
        supabase
          .from("kits")
          .select("id, name")
          .eq("active", true)
          .order("name"),

        supabase
          .from("player_kit_ranks")
          .select("rank_code, kit_id, is_retired, kits(name)")
          .eq("player_id", profileData.id),
      ]);

      if (!kitResult.error) {
        setKits(kitResult.data ?? []);
      }

      if (!rankResult.error) {
        setPlayerRanks(rankResult.data ?? []);
      }

      setLoading(false);
    }

    loadProfile();
  }, [username]);

  const totalPoints = playerRanks.reduce(
    (total, item) => total + (rankPoints[item.rank_code] ?? 0),
    0
  );

  const bestRank = playerRanks.reduce(
    (best, item) =>
      (rankPoints[item.rank_code] ?? 0) > (rankPoints[best] ?? 0)
        ? item.rank_code
        : best,
    "UNRANKED"
  );

  const rankedKits = playerRanks.length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090711] text-white">
        Loading player profile...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#090711] px-6 text-center text-white">
        <h1 className="text-4xl font-black">PLAYER NOT FOUND</h1>
        <p className="mt-3 text-gray-400">
          This player does not exist in EXODUS RANKED.
        </p>
        <Link href="/" className="mt-6 text-purple-400 hover:text-purple-300">
          Back to rankings
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090711] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm text-purple-400 transition hover:text-purple-300"
        >
          ← BACK TO RANKINGS
        </Link>

        {/* PLAYER HEADER */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#21143b] to-[#100d1b] p-8 md:p-12">
          <div className="flex flex-col items-center gap-7 sm:flex-row">
            <MinecraftSkin username={profile.username} />

            <div className="text-center sm:text-left">
              <div className="text-xs font-bold tracking-[0.3em] text-purple-400">
                EXODUS RANKED PLAYER
              </div>

              <h1 className="mt-3 text-4xl font-black md:text-5xl">
                {profile.username}
              </h1>

              <p className="mt-3 text-sm text-gray-400">
                Registered EXODUS RANKED player
              </p>
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#151120] p-6">
            <div className="text-xs font-bold tracking-widest text-gray-500">
              OVERALL POINTS
            </div>
            <div className="mt-3 text-4xl font-black text-purple-400">
              {totalPoints}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#151120] p-6">
            <div className="text-xs font-bold tracking-widest text-gray-500">
              RANKED KITS
            </div>
            <div className="mt-3 text-4xl font-black">
              {rankedKits}/{kits.length}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#151120] p-6">
            <div className="text-xs font-bold tracking-widest text-gray-500">
              BEST RANK
            </div>
            <div
              className={`mt-3 text-4xl font-black ${
                rankColors[bestRank] ?? "text-gray-600"
              }`}
            >
              {bestRank}
            </div>
          </div>
        </section>

        {/* KIT RANKINGS */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold tracking-[0.3em] text-purple-400">
                COMPETITIVE STATISTICS
              </div>
              <h2 className="mt-2 text-3xl font-black">KIT RANKINGS</h2>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kits.map((kit) => {
              const playerRank = playerRanks.find(
                (item) => item.kit_id === kit.id
              );

              const rank = playerRank?.rank_code ?? "UNRANKED";
              const displayedRank = playerRank?.is_retired
                ? `R${rank}`
                : rank;

              const points = rankPoints[rank] ?? 0;

              return (
                <div
                  key={kit.id}
                  className="rounded-2xl border border-white/10 bg-[#151120] p-6 transition hover:border-purple-500/40"
                >
                  <div className="text-xs font-bold tracking-widest text-gray-500">
                    {kit.name.toUpperCase()}
                  </div>

                  <div
                    className={`mt-4 text-3xl font-black ${
                      rankColors[rank] ?? "text-gray-600"
                    }`}
                  >
                    {displayedRank}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs text-gray-500">
                      RANK POINTS
                    </span>
                    <span className="font-bold">{points}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-8">
          <TierTestRequest playerId={profile.id} />
        </div>
      </div>
    </main>
  );
}

export default function PlayerPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#090711] text-white">
          Loading player profile...
        </main>
      }
    >
      <PlayerProfileContent />
    </Suspense>
  );
}
