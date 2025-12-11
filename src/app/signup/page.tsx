"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TopNavbar from "../plan/components/TopNavbar";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: any) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const email = `${username}@nofakemail.com`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/setup");
  }

  return (
    <>
      <TopNavbar />

      <main className="min-h-screen px-6 py-10 bg-gradient-to-b from-black via-zinc-900 to-zinc-950 text-white">

        {/* HERO AREA */}
        <section className="text-center space-y-4 max-w-2xl mx-auto mb-10">
          <h1 className="text-4xl font-extrabold text-yellow-400">
            Create Your Account 🔥
          </h1>

          <p className="text-zinc-300">
            Start your AI-generated fitness transformation.
          </p>

          <p className="italic text-yellow-300">
            “A journey of a thousand miles begins with a single step.”
          </p>
        </section>

        {/* SIGNUP FORM */}
        <section className="max-w-md mx-auto bg-zinc-900/60 p-6 rounded-2xl border border-zinc-700 shadow-lg">
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="text-sm text-zinc-300">Username</label>
              <input
                className="w-full mt-1 p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Password</label>
              <input
                type="password"
                className="w-full mt-1 p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              className="w-full bg-yellow-500 text-black py-2 rounded font-bold hover:bg-yellow-400 transition"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-center text-zinc-400 mt-3">
            Already have an account?{" "}
            <a href="/login" className="text-yellow-400 underline">
              Log in
            </a>
          </p>
        </section>
      </main>
    </>
  );
}

