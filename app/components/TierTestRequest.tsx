
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Kit = {
  id: number;
  name: string;
};

export default function TierTestRequest({
  playerId,
}: {
  playerId: string;
}) {
  const [kits, setKits] = useState<Kit[]>([]);
  const [selectedKit, setSelectedKit] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setIsOwnProfile(data.user?.id === playerId);
      setCheckingProfile(false);
    }

    checkUser();
  }, [playerId]);

  useEffect(() => {
    async function loadKits() {
      const { data, error } = await supabase
        .from("kits")
        .select("id, name")
        .eq("active", true)
        .order("name");

      if (error) {
        setStatus("Could not load kits.");
        return;
      }

      setKits(data ?? []);
    }

    loadKits();
  }, []);

  async function submitRequest() {
    setStatus("");

    if (!selectedKit) {
      setStatus("Please select a kit.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || user.id !== playerId) {
      setStatus("You can only request a test for your own profile.");
      setLoading(false);
      return;
    }

    const { data: existing } = await supabase
      .from("tier_test_requests")
      .select("id")
      .eq("player_id", user.id)
      .eq("kit_id", Number(selectedKit))
      .eq("status", "PENDING")
      .limit(1);

    if (existing && existing.length > 0) {
      setStatus("You already have a pending request for this kit.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("tier_test_requests")
      .insert({
        player_id: user.id,
        kit_id: Number(selectedKit),
        message: message.trim(),
      });

    if (error) {
      setStatus("Error: " + error.message);
    } else {
      setStatus("Your tier test request was submitted!");
      setMessage("");
      setSelectedKit("");
    }

    setLoading(false);
  }

  if (checkingProfile || !isOwnProfile) return null;

  return (
    <section className="rounded-2xl border border-purple-500/20 bg-[#11111c] p-6">
      <div className="mb-5">
        <p className="text-sm font-bold tracking-widest text-purple-400">
          EXODUS RANKED
        </p>
        <h2 className="mt-2 text-2xl font-black">
          REQUEST A TIER TEST
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Request an official test to prove your skill and earn a new rank.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-300">
            KIT
          </label>
          <select
            value={selectedKit}
            onChange={(e) => setSelectedKit(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#1b1b2a] p-3 text-white"
          >
            <option value="">Select a kit</option>
            {kits.map((kit) => (
              <option key={kit.id} value={kit.id}>
                {kit.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-300">
            MESSAGE (OPTIONAL)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            placeholder="Anything the operators should know?"
            className="min-h-24 w-full rounded-lg border border-white/10 bg-[#1b1b2a] p-3 text-white"
          />
        </div>

        <button
          onClick={submitRequest}
          disabled={loading}
          className="w-full rounded-lg bg-purple-600 px-5 py-3 font-bold transition hover:bg-purple-500 disabled:opacity-50"
        >
          {loading ? "SUBMITTING..." : "SUBMIT TEST REQUEST"}
        </button>

        {status && (
          <p className="text-sm text-purple-300">{status}</p>
        )}
      </div>
    </section>
  );
}
