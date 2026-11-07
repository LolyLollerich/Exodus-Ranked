
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Tournament = {
  id: string;
  title: string;
  description: string;
  kit_id: number;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  starts_at: string;
  max_participants: number | null;
  winner_id: string | null;
};

type Kit = {
  id: number;
  name: string;
};

type Participant = {
  tournament_id: string;
};

type Profile = {
  id: string;
  username: string;
};

type TournamentMatch = {
  tournament_id: string;
  status: "PENDING" | "COMPLETED" | "BYE";
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [selectedKit, setSelectedKit] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTournaments() {
      setLoading(true);
      setErrorMessage("");

      try {
        const [
          tournamentResult,
          kitResult,
          participantResult,
          matchResult,
        ] = await Promise.all([
          supabase
            .from("tournaments")
            .select("*"),

          supabase
            .from("kits")
            .select("id, name"),

          supabase
            .from("tournament_participants")
            .select("tournament_id, player_id"),

          supabase
            .from("tournament_matches")
            .select("tournament_id, status"),
        ]);

        if (tournamentResult.error) {
          throw tournamentResult.error;
        }

        if (kitResult.error) {
          throw kitResult.error;
        }

        if (participantResult.error) {
          throw participantResult.error;
        }

        if (matchResult.error) {
          throw matchResult.error;
        }

        const tournamentData = tournamentResult.data ?? [];
        const participantData = participantResult.data ?? [];

        setTournaments(tournamentData);
        setKits(kitResult.data ?? []);
        setParticipants(participantData);
        setMatches(matchResult.data ?? []);

        // Load champion usernames
        const winnerIds = [
          ...new Set(
            tournamentData
              .map((tournament) => tournament.winner_id)
              .filter((id): id is string => id !== null)
          ),
        ];

        if (winnerIds.length > 0) {
          const { data: profileData, error: profileError } =
            await supabase
              .from("profiles")
              .select("id, username")
              .in("id", winnerIds);

          if (profileError) {
            console.error(profileError);
          }

          setProfiles(profileData ?? []);
        } else {
          setProfiles([]);
        }
      } catch (error) {
        console.error("Tournament loading error:", error);
        setErrorMessage("Could not load tournaments. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadTournaments();
  }, []);

  function getParticipantCount(tournamentId: string) {
    return participants.filter(
      (participant) => participant.tournament_id === tournamentId
    ).length;
  }

  function getKitName(kitId: number) {
    return kits.find((kit) => kit.id === kitId)?.name ?? "Unknown Kit";
  }

  function getChampionName(winnerId: string | null) {
    if (!winnerId) return "No champion recorded";

    return (
      profiles.find((profile) => profile.id === winnerId)?.username ??
      "Unknown Player"
    );
  }

  function getTournamentMatches(tournamentId: string) {
    return matches.filter(
      (match) => match.tournament_id === tournamentId
    );
  }

  function getMatchProgress(tournamentId: string) {
    const tournamentMatches = getTournamentMatches(tournamentId);

    const total = tournamentMatches.filter(
      (match) => match.status !== "BYE"
    ).length;

    const completed = tournamentMatches.filter(
      (match) => match.status === "COMPLETED"
    ).length;

    return { total, completed };
  }

  function getStatusStyle(status: Tournament["status"]) {
    if (status === "LIVE") {
      return "border-red-500/30 bg-red-500/10 text-red-300";
    }

    if (status === "FINISHED") {
      return "border-gray-500/30 bg-gray-500/10 text-gray-400";
    }

    return "border-purple-500/30 bg-purple-500/10 text-purple-300";
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const filteredTournaments = tournaments.filter(
    (tournament) =>
      selectedKit === "ALL" ||
      tournament.kit_id.toString() === selectedKit
  );

  const activeTournaments = filteredTournaments
    .filter((tournament) => tournament.status !== "FINISHED")
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() -
        new Date(b.starts_at).getTime()
    );

  const tournamentHistory = filteredTournaments
    .filter((tournament) => tournament.status === "FINISHED")
    .sort(
      (a, b) =>
        new Date(b.starts_at).getTime() -
        new Date(a.starts_at).getTime()
    );

  function renderTournamentCard(tournament: Tournament) {
    const count = getParticipantCount(tournament.id);
    const progress = getMatchProgress(tournament.id);
    const isFinished = tournament.status === "FINISHED";

    return (
      <Link
        key={tournament.id}
        href={`/tournaments/${tournament.id}`}
        className={`group rounded-2xl border bg-[#110e1c] p-7 transition hover:border-purple-500/40 hover:bg-[#171226] ${
          isFinished
            ? "border-yellow-500/15"
            : "border-white/10"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold tracking-widest text-purple-400">
            {getKitName(tournament.kit_id).toUpperCase()}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(
              tournament.status
            )}`}
          >
            {tournament.status}
          </span>
        </div>

        <h2 className="mt-5 text-2xl font-black transition group-hover:text-purple-300">
          {tournament.title}
        </h2>

        <p className="mt-3 line-clamp-3 text-sm text-gray-400">
          {tournament.description}
        </p>

        {isFinished ? (
          <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <p className="text-xs font-bold tracking-widest text-yellow-400">
              🏆 TOURNAMENT CHAMPION
            </p>

            <p className="mt-2 text-lg font-black text-white">
              {getChampionName(tournament.winner_id)}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Official Tournament Winner
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold tracking-widest text-gray-400">
                MATCH PROGRESS
              </p>

              <p className="text-sm font-bold text-purple-400">
                {progress.completed} / {progress.total}
              </p>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-purple-500"
                style={{
                  width: `${
                    progress.total > 0
                      ? (progress.completed / progress.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-5 text-sm text-gray-400">
          <span>{formatDate(tournament.starts_at)}</span>

          <span>
            {count}
            {tournament.max_participants
              ? ` / ${tournament.max_participants}`
              : ""}{" "}
            Players
          </span>
        </div>

        <div className="mt-5 font-bold text-purple-400 transition group-hover:text-purple-300">
          {isFinished ? "VIEW RESULTS →" : "VIEW TOURNAMENT →"}
        </div>
      </Link>
    );
  }

  return (
    <main className="min-h-screen bg-[#090711] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          ← Back to EXODUS RANKED
        </Link>

        {/* HEADER */}
        <div className="mt-10">
          <p className="text-xs font-bold tracking-[0.3em] text-purple-400">
            COMPETITIVE SCENE
          </p>

          <h1 className="mt-3 text-5xl font-black">
            TOURNAMENTS
          </h1>

          <p className="mt-4 text-gray-400">
            Compete against the best players and fight for the top rank.
          </p>
        </div>

        {/* KIT FILTER */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-bold tracking-widest text-gray-400">
            FILTER BY KIT
          </h2>

          <select
            value={selectedKit}
            onChange={(event) => setSelectedKit(event.target.value)}
            className="rounded-lg border border-white/10 bg-[#110e1c] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
          >
            <option value="ALL">All Kits</option>

            {kits.map((kit) => (
              <option key={kit.id} value={kit.id.toString()}>
                {kit.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="mt-12 text-gray-400">
            Loading tournaments...
          </p>
        ) : errorMessage ? (
          <div className="mt-12 rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="text-red-300">{errorMessage}</p>
          </div>
        ) : (
          <>
            {/* ACTIVE TOURNAMENTS */}
            <section className="mt-12">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-widest text-purple-400">
                    COMPETE NOW
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    LIVE & UPCOMING
                  </h2>
                </div>

                <span className="text-sm text-gray-500">
                  {activeTournaments.length} tournaments
                </span>
              </div>

              {activeTournaments.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#110e1c] p-10 text-center">
                  <h3 className="text-xl font-black">
                    NO ACTIVE TOURNAMENTS
                  </h3>

                  <p className="mt-3 text-sm text-gray-400">
                    Check back later for upcoming competitions.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {activeTournaments.map(renderTournamentCard)}
                </div>
              )}
            </section>

            {/* TOURNAMENT HISTORY */}
            <section className="mt-20">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-widest text-yellow-400">
                    HALL OF CHAMPIONS
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    TOURNAMENT HISTORY
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Past competitions and their champions.
                  </p>
                </div>

                <span className="text-sm text-gray-500">
                  {tournamentHistory.length} completed
                </span>
              </div>

              {tournamentHistory.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#110e1c] p-10 text-center">
                  <div className="text-4xl">🏆</div>

                  <h3 className="mt-4 text-xl font-black">
                    NO TOURNAMENT HISTORY
                  </h3>

                  <p className="mt-3 text-sm text-gray-400">
                    Completed tournaments and their champions will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {tournamentHistory.map(renderTournamentCard)}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
