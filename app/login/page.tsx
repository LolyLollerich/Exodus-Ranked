"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090711] px-6 py-12 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="text-lg font-black tracking-wider">
          EXODUS <span className="text-purple-400">RANKED</span>
        </Link>

        <div className="mt-10 rounded-2xl border border-white/10 bg-[#110e1c] p-8">
          <div className="text-xs font-bold tracking-[0.3em] text-purple-400">
            WELCOME BACK
          </div>

          <h1 className="mt-3 text-3xl font-black">LOGIN</h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to your EXODUS RANKED account.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 py-3 font-bold transition hover:bg-purple-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "LOGIN"}
            </button>
          </form>

          {message && (
            <p className="mt-5 rounded-lg border border-purple-500/20 bg-purple-500/10 p-3 text-sm text-purple-200">
              {message}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            No account yet?{" "}
            <Link href="/register" className="font-bold text-purple-400 hover:text-purple-300">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}