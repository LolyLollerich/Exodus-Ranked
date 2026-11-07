
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Kit = {
  id: number;
  name: string;
};

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
  tournament_id: string;
  player_id: string;
  username: string;
  attended: boolean;
  id: string;
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

export default function TournamentManager() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedWinners, setSelectedWinners] = useState<Record<string, string>>({});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kitId, setKitId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [profiles, setProfiles] = useState<
  { id: string; username: string }[]
>([]);

async function toggleAttendance(participant: Participant) {
  const newAttendance = !participant.attended;

  const { error } = await supabase
    .from("tournament_participants")
    .update({ attended: newAttendance })
    .eq("id", participant.id);

  if (error) {
    console.error(error);
    setMessage("Could not update attendance: " + error.message);
    return;
  }

  setParticipants((current) =>
    current.map((item) =>
      item.id === participant.id
        ? { ...item, attended: newAttendance }
        : item
    )
  );

  setMessage(
    newAttendance
      ? `${participant.username} marked as attended.`
      : `${participant.username} attendance removed.`
  );
}
async function generateBracket(tournamentId: string) {
  const { error } = await supabase.rpc(
    "generate_tournament_bracket",
    { p_tournament_id: tournamentId }
  );

  if (error) {
    setMessage("Could not generate bracket: " + error.message);
    return;
  }

  setMessage("Tournament bracket generated!");
  await loadData();
}

async function submitMatchResult(matchId: string) {
  const winnerId = selectedWinners[matchId];

  if (!winnerId) {
    setMessage("Please select a winner.");
    return;
  }

  const { error } = await supabase.rpc(
    "submit_tournament_match_result",
    {
      p_match_id: matchId,
      p_winner_id: winnerId,
    }
  );

  if (error) {
    setMessage("Could not submit result: " + error.message);
    return;
  }

  setMessage("Match result saved!");
  setSelectedWinners((current) => ({
    ...current,
    [matchId]: "",
  }));

  await loadData();
}
function getUsername(playerId: string | null) {
  if (!playerId) return "Waiting...";

  const player = profiles.find(
    (profile) => profile.id === playerId
  );

  return player?.username ?? "Unknown Player";
}

function getRoundName(roundNumber: number, totalRounds: number) {
  const roundsFromEnd = totalRounds - roundNumber;

  if (roundsFromEnd === 0) return "FINAL";
  if (roundsFromEnd === 1) return "SEMIFINAL";
  if (roundsFromEnd === 2) return "QUARTERFINAL";

  return `ROUND ${roundNumber}`;
}

