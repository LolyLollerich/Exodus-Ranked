"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Request = {
  id: string;
  player_id: string;
  kit_id: number;
  requested_rank: string | null;
  message: string;
  status: string;
  requested_at: string;
  username: string;
  kit_name: string;
};

const ranks = [
  "HT1", "LT1", "HT2", "LT2", "HT3",
  "LT3", "HT4", "LT4", "HT5", "LT5",
];

export default function TierTestManager() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRanks, setSelectedRanks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadRequests() {
    setLoading(true);

    const { data: requestData, error } = await supabase
      .from("tier_test_requests")
      .select("*")
      .order("requested_at", { ascending: false });

    if (error) {
      setMessage("Error loading requests: " + error.message);
      setLoading(false);
      return;
    }

    const rows = requestData ?? [];

    const playerIds = [...new Set(rows.map((r) => r.player_id))];
    const kitIds = [...new Set(rows.map((r) => r.kit_id))];

    const [{ data: profiles }, { data: kits }] = await Promise.all([
      supabase.from("profiles").select("id, username").in("id", playerIds),
      supabase.from("kits").select("id, name").in("id", kitIds),
    ]);

    const formatted: Request[] = rows.map((r) => ({
      ...r,
      username:
        profiles?.find((p) => p.id === r.player_id)?.username ??
        "Unknown player",
      kit_name:
        kits?.find((k) => k.id === r.kit_id)?.name ?? "Unknown kit",
    }));

    setRequests(formatted);
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    setMessage("");

    const { error } = await supabase
      .from("tier_test_requests")
      .update({
        status,
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setMessage("Error: " + error.message);
      return;
    }

    setMessage(`Request ${status.toLowerCase()} successfully.`);
    await loadRequests();
  }

  async function completeTest(id: string) {
    const newRank = selectedRanks[id];

    if (!newRank) {
      setMessage("Please select the test result first.");
      return;
    }

    if (!window.confirm(`Save ${newRank} as the official new rank?`)) {
      return;
    }

    setMessage("");

    const { error } = await supabase.rpc("complete_tier_test", {
      p_request_id: id,
      p_new_rank: newRank,
    });

    if (error) {
      setMessage("Error completing test: " + error.message);
      return;
    }

    setMessage("Tier test completed and rank updated!");
    await loadRequests();
  }

  return (
    <section className="mt-10 rounded-2xl border border-purple-500/20 bg-[#11111c] p-6">
      <div className="mb-6">
        <p className="text-sm font-bold tracking-widest text-purple-400">
          EXODUS RANKED
        </p>
        <h2 className="mt-2 text-2xl font-black">
          TIER TEST MANAGEMENT
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Review requests and manage official tier tests.
        </p>
      </div>

      {message && (
        <p className="mb-5 rounded-lg bg-purple-500/10 p-3 text-sm text-purple-300">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-gray-400">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-400">No tier test requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-xl border border-white/10 bg-[#191927] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">
                    {request.username}
                  </h3>
                  <p className="text-sm text-purple-300">
                    {request.kit_name}
                  </p>
                </div>

                <span className="rounded-md bg-white/10 px-3 py-1 text-xs font-bold">
                  {request.status}
                </span>
              </div>

              {request.message && (
                <p className="mt-3 text-sm text-gray-400">
                  Message: {request.message}
                </p>
              )}

              <p className="mt-2 text-xs text-gray-500">
                Requested: {new Date(request.requested_at).toLocaleString()}
              </p>

              {request.status === "PENDING" && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => updateStatus(request.id, "APPROVED")}
                    className="rounded-lg bg-purple-600 px-5 py-2 font-bold hover:bg-purple-500"
                  >
                    APPROVE
                  </button>

                  <button
                    onClick={() => updateStatus(request.id, "REJECTED")}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-2 font-bold text-red-300 hover:bg-red-500/20"
                  >
                    REJECT
                  </button>
                </div>
              )}

              {request.status === "APPROVED" && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <select
                    value={selectedRanks[request.id] ?? ""}
                    onChange={(e) =>
                      setSelectedRanks((current) => ({
                        ...current,
                        [request.id]: e.target.value,
                      }))
                    }
                    className="rounded-lg border border-white/10 bg-[#242436] p-3 text-white"
                  >
                    <option value="">Select test result</option>
                    {ranks.map((rank) => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => completeTest(request.id)}
                    className="rounded-lg bg-green-600 px-5 py-2 font-bold hover:bg-green-500"
                  >
                    COMPLETE TEST
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}