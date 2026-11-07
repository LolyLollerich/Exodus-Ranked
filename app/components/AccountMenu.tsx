
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  username: string;
  role: string;
};

export default function AccountMenu() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("username, role")
          .eq("id", session.user.id)
          .single();

        setProfile(data);
      }

      setLoading(false);
    }

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null);
    window.location.href = "/";
  }

  if (loading) {
    return <div className="h-10 w-24 animate-pulse rounded-lg bg-white/5" />;
  }

  if (!profile) {
    return (
      <div className="flex gap-2">
        <Link
          href="/login"
          className="hidden rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5 sm:block"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold hover:bg-purple-500"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/players/${encodeURIComponent(profile.username)}`}
        className="text-sm font-bold text-white hover:text-purple-400"
      >
        {profile.username}
      </Link>
      {profile.role === "operator" || profile.role === "admin" ? (
  <Link
    href="/operator"
    className="rounded-lg border border-purple-500/30 bg-purple-600/15 px-4 py-2 text-sm font-bold text-purple-300 transition hover:bg-purple-600 hover:text-white"
  >
    Operator Dashboard
  </Link>
) : null}

      {profile.role === "operator" || profile.role === "admin" ? (
        <span className="rounded-md bg-purple-500/20 px-2 py-1 text-xs font-bold text-purple-300">
          {profile.role.toUpperCase()}
        </span>
      ) : null}

      <button
        onClick={logout}
        className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/5"
      >
        Logout
      </button>
    </div>
  );
}