async function loadData() {
  setLoading(true);

  try {
    const [
      kitResult,
      tournamentResult,
      participantResult,
      matchResult,
    ] = await Promise.all([
      supabase
        .from("kits")
        .select("id, name")
        .order("name"),

      supabase
        .from("tournaments")
        .select("*")
        .order("starts_at", { ascending: true }),

      supabase
        .from("tournament_participants")
        .select("id, tournament_id, player_id, attended"),

      supabase
        .from("tournament_matches")
        .select("*")
        .order("round_number")
        .order("match_number"),
    ]);

    // KITS
    if (kitResult.error) {
      console.error(kitResult.error);
      setMessage("Could not load kits.");
    } else {
      setKits(kitResult.data ?? []);
    }

    // TOURNAMENTS
    if (tournamentResult.error) {
      console.error(tournamentResult.error);
      setMessage("Could not load tournaments.");
    } else {
      setTournaments(tournamentResult.data ?? []);
    }

    // MATCHES
    if (matchResult.error) {
      console.error(matchResult.error);
      setMessage("Could not load tournament matches.");
    } else {
      setMatches(matchResult.data ?? []);
    }

    // PARTICIPANTS
    if (participantResult.error) {
      console.error(participantResult.error);
      setMessage("Could not load participants.");
      setParticipants([]);
      setProfiles([]);
    } else {
      const rawParticipants = participantResult.data ?? [];

      const playerIds = [
        ...new Set(
          rawParticipants.map((participant) => participant.player_id)
        ),
      ];

      // LOAD PLAYER PROFILES
      const {
        data: profileData,
        error: profileError,
      } = playerIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, username")
            .in("id", playerIds)
        : { data: [], error: null };

      if (profileError) {
        console.error(profileError);
        setMessage("Could not load participant usernames.");
      }

      const loadedProfiles = profileData ?? [];

      setProfiles(loadedProfiles);

      const profileMap = new Map(
        loadedProfiles.map((profile) => [
          profile.id,
          profile.username,
        ])
      );

      const mappedParticipants = rawParticipants.map(
        (participant) => ({
          ...participant,
          username:
            profileMap.get(participant.player_id) ??
            "Unknown Player",
        })
      );

      setParticipants(mappedParticipants);
    }
  } catch (error) {
    console.error(error);
    setMessage("An unexpected error occurred while loading data.");
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    loadData();
  }, []);

  async function createTournament(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You must be logged in.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("tournaments").insert({
      title: title.trim(),
      description: description.trim(),
      kit_id: Number(kitId),
      starts_at: new Date(startsAt).toISOString(),
      max_participants: maxParticipants
        ? Number(maxParticipants)
        : null,
      created_by: user.id,
    });

    if (error) {
      console.error(error);
      setMessage("Error creating tournament: " + error.message);
    } else {
      setMessage("Tournament created successfully!");
      setTitle("");
      setDescription("");
      setKitId("");
      setStartsAt("");
      setMaxParticipants("");
      await loadData();
    }

    setSaving(false);
  }

  async function updateStatus(
    tournamentId: string,
    status: Tournament["status"]
  ) {
    const { error } = await supabase
      .from("tournaments")
      .update({ status })
      .eq("id", tournamentId);

    if (error) {
      setMessage("Error updating status: " + error.message);
      return;
    }

    setMessage("Tournament status updated.");
    await loadData();
  }

  async function saveWinner(tournamentId: string) {
    const winnerId = selectedWinners[tournamentId];

    if (!winnerId) {
      setMessage("Please select a winner first.");
      return;
    }

    const confirmed = window.confirm(
      "Confirm this winner? The selected player will receive HT1 in this kit. Any previous HT1 in this kit will be replaced."
    );

    if (!confirmed) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.rpc("set_tournament_winner", {
      p_tournament_id: tournamentId,
      p_winner_id: winnerId,
    });

    if (error) {
      console.error(error);
      setMessage("Error assigning winner: " + error.message);
    } else {
      setMessage("Official winner saved. HT1 has been assigned!");
      await loadData();
    }

    setSaving(false);
  }

  async function deleteTournament(tournamentId: string) {
    if (!window.confirm("Do you really want to delete this tournament?")) {
      return;
    }

    const { error } = await supabase
      .from("tournaments")
      .delete()
      .eq("id", tournamentId);

    if (error) {
      setMessage("Error deleting tournament: " + error.message);
      return;
    }

    setMessage("Tournament deleted.");
    await loadData();
  }

  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-[#110e1c] p-8">
      <div className="text-xs font-bold tracking-[0.3em] text-purple-400">
        COMPETITIVE MANAGEMENT
      </div>
      <h2 className="mt-3 text-2xl font-black">TOURNAMENT MANAGER</h2>
      <p className="mt-2 text-sm text-gray-400">
        Create and manage official EXODUS RANKED tournaments.
      </p>

      <form onSubmit={createTournament} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Tournament name
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Season 1 – Official Tournament"
            className="w-full rounded-lg border border-white/10 bg-[#090711] px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the tournament..."
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-[#090711] px-4 py-3 text-white"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-gray-400">Kit</label>
            <select
              required
              value={kitId}
              onChange={(e) => setKitId(e.target.value)}
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
              Start date and time
            </label>
            <input
              required
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#090711] px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Max participants
            </label>
            <input
              type="number"
              min="2"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder="Unlimited"
              className="w-full rounded-lg border border-white/10 bg-[#090711] px-4 py-3 text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-purple-600 px-7 py-3 font-bold transition hover:bg-purple-500 disabled:opacity-50"
        >
          {saving ? "CREATING..." : "CREATE TOURNAMENT"}
        </button>
      </form>

      {message && (
        <p className="mt-5 rounded-lg border border-purple-500/20 bg-purple-500/10 p-4 text-sm text-purple-200">
          {message}
        </p>
      )}

      <div className="mt-12 border-t border-white/10 pt-8">
        <h3 className="text-xl font-black">EXISTING TOURNAMENTS</h3>

        {loading ? (
          <p className="mt-5 text-sm text-gray-400">Loading...</p>
        ) : tournaments.length === 0 ? (
          <p className="mt-5 text-sm text-gray-500">
            No tournaments created yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {tournaments.map((tournament) => {
              const tournamentParticipants = participants.filter(
                (participant) =>
                  participant.tournament_id === tournament.id
              );

              return (
                <div
                  key={tournament.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h4 className="font-bold">{tournament.title}</h4>
                      <p className="mt-1 text-xs text-gray-500">
                        {kits.find((k) => k.id === tournament.kit_id)?.name ??
                          "Unknown kit"}
                        {" · "}
                        {new Date(tournament.starts_at).toLocaleString("de-AT")}
                        {" · "}
                        {tournamentParticipants.length} participants
                      </p>
                    {tournament.status === "FINISHED" && tournament.winner_id && (
  <div className="my-6 overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/60 to-[#15151f] p-6">
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="text-5xl">🏆</div>

      <p className="text-xs font-bold tracking-[0.3em] text-purple-400">
        TOURNAMENT CHAMPION
      </p>

      <h3 className="text-2xl font-black text-white">
        {tournamentParticipants.find(
          (p) => p.player_id === tournament.winner_id
        )?.username ?? "Unknown Player"}
      </h3>

      <p className="text-sm text-purple-300">
        {kits.find((kit) => kit.id === tournament.kit_id)?.name} Champion
      </p>

      <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-sm font-bold text-yellow-400">
        HT1 UNLOCKED
      </span>
    </div>
  </div>
)}
)
<div className="mt-5 border-t border-white/10 pt-4">
  <h5 className="mb-3 text-sm font-bold text-gray-300">
    Tournament Attendance
  </h5>

  {tournamentParticipants.length === 0 ? (
    <p className="text-xs text-gray-500">
      No participants yet.
    </p>
  ) : (
    <div className="space-y-2">
      {tournamentParticipants.map((participant) => (
        <div
          key={participant.id}
          className="flex flex-col justify-between gap-2 rounded-lg bg-white/[0.03] p-3 sm:flex-row sm:items-center"
        >
          <span className="text-sm text-white">
            {participant.username}
          </span>

          <button
            onClick={() => toggleAttendance(participant)}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
              participant.attended
                ? "bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400"
                : "bg-white/10 text-gray-300 hover:bg-green-500/20 hover:text-green-400"
            }`}
          >
            {participant.attended
              ? "ATTENDED ✓"
              : "MARK AS ATTENDED"}
          </button>
        </div>
      ))}
    </div>
  )}
  {/* TOURNAMENT BRACKET */}
<div className="mt-8 border-t border-white/10 pt-6">
  <div className="mb-5 flex items-center justify-between">
    <div>
      <h4 className="text-xl font-bold text-white">
        Tournament Bracket
      </h4>
      <p className="text-sm text-gray-400">
        Automatic knockout tournament
      </p>
    </div>

    {matches.filter(
      (match) => match.tournament_id === tournament.id
    ).length === 0 && (
      <button
        onClick={() => generateBracket(tournament.id)}
        disabled={tournament.status !== "UPCOMING"}
        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-500 disabled:opacity-40"
      >
        GENERATE BRACKET
      </button>
    )}
  </div>

  {(() => {
    const tournamentMatches = matches.filter(
      (match) => match.tournament_id === tournament.id
    );

    if (tournamentMatches.length === 0) {
      return (
        <p className="text-sm text-gray-500">
          No bracket generated yet.
        </p>
      );
    }

    const totalRounds = Math.max(
      ...tournamentMatches.map((match) => match.round_number)
    );
    
const completedMatches = tournamentMatches.filter(
  (match) => match.status === "COMPLETED"
).length;

const totalPlayableMatches = tournamentMatches.filter(
  (match) => match.status !== "BYE"
).length;

const progressPercentage =
  totalPlayableMatches > 0
    ? Math.round(
        (completedMatches / totalPlayableMatches) * 100
      )
    : 0;


    
return (
  <>
    <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-300">
          TOURNAMENT PROGRESS
        </span>

        <span className="text-sm font-bold text-purple-400">
          {progressPercentage}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-purple-500 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-gray-500">
        {completedMatches} / {totalPlayableMatches} matches completed
      </p>
    </div>

    <div className="overflow-x-auto">

        <div className="flex min-w-max items-start gap-8">
          {Array.from(
            { length: totalRounds },
            (_, index) => index + 1
          ).map((roundNumber) => {
            const roundMatches = tournamentMatches
              .filter(
                (match) => match.round_number === roundNumber
              )
              .sort(
                (a, b) => a.match_number - b.match_number
              );

            return (
              <div
                key={roundNumber}
                className="w-64 shrink-0"
              >
                <h5 className="mb-4 text-sm font-bold tracking-widest text-purple-400">
                  {getRoundName(roundNumber, totalRounds)}
                </h5>

                <div className="space-y-6">
                  {roundMatches.map((match) => {
                    const player1 = getUsername(match.player1_id);
                    const player2 = getUsername(match.player2_id);
                    const winner = match.winner_id;

                    return (
                      <div
                        key={match.id}
                        className="overflow-hidden rounded-xl border border-white/10 bg-[#15151f]"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                          <span className="text-xs font-bold text-gray-400">
                            MATCH {match.match_number}
                          </span>

                          <span
                            className={`text-xs font-bold ${
                              match.status === "COMPLETED"
                                ? "text-green-400"
                                : match.status === "BYE"
                                ? "text-yellow-400"
                                : "text-gray-500"
                            }`}
                          >
                            {match.status}
                          </span>
                        </div>

                        <div className="space-y-1 p-2">
                          <div
                            className={`rounded-lg px-3 py-2 text-sm ${
                              winner === match.player1_id &&
                              winner !== null
                                ? "bg-purple-600/30 text-purple-300"
                                : "bg-white/5 text-gray-200"
                            }`}
                          >
                            {player1}
                            {winner === match.player1_id &&
                              winner !== null && (
                                <span className="float-right">✓</span>
                              )}
                          </div>

                          <div
                            className={`rounded-lg px-3 py-2 text-sm ${
                              winner === match.player2_id &&
                              winner !== null
                                ? "bg-purple-600/30 text-purple-300"
                                : "bg-white/5 text-gray-200"
                            }`}
                          >
                            {player2}
                            {winner === match.player2_id &&
                              winner !== null && (
                                <span className="float-right">✓</span>
                              )}
                          </div>
                        </div>

                        {match.status === "PENDING" &&
                          match.player1_id &&
                          match.player2_id && (
                            <div className="border-t border-white/5 p-3">
                              <select
                                value={
                                  selectedWinners[match.id] ?? ""
                                }
                                onChange={(event) =>
                                  setSelectedWinners((current) => ({
                                    ...current,
                                    [match.id]: event.target.value,
                                  }))
                                }
                                className="mb-2 w-full rounded-lg border border-white/10 bg-[#20202c] p-2 text-sm text-white"
                              >
                                <option value="">
                                  Select winner
                                </option>
                                <option value={match.player1_id}>
                                  {player1}
                                </option>
                                <option value={match.player2_id}>
                                  {player2}
                                </option>
                              </select>

                              <button
                                onClick={() =>
                                  submitMatchResult(match.id)
                                }
                                className="w-full rounded-lg bg-purple-600 py-2 text-xs font-bold text-white hover:bg-purple-500"
                              >
                                CONFIRM RESULT
                              </button>
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
    </>
    );
  })()}
</div>
</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={tournament.status}
                        onChange={(e) =>
                          updateStatus(
                            tournament.id,
                            e.target.value as Tournament["status"]
                          )
                        }
                        className="rounded-lg border border-white/10 bg-[#090711] px-3 py-2 text-sm text-white"
                      >
                        <option value="UPCOMING">Upcoming</option>
                        <option value="LIVE">Live</option>
                        <option value="FINISHED">Finished</option>
                      </select>

                      <button
                        onClick={() => deleteTournament(tournament.id)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>

                  
{tournament.status === "FINISHED" && tournament.winner_id && (
  <div className="my-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10 text-3xl">
        🏆
      </div>

      <div>
        <p className="text-xs font-bold tracking-widest text-yellow-400">
          TOURNAMENT CHAMPION
        </p>

        <h4 className="mt-1 text-xl font-bold text-white">
          {getUsername(tournament.winner_id)}
        </h4>

        <p className="mt-1 text-sm text-gray-400">
          Official winner · HT1 awarded automatically
        </p>
      </div>
    </div>
  </div>
)}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
