// D:\ai-fitness-coach\ai-fitness-coach\src\app\plan\components\ImageGenerator.tsx
"use client";

import { useState } from "react";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateImage() {
    setLoading(true);
    setImage("");
    console.log("ImageGenerator running in:", typeof window === "undefined" ? "SERVER" : "CLIENT");

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.error || "Failed to generate image");
        return;
      }

      if (data.image) {
        setImage(data.image);
      } else {
        alert("Image generation failed.");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Unexpected error occurred.");
    }
  }

  return (
    <div className="space-y-4 p-4">
      <textarea
        className="w-full p-2 bg-zinc-900 text-white rounded"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your image..."
      />

      <button
        onClick={generateImage}
        disabled={loading}
        className="px-4 py-2 bg-yellow-500 text-black rounded"
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>

      {image && (
        <div className="mt-4">
          <img src={image} className="rounded-lg shadow-xl" alt="Generated" />
        </div>
      )}
    </div>
  );
}
