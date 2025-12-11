"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Moon, Sun, User } from "lucide-react";

export default function TopNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    }
    loadSession();
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    setSession(null);
  }

  const authPages = ["/login", "/signup"];

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center bg-black text-white shadow-md">
      <h1
        className="text-2xl font-bold cursor-pointer"
        onClick={() => router.push("/setup")}
      >
        AI Fitness Coach
      </h1>

      <div className="flex items-center gap-4">

        {/* MODE SWITCH */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-zinc-800 border border-zinc-600"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* LOGIN + SIGNUP BUTTONS */}
        {!session && !authPages.includes(pathname) && (
          <>
            <Button
              onClick={() => router.push("/login")}
              className="bg-yellow-500 text-black"
            >
              Login
            </Button>

            <Button
              onClick={() => {
                console.log("Signup button clicked");
                router.push("/signup");
              }}
              className="bg-yellow-500 text-black"
            >
              Sign Up
            </Button>
          </>
        )}

        {/* PROFILE + LOGOUT */}
        {session && (
          <>
            <button
              onClick={() => router.push("/profile")}
              className="p-2 rounded-full border border-yellow-500"
            >
              <User size={20} className="text-yellow-500" />
            </button>

            <Button onClick={handleLogout} className="bg-red-600 text-white">
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
