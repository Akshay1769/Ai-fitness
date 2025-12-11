// D:\ai-fitness-coach\ai-fitness-coach\src\app\api\generate-image\route.ts
import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

export async function POST(req: Request) {
  try {
    console.log("API route HIT");
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
    }

    const token = process.env.HUGGING_FACE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Missing HuggingFace token in env" },
        { status: 500 }
      );
    }

    const client = new InferenceClient(token);

    let finalPrompt = `
      Ultra-detailed cinematic photography.
      ${prompt}.
      Professional lighting, 8K realism, sharp focus.
    `;

    try {
      const result = await client.textToImage({
        provider: "nebius",
        model: "black-forest-labs/FLUX.1-dev",
        inputs: finalPrompt,
        parameters: {
          num_inference_steps: 26,
          guidance_scale: 3.8,
        },
      });

      // Convert Blob → base64
      const blob = result as unknown as Blob;
      const buffer = Buffer.from(await blob.arrayBuffer());
      const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      return NextResponse.json({ image: base64 });

    } catch (err: any) {
      console.error("HF Inference Error:", err);

      if (err.message?.includes("403"))
        return NextResponse.json(
          { error: "Please accept the FLUX.1-dev model license on HuggingFace first." },
          { status: 403 }
        );

      throw err;
    }

  } catch (err) {
    console.error("General API Error:", err);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
