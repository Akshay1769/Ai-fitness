"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("user_fitness_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!profile)
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-yellow-500 mb-4">Your Profile</h2>
        <p>No profile data found. Please fill your setup form.</p>
      </div>
    );

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6">
        Your Profile
      </h2>

      <div className="space-y-3">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Age:</strong> {profile.age}</p>
        <p><strong>Gender:</strong> {profile.gender}</p>
        <p><strong>Height:</strong> {profile.height_cm} cm</p>
        <p><strong>Weight:</strong> {profile.weight_kg} kg</p>
        <p><strong>Goal:</strong> {profile.fitness_goal}</p>
        <p><strong>Level:</strong> {profile.fitness_level}</p>
        <p><strong>Workout Location:</strong> {profile.workout_location}</p>
        <p><strong>Diet Preference:</strong> {profile.diet_preference}</p>
        <p><strong>Medical History:</strong> {profile.medical_history}</p>
        <p><strong>Stress Level:</strong> {profile.stress_level}</p>
      </div>

      <Button
        onClick={() => supabase.auth.signOut()}
        className="mt-6 w-full bg-yellow-500 text-black"
      >
        Logout
      </Button>
    </div>
  );
}
