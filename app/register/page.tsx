
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (username.length < 3 || username.length > 16) {
      setMessage("Username must be between 3 and 16 characters.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setMessage("Use only letters, numbers and underscores.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Registration successful! Check your email to confirm your account.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090711] px-6 py-12 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="text-lg font-black tracking-wider">
          EXODUS <span className="text-purple-400">RANKED</span>
        </Link>

        <div className="mt-10 rounded-2xl border border-white/10 bg-[#110e1c] p-8">
          <div className="text-xs font-bold tracking-[0.3em] text-purple-400">
            JOIN THE COMPETITION
          </div>

          <h1 className="mt-3 text-3xl font-black">CREATE ACCOUNT</h1>
          <p className="mt-2 text-sm text-gray-500">
            Create your EXODUS RANKED player account.
          </p>

          <form onSubmit={handleRegister} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Minecraft Username
              </label>
              <input
                required
                maxLength={16}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="YourMinecraftName"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-purple-500"
              />
            </div>

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
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-purple-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Password
              </label>
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-purple-500"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 py-3 font-bold transition hover:bg-purple-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "CREATE ACCOUNT"}
            </button>
          </form>

          {message && (
            <p className="mt-5 rounded-lg border border-purple-500/20 bg-purple-500/10 p-3 text-sm text-purple-200">
              {message}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            Already registered?{" "}
            <Link href="/login" className="font-bold text-purple-400 hover:text-purple-300">
              Login
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          EXODUS RANKED · COMPETITIVE MINECRAFT
        </p>
      </div>
    </main>
  );
}
