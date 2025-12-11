// app/api/generate-plan/route.ts
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // this is the form object from the client

    // -------------------------
    // Supabase (server) client
    // -------------------------
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase env vars");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Try to find a user_id for this profile (best-effort match by name & age)
    let userId: string | null = null;
    try {
      // Attempt to match by name + age if provided
      if (body.name && (body.age || body.age === 0)) {
        const { data: profileData, error: profileError } = await supabase
          .from("user_fitness_profiles")
          .select("user_id")
          .eq("name", body.name)
          .eq("age", Number(body.age))
          .limit(1)
          .maybeSingle();

        if (profileError) {
          console.warn("Profile lookup warning:", profileError.message || profileError);
        } else if (profileData && (profileData as any).user_id) {
          userId = (profileData as any).user_id;
        }
      }

      // If not found by name+age, try by user_id if the client passed it (rare)
      if (!userId && body.user_id) {
        userId = body.user_id;
      }
    } catch (err) {
      console.warn("Profile lookup failed", err);
    }

    // If userId found, check user_plans table for saved plan
    if (userId) {
      try {
        const { data: existingPlanRow, error: planError } = await supabase
          .from("user_plans")
          .select("plan")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();

        if (planError) {
          console.warn("user_plans lookup error:", planError.message || planError);
        } else if (existingPlanRow && (existingPlanRow as any).plan) {
          // Return the saved plan
          return NextResponse.json((existingPlanRow as any).plan);
        }
      } catch (err) {
        console.warn("user_plans query failed", err);
      }
    }

    // -------------------------
    // Call GROQ to generate the plan
    // -------------------------
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error("Missing GROQ_API_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const groq = new Groq({ apiKey: groqApiKey });

    const prompt = `
Generate a CLEAN VALID JSON ONLY.
NO markdown. NO explanations. NO backticks.

The JSON must follow EXACT structure:

{
  "workout": {
    "motivation": "string",
    "tips": ["string"],
    "days": [
      {
        "day": number,
        "title": "string",
        "description": "string",
        "exercises": [
          {
            "name": "string",
            "sets": "string",
            "reps": "string",
            "rest": "string",
            "notes": "string"
          }
        ]
      }
    ]
  },
  "diet": {
    "motivation": "string",
    "tips": ["string"],
    "hydration": "string",
    "supplements": ["string"],
    "days": [
      {
        "day": number,
        "meals": [
          {
            "type": "string",
            "title": "string",
            "description": "string",
            "calories": "string",
            "protein": "string",
            "carbs": "string",
            "fats": "string"
          }
        ]
      }
    ]
  }
}

Use this user profile:
${JSON.stringify(body)}
`;

    console.log("generate-plan route: calling groq...");

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    let text = response.choices[0]?.message?.content || "";

    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/[\u0000-\u001F]+/g, "")
      .trim();

    const plan = JSON.parse(text);

    // -------------------------
    // Save plan to user_plans if we found userId
    // -------------------------
    if (userId) {
      try {
        const { error: insertError } = await supabase
          .from("user_plans")
          .upsert(
            {
              user_id: userId,
              plan: plan,
              updated_at: new Date(),
            },
            { onConflict: "user_id" }
          );

        if (insertError) {
          console.warn("Failed to upsert user_plans:", insertError.message || insertError);
        }
      } catch (err) {
        console.warn("Error saving plan to user_plans:", err);
      }
    } else {
      console.warn("No user_id found — plan will not be saved to user_plans.");
    }

    return NextResponse.json(plan);
  } catch (err: any) {
    console.error("generate-plan route error:", err);
    return NextResponse.json({ error: err.message || "Generation failed" }, { status: 500 });
  }
}
