"use client";

import { useState } from "react";

interface DietSectionProps {
  diet: any;
}

// ⭐ HuggingFace FLUX API URL
const HF_API_URL =
  "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev";

// ⭐ Generate an image using HuggingFace
async function generateImage(prompt: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.huggingface.co/v1-alpha/generate/image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-dev",
        prompt,
        num_inference_steps: 28,
        guidance_scale: 3.5,
      }),
    });

    if (!res.ok) {
      console.error("HF Error:", await res.text());
      return null;
    }

    const json = await res.json();

    if (!json.images || !json.images[0]) return null;

    return `data:image/png;base64,${json.images[0]}`;
  } catch (err) {
    console.error("Image generation failed:", err);
    return null;
  }
}


export default function DietSection({ diet }: DietSectionProps) {
  if (!diet || !diet.days) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        No diet data available.
      </p>
    );
  }

  return (
    <section className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] mt-2">
      {/* LEFT SIDE — Days & Meals */}
      <div className="space-y-4">
        {diet.days.map((day: any, index: number) => (
          <DietDayCard key={index} day={day} />
        ))}
      </div>

      {/* RIGHT SIDE */}
      <aside className="space-y-4">
        {/* Daily Motivation */}
        <div
          className="
          rounded-2xl 
          bg-gradient-to-r from-yellow-400 to-amber-600 
          text-black 
          p-5 shadow-xl shadow-yellow-500/40
          dark:shadow-yellow-400/20
        "
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            🍽️ Your Daily Motivation
          </h2>
          <p className="mt-2 text-sm lg:text-base italic">“{diet.motivation}”</p>
        </div>

        {/* Diet Tips */}
        <div
          className="
            rounded-2xl p-5 
            bg-white/70 dark:bg-zinc-950/90 
            border border-zinc-300 dark:border-zinc-800
            shadow-lg shadow-black/10 dark:shadow-black/40
            transition-all
          "
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 text-sm">
              🧠
            </span>
            <h3 className="text-base lg:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Diet Tips
            </h3>
          </div>

          <ul className="space-y-2 text-xs lg:text-sm text-zinc-700 dark:text-zinc-300 list-disc pl-5">
            {diet.tips.map((t: string, i: number) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>

        {/* Hydration + Supplements */}
        <div
          className="
          rounded-2xl p-5 space-y-3
          bg-white/70 dark:bg-zinc-950/90
          border border-zinc-300 dark:border-zinc-800
          shadow-lg shadow-black/10 dark:shadow-black/40
        "
        >
          <div>
            <h3 className="text-base lg:text-lg font-semibold text-blue-700 dark:text-blue-200 flex items-center gap-2">
              💧 Hydration
            </h3>
            <p className="text-xs lg:text-sm text-zinc-700 dark:text-zinc-300 mt-1">
              {diet.hydration}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mt-2 mb-1">
              Recommended Supplements
            </h4>
            <ul className="list-disc pl-5 text-xs lg:text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
              {diet.supplements.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </section>
  );
}

function DietDayCard({ day }: { day: any }) {
  const [open, setOpen] = useState(day.day === 1);
  const [images, setImages] = useState<Record<number, string | null>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [preview, setPreview] = useState<string | null>(null);

  async function handleMealImage(i: number, title: string) {
    setLoading((prev) => ({ ...prev, [i]: true }));

    const url = await generateImage(
      `Cinematic food photography of ${title}, 4K, bright natural lighting, professional plating, ultra detailed`
    );

    setImages((prev) => ({ ...prev, [i]: url }));
    setLoading((prev) => ({ ...prev, [i]: false }));
  }

  return (
    <>
      <div
        className="
        rounded-2xl overflow-hidden
        bg-white/70 dark:bg-zinc-950/80
        border border-zinc-300 dark:border-zinc-800
        shadow-lg shadow-black/10 dark:shadow-black/40
        transition-all
      "
      >
        {/* HEADER */}
        <button
          className="w-full flex justify-between items-center px-5 py-4 text-left 
          hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition"
          onClick={() => setOpen((v) => !v)}
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-yellow-600 dark:text-yellow-400">
              Day {day.day}
            </p>
            <h3 className="text-lg lg:text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Meal Plan
            </h3>
          </div>
          <span className="text-yellow-600 dark:text-yellow-300 text-sm">
            {open ? "▲" : "▼"}
          </span>
        </button>

        {/* MEALS */}
        {open && (
          <div className="px-5 pb-4 pt-1 space-y-3 bg-white/60 dark:bg-gradient-to-b dark:from-zinc-950 dark:to-black">
            {day.meals.map((meal: any, i: number) => (
              <div
                key={i}
                className="
                rounded-xl px-4 py-3 flex flex-col gap-1
                bg-zinc-200/60 dark:bg-zinc-900/80
                border border-zinc-300 dark:border-zinc-800
              "
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-yellow-700 dark:text-yellow-400">
                      {meal.type}
                    </p>
                    <h4 className="font-semibold text-sm lg:text-base text-zinc-900 dark:text-zinc-50">
                      {meal.title}
                    </h4>
                  </div>

                  {/* CAMERA BUTTON */}
                  <button
                    onClick={() => handleMealImage(i, meal.title)}
                    className="
                      w-8 h-8 rounded-xl 
                      bg-gradient-to-br from-yellow-400 to-amber-600 
                      flex items-center justify-center text-black text-xs
                      shadow-md shadow-yellow-500/50
                      hover:scale-110 active:scale-95 transition
                    "
                  >
                    {loading[i] ? "⏳" : "📷"}
                  </button>
                </div>

                {/* DESCRIPTION */}
                {meal.description && (
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
                    {meal.description}
                  </p>
                )}

                {/* MACROS */}
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                  🔥 {meal.calories} · 💪 {meal.protein} · 🍞 {meal.carbs} · 🥑{" "}
                  {meal.fats}
                </p>

                {/* IMAGE DISPLAY */}
                {images[i] && (
                  <div className="mt-3">
                    <img
                      src={images[i] as string}
                      alt={meal.title}
                      className="rounded-lg border border-zinc-300 dark:border-zinc-700 shadow cursor-pointer"
                      onClick={() => setPreview(images[i] as string)}
                    />

                    {/* DOWNLOAD BUTTON */}
                    <a
                      href={images[i] as string}
                      download={`${meal.title}.png`}
                      className="text-xs text-blue-500 underline mt-1 inline-block"
                    >
                      ⬇ Download Image
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULL-SCREEN POPUP PREVIEW */}
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
