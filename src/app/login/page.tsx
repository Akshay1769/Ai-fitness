"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TopNavbar from "../plan/components/TopNavbar";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const email = `${username}@nofakemail.com`;

    // SIGN IN
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    const user = data.user;

    // ⭐ CHECK IF USER HAS OLD SAVED PLAN
    const { data: planRow } = await supabase
      .from("user_plans")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    if (planRow?.plan) {
      // 🔥 OLD USER → RESTORE PLAN + GO TO PLAN PAGE
      localStorage.setItem("ai-fitness-plan", JSON.stringify(planRow.plan));
      router.push("/plan");
      return;
    }

    // 🆕 NEW USER → GO TO SETUP
    router.push("/setup");
  }

  return (
    <>
      <TopNavbar />

      <main className="min-h-screen px-6 py-10 bg-gradient-to-b from-black via-zinc-900 to-zinc-950 text-white">

        {/* HERO AREA */}
        <section className="text-center space-y-4 max-w-2xl mx-auto mb-10">
          <h1 className="text-4xl font-extrabold text-yellow-400">
            Welcome Back 👋
          </h1>

          <p className="text-zinc-300">
            Log in to continue your personalized AI-powered fitness journey.
          </p>

          <p className="italic text-yellow-300">
            “Discipline is choosing what you want most over what you want now.”
          </p>
        </section>

        {/* LOGIN FORM */}
        <section className="max-w-md mx-auto bg-zinc-900/60 p-6 rounded-2xl border border-zinc-700 shadow-lg">
          <form className="space-y-4" onSubmit={handleLogin}>
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
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-sm text-center text-zinc-400 mt-3">
            Don't have an account?{" "}
            <a href="/signup" className="text-yellow-400 underline">
              Sign up
            </a>
          </p>
        </section>
      </main>
    </>
  );
}
