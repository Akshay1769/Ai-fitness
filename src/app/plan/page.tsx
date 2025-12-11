"use client";

import { useState, useEffect } from "react";
import WorkoutSection from "./components/WorkoutSection";
import DietSection from "./components/DietSection";
import TopNavbar from "./components/TopNavbar";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PdfDocument from "./components/PdfDocument";

// ----------------------------------------------------
// 🔊 Load Voices (Fix for Vercel, iOS, Chrome)
// ----------------------------------------------------
async function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

export default function PlanPage() {
  const [plan, setPlan] = useState<any>(null);
  const [tab, setTab] = useState<"workout" | "diet">("workout");
  const [speaking, setSpeaking] = useState(false);
  const [showPdfDom, setShowPdfDom] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ai-fitness-plan");
    if (saved) setPlan(JSON.parse(saved));

    // Trigger voice loading
    window.speechSynthesis.getVoices();
  }, []);

  // ----------------------------------------------------
  // 🔊 Speak (Workout only — single paragraph)
  // ----------------------------------------------------
  async function speakText(text: string) {
    window.speechSynthesis.cancel();

    const voices = await loadVoices();
    const u = new SpeechSynthesisUtterance(text);

    const best =
      voices.find((v) => v.name.includes("Male")) ||
      voices.find((v) => v.name.includes("Female")) ||
      voices[0];

    if (best) u.voice = best;

    u.rate = 1.02;
    u.pitch = 1.01;
    u.onend = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  // ----------------------------------------------------
  // 🔊 FIXED Diet Speech — Break into chunks
  // ----------------------------------------------------
  async function speakDiet(diet: any) {
    window.speechSynthesis.cancel();
    setSpeaking(true);

    const voices = await loadVoices();
    const voice =
      voices.find((v) => v.name.includes("Male")) ||
      voices.find((v) => v.name.includes("Female")) ||
      voices[0];

    for (const day of diet.days) {
      const chunks: string[] = [];

      chunks.push(`Day ${day.day}. Meals for the day.`);

      for (const meal of day.meals) {
        chunks.push(`${meal.type}. ${meal.title}. ${meal.description || ""}`);
        chunks.push(
          `Calories ${meal.calories}. Protein ${meal.protein}. Carbs ${meal.carbs}. Fats ${meal.fats}.`
        );
      }

      // Speak each chunk one by one
      for (const text of chunks) {
        const u = new SpeechSynthesisUtterance(text);
        if (voice) u.voice = voice;
        u.rate = 1.02;
        u.pitch = 1.01;

        window.speechSynthesis.speak(u);

        // Wait until chunk finishes before next chunk
        await new Promise((resolve) => {
          u.onend = resolve;
        });
      }
    }

    setSpeaking(false);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  // ----------------------------------------------------
  // Build Workout Speech
  // ----------------------------------------------------
  function buildWorkoutSpeech(workout: any) {
    let spoken = "";

    workout.days.forEach((day: any) => {
      spoken += `Day ${day.day}. ${day.title}. ${day.description}. `;

      day.exercises.forEach((ex: any) => {
        spoken += `Exercise: ${ex.name}. `;
        spoken += `${ex.sets} sets of ${ex.reps}. Rest ${ex.rest}. `;
        if (ex.notes) spoken += `Note: ${ex.notes}. `;
      });
    });

    return spoken;
  }

  // ----------------------------------------------------
  // Handle READ Button
  // ----------------------------------------------------
  async function handleRead() {
    if (!plan) return;

    if (speaking) return stopSpeaking();

    if (tab === "workout") {
      const text = buildWorkoutSpeech(plan.workout);
      speakText(text);
    } else {
      speakDiet(plan.diet); // 🔥 IMPORTANT — Diet uses chunked speech
    }
  }

  // ----------------------------------------------------
  // PDF EXPORT (unchanged)
  // ----------------------------------------------------
  async function exportPDF() {
    if (!plan) return;

    setShowPdfDom(true);
    await new Promise((res) => setTimeout(res, 700));

    const element = document.getElementById("pdf-content");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - imgHeight;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("AI-Fitness-Plan.pdf");
    setShowPdfDom(false);
  }

  // ----------------------------------------------------
  // UI Rendering
  // ----------------------------------------------------
  if (!plan) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400">
        No plan found. Please generate one from the setup page.
      </main>
    );
  }

  return (
    <>
      <TopNavbar />

      <main
        className="
        min-h-screen text-zinc-100 px-4 py-6 lg:py-10
        bg-[conic-gradient(at_top_left,_#ffcc70,_#ff9966,_#b34747,_#1a1a1a)]
      "
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {/* HEADER */}
          <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-yellow-300">
                Your AI-Generated Plan
              </h1>
              <p className="text-sm text-zinc-300">
                Personalized workout & diet guidance.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportPDF}
                className="px-4 py-2 rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600"
              >
                📄 Export PDF
              </button>

              <button
                onClick={handleRead}
                className={`px-4 py-2 rounded-xl shadow text-white ${
                  speaking ? "bg-red-500" : "bg-green-600"
                }`}
              >
                {speaking ? "⛔ Stop" : "🔊 Read"}
              </button>

              <button
                onClick={() => (window.location.href = "/setup")}
                className="px-4 py-2 rounded-xl bg-pink-500 text-white shadow hover:bg-pink-600"
              >
                🔁 Regenerate
              </button>
            </div>
          </header>

          {/* TABS */}
          <div className="inline-flex bg-zinc-900/80 border border-zinc-700 rounded-full p-1">
            <button
              onClick={() => setTab("workout")}
              className={`px-5 py-2 rounded-full ${
                tab === "workout"
                  ? "bg-yellow-500 text-black"
                  : "text-zinc-300"
              }`}
            >
              🏋️ Workout
            </button>

            <button
              onClick={() => setTab("diet")}
              className={`px-5 py-2 rounded-full ${
                tab === "diet"
                  ? "bg-yellow-500 text-black"
                  : "text-zinc-300"
              }`}
            >
              🍽️ Diet
            </button>
          </div>

          {/* CONTENT */}
          {tab === "workout" ? (
            <WorkoutSection workout={plan.workout} />
          ) : (
            <DietSection diet={plan.diet} />
          )}
        </div>
      </main>

      {/* HIDDEN PDF DOM */}
      {showPdfDom && (
        <div
          style={{
            position: "absolute",
            top: "-9999px",
            left: "-9999px",
            width: "800px",
          }}
        >
          <div id="pdf-content">
            <PdfDocument plan={plan} />
          </div>
        </div>
      )}
    </>
  );
}
