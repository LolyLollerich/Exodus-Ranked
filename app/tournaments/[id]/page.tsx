
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MinecraftSkin from "@/app/components/MinecraftSkin";

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

type Participant = {
  player_id: string;
  username: string;
};

type Profile = {
  id: string;
  username: string;
};

type TournamentMatch = {
  id: string;
  tournament_id: string;
  round_number: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  next_match_id: string | null;
  status: "PENDING" | "COMPLETED" | "BYE";
};

type Kit = {
  name: string;
};

function TournamentDetailsContent() {
  const params = useParams();
  const id = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [kitName, setKitName] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function loadTournament() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserId(user?.id ?? null);

      const { data: tournamentData, error: tournamentError } =
        await supabase
          .from("tournaments")
          .select("*")
          .eq("id", id)
          .single();

      if (tournamentError || !tournamentData) {
        console.error(tournamentError);
        setTournament(null);
        return;
      }

      setTournament(tournamentData);

      const [
        kitResult,
        participantResult,
        matchResult,
      ] = await Promise.all([
        supabase
          .from("kits")
          .select("name")
          .eq("id", tournamentData.kit_id)
          .single(),

        supabase
          .from("tournament_participants")
          .select("player_id")
          .eq("tournament_id", id)
          .order("registered_at", { ascending: true }),

        supabase
          .from("tournament_matches")
          .select(
            "id, tournament_id, round_number, match_number, player1_id, player2_id, winner_id, next_match_id, status"
          )
          .eq("tournament_id", id)
          .order("round_number", { ascending: true })
          .order("match_number", { ascending: true }),
      ]);

      if (kitResult.error) {
        console.error(kitResult.error);
      } else {
        setKitName((kitResult.data as Kit | null)?.name ?? "Unknown Kit");
      }

      if (participantResult.error) {
        console.error(participantResult.error);
        setMessage("Could not load participants.");
        setParticipants([]);
      } else {
        const participantData = participantResult.data ?? [];

        const participantIds = participantData.map(
          (participant) => participant.player_id
        );

        const { data: profileData, error: profileError } =
          participantIds.length > 0
            ? await supabase
                .from("profiles")
                .select("id, username")
                .in("id", participantIds)
            : { data: [], error: null };

        if (profileError) {
          console.error(profileError);
          setMessage("Could not load player profiles.");
        }

        const loadedProfiles = (profileData ?? []) as Profile[];

        setProfiles(loadedProfiles);

        const profileMap = new Map(
          loadedProfiles.map((profile) => [
            profile.id,
            profile.username,
          ])
        );

        setParticipants(
          participantData.map((participant) => ({
            player_id: participant.player_id,
            username:
              profileMap.get(participant.player_id) ?? "Unknown player",
          }))
        );
      }

      if (matchResult.error) {
        console.error(matchResult.error);
        setMatches([]);
      } else {
        setMatches((matchResult.data ?? []) as TournamentMatch[]);
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while loading the tournament.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTournament();
  }, [id]);

  const isRegistered = participants.some(
    (participant) => participant.player_id === userId
  );

  const isFull =
    tournament?.max_participants !== null &&
    tournament?.max_participants !== undefined &&
    participants.length >= tournament.max_participants;

  function getUsername(playerId: string | null) {
    if (!playerId) return "Waiting...";

    return (
      profiles.find((profile) => profile.id === playerId)?.username ??
      participants.find((participant) => participant.player_id === playerId)
        ?.username ??
      "Unknown player"
    );
  }

  function getRoundName(roundNumber: number, totalRounds: number) {
    const remainingPlayers = 2 ** (totalRounds - roundNumber + 1);

    if (roundNumber === totalRounds) return "FINAL";
    if (remainingPlayers === 4) return "SEMIFINAL";
    if (remainingPlayers === 8) return "QUARTERFINAL";

    return `ROUND OF ${remainingPlayers}`;
  }

  async function joinTournament() {
    if (!userId) {
      setMessage("Please log in before joining a tournament.");
      return;
    }

    if (!tournament || tournament.status !== "UPCOMING") return;
    if (isFull || isRegistered) return;

    setBusy(true);
    setMessage("");

   
const { error } = await supabase.rpc("join_tournament", {
  p_tournament_id: tournament.id,
});


    if (error) {
      setMessage(
        error.code === "23505"
          ? "You are already registered."
          : error.message
      );
    } else {
      setMessage("You successfully joined the tournament!");
    }

    await loadTournament();
    setBusy(false);
  }

  async function leaveTournament() {
    if (!userId || !tournament) return;

    setBusy(true);
    setMessage("");

    const { error } = await supabase
      .from("tournament_participants")
      .delete()
      .eq("tournament_id", tournament.id)
      .eq("player_id", userId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("You left the tournament.");
    }

    await loadTournament();
    setBusy(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090711] text-white">
        Loading tournament...
      </main>
    );
  }

  if (!tournament) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#090711] text-white">
        <h1 className="text-3xl font-black">TOURNAMENT NOT FOUND</h1>
        <Link href="/tournaments" className="mt-5 text-purple-400">
          Back to tournaments
        </Link>
      </main>
    );
  }

  const statusStyle =
    tournament.status === "LIVE"
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : tournament.status === "FINISHED"
        ? "border-gray-500/30 bg-gray-500/10 text-gray-400"
        : "border-purple-500/30 bg-purple-500/10 text-purple-300";

  const totalRounds =
    matches.length > 0
      ? Math.max(...matches.map((match) => match.round_number))
      : 0;

  const rounds = Array.from(
    { length: totalRounds },
    (_, index) => index + 1
  );

  return (
    <main className="min-h-screen bg-[#090711] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/tournaments"
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          ← Back to tournaments
        </Link>

        {/* TOURNAMENT HEADER */}

        <section className="mt-10 rounded-2xl border border-white/10 bg-[#110e1c] p-8 md:p-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold tracking-[0.3em] text-purple-400">
              {kitName.toUpperCase()} TOURNAMENT
            </span>

            <span
              className={`rounded-full border px-4 py-2 text-xs font-bold ${statusStyle}`}
            >
              {tournament.status}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-black md:text-5xl">
            {tournament.title}
          </h1>

          <p className="mt-5 leading-relaxed text-gray-400">
            {tournament.description || "No description available."}
          </p>

          <div className="mt-10 grid gap-5 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">START DATE</p>
              <p className="mt-2 font-bold">
                {new Date(tournament.starts_at).toLocaleString("de-AT")}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">PARTICIPANTS</p>
              <p className="mt-2 font-bold">
                {participants.length}
                {tournament.max_participants
                  ? ` / ${tournament.max_participants}`
                  : ""}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">KIT</p>
              <p className="mt-2 font-bold">{kitName}</p>
            </div>
          </div>

          {/* REGISTRATION */}

          {tournament.status === "UPCOMING" && (
            <div className="mt-9">
              {!userId ? (
                <Link
                  href="/login"
                  className="inline-block rounded-lg bg-purple-600 px-7 py-3 font-bold transition hover:bg-purple-500"
                >
                  LOGIN TO JOIN
                </Link>
              ) : isRegistered ? (
                <button
                  onClick={leaveTournament}
                  disabled={busy}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-7 py-3 font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  {busy ? "PLEASE WAIT..." : "LEAVE TOURNAMENT"}
                </button>
              ) : (
                <button
                  onClick={joinTournament}
                  disabled={busy || isFull}
                  className="rounded-lg bg-purple-600 px-7 py-3 font-bold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy
                    ? "PLEASE WAIT..."
                    : isFull
                      ? "TOURNAMENT FULL"
                      : "JOIN TOURNAMENT"}
                </button>
              )}
            </div>
          )}

          {message && (
            <p className="mt-5 rounded-lg border border-purple-500/20 bg-purple-500/10 p-4 text-sm text-purple-200">
              {message}
            </p>
          )}
        </section>

       
{/* TOURNAMENT BRACKET */}

