// D:\ai-fitness-coach\ai-fitness-coach\src\app\plan\components\WorkoutSection.tsx
"use client";

import { useState } from "react";

interface WorkoutSectionProps {
  workout: any;
}

// ⭐ FRONTEND calls your backend route
async function generateImage(prompt: string): Promise<string | null> {
  try {
    console.log("Calling API with prompt:", prompt);
    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      console.error("API error:", await res.text());
      return null;
    }

    const data = await res.json();
    return data.image;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
}



export default function WorkoutSection({ workout }: WorkoutSectionProps) {
  if (!workout || !workout.days) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        No workout data available.
      </p>
    );
  }

  const mid = Math.ceil((workout.tips?.length || 0) / 2);
  const workoutTips = workout.tips?.slice(0, mid) ?? [];
  const lifestyleTips = workout.tips?.slice(mid) ?? [];

  return (
    <section className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] mt-2">
      <div className="space-y-4">
        {workout.days.map((day: any, index: number) => (
          <WorkoutDayCard key={index} day={day} />
        ))}
      </div>

      <aside className="space-y-4">
        <div
          className="
            rounded-xl p-5 backdrop-blur-lg
            border border-yellow-500/30 dark:border-yellow-500/20
            bg-white/70 dark:bg-black/40
            shadow-[0_0_20px_rgba(255,200,60,0.15)]
            hover:shadow-[0_0_25px_rgba(255,200,60,0.25)]
            transition
          "
        >
          <h2 className="text-lg font-semibold flex items-center gap-2 text-black dark:text-white">
            ✨ Your Daily Motivation
          </h2>
          <p className="mt-2 text-sm lg:text-base italic text-zinc-700 dark:text-zinc-300">
            “{workout.motivation}”
          </p>
        </div>

        <TipsCard title="Workout Tips" badge="🏋️" tips={workoutTips} />
        {lifestyleTips.length > 0 && (
          <TipsCard title="Lifestyle Tips" badge="💡" tips={lifestyleTips} />
        )}
      </aside>
    </section>
  );
}

function WorkoutDayCard({ day }: { day: any }) {
  const [open, setOpen] = useState(day.day === 1);

  return (
    <div
      className="
        rounded-2xl overflow-hidden 
        bg-white dark:bg-zinc-950/80
        border border-zinc-300 dark:border-zinc-800 
        shadow-lg shadow-black/20 dark:shadow-black/40
        transition
      "
    >
      <button
        className="
          w-full flex justify-between items-center px-5 py-4 text-left 
          hover:bg-zinc-100 dark:hover:bg-zinc-900/60 
          transition
        "
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <p className="text-xs uppercase tracking-wide text-yellow-600 dark:text-yellow-400">
            Day {day.day}
          </p>

          <h3 className="text-lg lg:text-xl font-semibold text-black dark:text-white">
            {day.title}
          </h3>

          <p className="text-xs lg:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {day.description}
          </p>
        </div>

        <span className="text-yellow-600 dark:text-yellow-300 text-sm">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && <WorkoutExerciseList exercises={day.exercises} />}
    </div>
  );
}

function WorkoutExerciseList({ exercises }: { exercises: any[] }) {
  const [images, setImages] = useState<Record<number, string | null>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [preview, setPreview] = useState<string | null>(null);

  async function handleImage(i: number, name: string) {
    setLoading((prev) => ({ ...prev, [i]: true }));

    const url = await generateImage(
      `Professional fitness photo of a person doing ${name}, gym lighting, detailed muscles, instructional style`
    );

    setImages((prev) => ({ ...prev, [i]: url }));
    setLoading((prev) => ({ ...prev, [i]: false }));
  }

  return (
    <>
      {/* EXERCISE LIST */}
      <div
        className="
          p-5 backdrop-blur-lg 
          bg-white/70 dark:bg-black/40
          border-t border-zinc-300 dark:border-yellow-500/20 
          transition
        "
      >
        {exercises.map((ex, i) => (
          <div
            key={i}
            className="
              rounded-xl px-4 py-3 mb-3
              bg-zinc-100 dark:bg-zinc-900/80 
              border border-zinc-300 dark:border-zinc-700 
              shadow-sm hover:shadow-md 
              transition
            "
          >
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm lg:text-base text-black dark:text-white">
                {ex.name}
              </h4>

              <button
                onClick={() => handleImage(i, ex.name)}
                className="
                  w-8 h-8 rounded-xl 
                  bg-gradient-to-br from-yellow-400 to-amber-600
                  flex items-center justify-center 
                  text-black text-xs 
                  shadow-md shadow-yellow-500/50
                  hover:scale-110 active:scale-95 transition
                "
              >
                {loading[i] ? "⏳" : "📷"}
              </button>
            </div>

            <p className="text-xs text-zinc-700 dark:text-zinc-300">
              {ex.sets} sets × {ex.reps} reps · Rest: {ex.rest}
            </p>

            {ex.notes && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {ex.notes}
              </p>
            )}

            {/* IMAGE DISPLAY */}
            {images[i] && (
              <div className="mt-3">
                <img
                  src={images[i] as string}
                  alt={ex.name}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 shadow cursor-pointer"
                  onClick={() => setPreview(images[i] as string)}
                />

                {/* DOWNLOAD BUTTON */}
                <a
                  href={images[i] as string}
                  download={`${ex.name}.png`}
                  className="text-xs text-blue-500 underline mt-1 inline-block"
                >
                  ⬇ Download Image
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* POPUP MODAL */}
      {preview && (
        <div
          className="
            fixed inset-0 bg-black/80 flex items-center justify-center z-50
          "
          onClick={() => setPreview(null)}
        >
          <img
            src={preview}
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-xl"
          />
        </div>
      )}
    </>
  );
}

function TipsCard({
  title,
  badge,
  tips,
}: {
  title: string;
  badge: string;
  tips: string[];
}) {
  if (!tips || tips.length === 0) return null;

  return (
    <div
      className="
        rounded-2xl p-5 
        bg-white/80 dark:bg-zinc-950/90 
        border border-zinc-300 dark:border-zinc-800 
        shadow-lg shadow-black/20 dark:shadow-black/40
      "
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="
            inline-flex h-7 w-7 items-center justify-center 
            rounded-full bg-yellow-400/30 dark:bg-yellow-500/20 
            text-yellow-600 dark:text-yellow-300 text-sm
          "
        >
          {badge}
        </span>

        <h3 className="text-base lg:text-lg font-semibold text-black dark:text-white">
          {title}
        </h3>
      </div>

      <ul className="space-y-2 text-xs lg:text-sm text-zinc-700 dark:text-zinc-300 list-disc pl-5">
        {tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
