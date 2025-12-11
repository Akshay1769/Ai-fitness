// app/setup/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import TopNavbar from "./plan/components/TopNavbar";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupPage() {
  const router = useRouter();
  const formSectionRef = useRef<HTMLDivElement | null>(null);

  // -------------------------------
  // ✅ SESSION CHECK (NO REDIRECT)
  // -------------------------------
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    }
    checkAuth();
  }, []);

  // -------------------------------
  // ORIGINAL FORM STATE (UNCHANGED)
  // -------------------------------
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    fitnessGoal: "",
    fitnessLevel: "",
    workoutLocation: "",
    dietPreference: "",
    medicalHistory: "",
    stressLevel: ""
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleScrollToForm() {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // -------------------------------
  // ⭐ SAVE PROFILE TO SUPABASE
  // -------------------------------
  async function saveProfile() {
    setSaving(true);
    setError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) throw new Error("Not logged in");

      const { error } = await supabase
        .from("user_fitness_profiles")
        .upsert(
          {
            user_id: user.id,
            name: form.name,
            age: form.age,
            gender: form.gender,
            height_cm: form.heightCm,
            weight_kg: form.weightKg,
            fitness_goal: form.fitnessGoal,
            fitness_level: form.fitnessLevel,
            workout_location: form.workoutLocation,
            diet_preference: form.dietPreference,
            medical_history: form.medicalHistory,
            stress_level: form.stressLevel,
            updated_at: new Date(),
          },
          { onConflict: "user_id" }  // important
        );

      if (error) throw error;

      setSaving(false);
      return true;
    } catch (err: any) {
      setSaving(false);
      setError(err.message);
      return false;
    }
  }

  // -------------------------------
  // ⭐ GENERATE PLAN (SAVES FIRST)
  // -------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const saved = await saveProfile();
    if (!saved) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Failed to generate plan");

      const data = await res.json();
      localStorage.setItem("ai-fitness-plan", JSON.stringify(data));

      router.push("/plan");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------
  // UI STARTS HERE (UNCHANGED)
  // -------------------------------
  return (
    <>
      <TopNavbar />

      <main
        className="
          min-h-screen px-4 py-10
          bg-white text-black
          dark:bg-[radial-gradient(circle_at_top,_#2b0000,_#050505)]
          dark:text-zinc-100
          transition-colors duration-300
        "
      >
        <div className="max-w-5xl mx-auto space-y-10">
          {/* HERO */}
          <section className="text-center space-y-5">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-yellow-600 dark:text-yellow-400">
              Start Your Fitness Journey
            </h1>

            <p className="text-zinc-700 dark:text-zinc-300 text-lg max-w-2xl mx-auto">
              Your personal{" "}
              <span className="text-yellow-600 dark:text-yellow-300 font-semibold">
                AI Fitness Coach
              </span>{" "}
              generates a custom 7-day workout and diet plan based on your
              lifestyle.
            </p>

            <div className="space-y-1 text-yellow-600 dark:text-yellow-300 italic">
              <p>“The body achieves what the mind believes.”</p>
              <p>“Small daily wins create massive transformations.”</p>
            </div>

            <Button
              onClick={() => {
                if (!session) router.push("/login");
                else handleScrollToForm();
              }}
              className="
                px-8 py-3 text-lg font-bold rounded-full
                bg-gradient-to-r from-yellow-400 to-yellow-600 text-black
                hover:scale-[1.04] active:scale-[0.97] transition
              "
            >
              🚀 Start Your Journey
            </Button>
          </section>

          {/* ABOUT SECTION */}
          <section
            className="
              bg-white dark:bg-black/40 
              border border-zinc-300 dark:border-yellow-500/20
              backdrop-blur-lg rounded-2xl p-6 space-y-4
              shadow-lg shadow-black/30
            "
          >
            <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
              What this app does
            </h2>

            <ul className="text-zinc-700 dark:text-zinc-300 space-y-2 text-sm">
              <li>• Creates a full 7-day personalized workout plan</li>
              <li>• Generates a custom diet with calories & macros</li>
              <li>• Lets you listen to plans with read-aloud mode</li>
              <li>• Gives you a downloadable PDF version</li>
              <li>• Saves your plan so you never lose it</li>
            </ul>

            <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-400 mt-4">
              Why use AI Fitness Coach?
            </h3>

            <ul className="text-zinc-700 dark:text-zinc-300 space-y-2 text-sm">
              <li>✔ Fully personalized for YOUR body</li>
              <li>✔ Select your goal & workout style</li>
              <li>✔ Works for home, gym, or outdoor exercise</li>
              <li>✔ Clear day-by-day structure</li>
            </ul>

            <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-400 mt-4">
              Milestones you can unlock
            </h3>

            <ul className="text-zinc-700 dark:text-zinc-300 space-y-2 text-sm">
              <li>🏆 Week 1 – Build consistency</li>
              <li>🔥 Week 2 – More energy & stamina</li>
              <li>💪 Week 4 – Strength increases</li>
              <li>⚡ Week 8 – Visible progress</li>
              <li>🚀 Week 12 – A lifestyle transformation</li>
            </ul>
          </section>

          {/* FORM — shown only when logged-in */}
          {session && (
            <section ref={formSectionRef}>
              <Card
                className="
                  bg-white dark:bg-black/60
                  border border-zinc-300 dark:border-yellow-500/30
                  shadow-xl shadow-black/40
                "
              >
                <CardHeader>
                  <CardTitle className="text-yellow-700 dark:text-yellow-300 text-2xl">
                    Tell us about you 💪
                  </CardTitle>
                  <p className="text-sm text-zinc-700 dark:text-zinc-400">
                    Fill this once to generate your complete 7-day plan.
                  </p>
                </CardHeader>

                <CardContent>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* BASIC INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label>Age</Label>
                        <Input
                          name="age"
                          type="number"
                          value={form.age}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* GENDER HEIGHT WEIGHT */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Gender</Label>
                        <Select
                          value={form.gender}
                          onValueChange={(value) =>
                            setForm((p) => ({ ...p, gender: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Height (cm)</Label>
                        <Input
                          name="heightCm"
                          type="number"
                          value={form.heightCm}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <Label>Weight (kg)</Label>
                        <Input
                          name="weightKg"
                          type="number"
                          value={form.weightKg}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* GOALS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Fitness Goal</Label>
                        <Select
                          value={form.fitnessGoal}
                          onValueChange={(value) =>
                            setForm((p) => ({ ...p, fitnessGoal: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weight_loss">
                              Weight Loss
                            </SelectItem>
                            <SelectItem value="muscle_gain">
                              Muscle Gain
                            </SelectItem>
                            <SelectItem value="general_fitness">
                              General Fitness
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Fitness Level</Label>
                        <Select
                          value={form.fitnessLevel}
                          onValueChange={(value) =>
                            setForm((p) => ({ ...p, fitnessLevel: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Workout Location</Label>
                        <Select
                          value={form.workoutLocation}
                          onValueChange={(value) =>
                            setForm((p) => ({ ...p, workoutLocation: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="gym">Gym</SelectItem>
                            <SelectItem value="outdoor">Outdoor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* DIET + STRESS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Diet Preference</Label>
                        <Select
                          value={form.dietPreference}
                          onValueChange={(value) =>
                            setForm((p) => ({ ...p, dietPreference: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="veg">Vegetarian</SelectItem>
                            <SelectItem value="non_veg">
                              Non-Vegetarian
                            </SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                            <SelectItem value="keto">Keto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Stress Level</Label>
                        <Input
                          name="stressLevel"
                          placeholder="Low / Medium / High"
                          value={form.stressLevel}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* MEDICAL HISTORY */}
                    <div>
                      <Label>Medical History</Label>
                      <Textarea
                        name="medicalHistory"
                        placeholder="Injuries, conditions, limitations, etc."
                        value={form.medicalHistory}
                        onChange={handleChange}
                      />
                    </div>

                    {error && <p className="text-red-500">{error}</p>}

                    {/* BUTTONS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <Button
                        type="button"
                        disabled={saving}
                        onClick={saveProfile}
                        className="
                          w-full bg-gradient-to-r from-zinc-300 to-zinc-500
                          dark:from-zinc-700 dark:to-zinc-900
                          text-black dark:text-white font-bold
                        "
                      >
                        {saving ? "Saving Profile..." : "Save Profile"}
                      </Button>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="
                          w-full bg-gradient-to-r from-yellow-400 to-yellow-600
                          text-black font-bold
                        "
                      >
                        {loading
                          ? "Generating your AI plan..."
                          : "Generate My 7-Day Plan"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