<section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#110e1c] p-6 md:p-8">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <p className="text-xs font-bold tracking-[0.3em] text-purple-400">
        COMPETITIVE SCENE
      </p>
      <h2 className="mt-2 text-2xl font-black md:text-3xl">
        TOURNAMENT BRACKET
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Follow the road to the championship.
      </p>
    </div>

    {matches.length > 0 && (
      <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3">
        <p className="text-xs text-purple-300">MATCH PROGRESS</p>
        <p className="mt-1 text-xl font-black">
          {matches.filter((match) => match.status === "COMPLETED").length}
          <span className="text-gray-500">
            {" / "}
            {matches.filter((match) => match.status !== "BYE").length}
          </span>
        </p>
      </div>
    )}
  </div>

  {matches.length === 0 ? (
    <div className="mt-8 rounded-xl border border-dashed border-white/10 p-12 text-center">
      <div className="text-4xl">🏆</div>
      <h3 className="mt-4 font-black">BRACKET NOT GENERATED</h3>
      <p className="mt-2 text-sm text-gray-500">
        The tournament tree will appear once the bracket has been generated.
      </p>
    </div>
  ) : (
    <div className="mt-10 overflow-x-auto pb-6">
      <div
        className="flex min-w-max items-stretch gap-8"
      >
        {rounds.map((roundNumber) => {
          const roundMatches = matches
            .filter((match) => match.round_number === roundNumber)
            .sort((a, b) => a.match_number - b.match_number);

          const isFinal = roundNumber === totalRounds;

          return (
            <div
              key={roundNumber}
              className="flex w-[280px] shrink-0 flex-col"
            >
              {/* ROUND HEADER */}

              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-bold tracking-widest text-purple-400">
                    ROUND {roundNumber}
                  </p>
                  <h3 className="mt-1 text-lg font-black">
                    {getRoundName(roundNumber, totalRounds)}
                  </h3>
                </div>

                {isFinal && (
                  <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs font-black text-yellow-300">
                    FINAL
                  </div>
                )}
              </div>

              {/* MATCHES */}

              <div className="flex flex-1 flex-col justify-around gap-6">
                {roundMatches.map((match) => {
                  const player1Won =
                    match.winner_id !== null &&
                    match.winner_id === match.player1_id;

                  const player2Won =
                    match.winner_id !== null &&
                    match.winner_id === match.player2_id;

                  const completed = match.status === "COMPLETED";
                  const bye = match.status === "BYE";

                  return (
                    <div
                      key={match.id}
                      className={`relative overflow-hidden rounded-xl border bg-[#0c0a14] transition ${
                        isFinal
                          ? "border-yellow-400/30 shadow-lg shadow-yellow-500/5"
                          : "border-white/10 hover:border-purple-500/40"
                      }`}
                    >
                      {/* MATCH HEADER */}

                      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                        <span className="text-xs font-bold text-gray-500">
                          MATCH {match.match_number}
                        </span>

                        <span
                          className={`text-[10px] font-black tracking-wider ${
                            completed
                              ? "text-green-400"
                              : bye
                                ? "text-yellow-300"
                                : "text-gray-500"
                          }`}
                        >
                          {completed
                            ? "COMPLETED"
                            : bye
                              ? "BYE"
                              : "PENDING"}
                        </span>
                      </div>

                      
{/* PLAYER 1 */}

<div
  className={`flex min-h-[82px] items-center justify-between gap-3 border-b border-white/5 px-3 py-2 ${
    player1Won
      ? "bg-green-500/10"
      : completed
        ? "opacity-40"
        : ""
  }`}
>
  <div className="flex min-w-0 items-center gap-3">
    {match.player1_id &&
      getUsername(match.player1_id) !== "Unknown player" ? (
        <MinecraftSkin
          username={getUsername(match.player1_id)}
          width={42}
          height={56}
        />
      ) : (
        <div className="flex h-14 w-[42px] shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-500">
          ?
        </div>
      )}

    <div className="min-w-0">
      <div
        className={`truncate text-sm ${
          player1Won
            ? "font-black text-green-300"
            : "font-bold text-gray-300"
        }`}
      >
        {getUsername(match.player1_id)}
      </div>

      <div className="mt-1 text-[10px] font-bold text-gray-600">
        PLAYER 1
      </div>
    </div>
  </div>

  {player1Won && (
    <span className="shrink-0 text-[10px] font-black text-green-400">
      WINNER
    </span>
  )}
</div>


                      
{/* PLAYER 2 */}

<div
  className={`flex min-h-[82px] items-center justify-between gap-3 px-3 py-2 ${
    player2Won
      ? "bg-green-500/10"
      : completed
        ? "opacity-40"
        : ""
  }`}
>
  <div className="flex min-w-0 items-center gap-3">
    {match.player2_id &&
      getUsername(match.player2_id) !== "Unknown player" ? (
        <MinecraftSkin
          username={getUsername(match.player2_id)}
          width={42}
          height={56}
        />
      ) : (
        <div className="flex h-14 w-[42px] shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-500">
          ?
        </div>
      )}

    <div className="min-w-0">
      <div
        className={`truncate text-sm ${
          player2Won
            ? "font-black text-green-300"
            : "font-bold text-gray-300"
        }`}
      >
        {getUsername(match.player2_id)}
      </div>

      <div className="mt-1 text-[10px] font-bold text-gray-600">
        PLAYER 2
      </div>
    </div>
  </div>

  {player2Won && (
    <span className="shrink-0 text-[10px] font-black text-green-400">
      WINNER
    </span>
  )}
</div>


                      {/* BYE INFO */}

                      {bye && (
                        <div className="border-t border-yellow-500/10 bg-yellow-500/5 px-4 py-3 text-xs font-bold text-yellow-300">
                          Automatically advanced
                        </div>
                      )}

                      {/* FINAL LABEL */}

                      {isFinal && completed && match.winner_id && (
                        <div className="border-t border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-center text-xs font-black tracking-widest text-yellow-300">
                          🏆 TOURNAMENT CHAMPION
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}
</section>


        {/* PARTICIPANTS */}

        <section className="mt-8 rounded-2xl border border-white/10 bg-[#110e1c] p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">PARTICIPANTS</h2>
            <span className="text-sm text-gray-500">
              {participants.length} registered
            </span>
          </div>

          {participants.length === 0 ? (
            <p className="mt-7 text-sm text-gray-500">
              No participants registered yet.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {participants.map((participant, index) => (
                <div
                  key={participant.player_id}
                  className="flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.03] p-4"
                >
                  <span className="font-bold text-purple-400">
                    #{index + 1}
                  </span>

                  <span className="font-bold">
                    {participant.username}
                  </span>

                  {participant.player_id === tournament.winner_id && (
                    <span className="ml-auto text-xs font-bold text-yellow-300">
                      WINNER
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
export default function TournamentDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#090711] text-white">
          Loading tournament...
        </main>
      }
    >
      <TournamentDetailsContent />
    </Suspense>
  );
}
