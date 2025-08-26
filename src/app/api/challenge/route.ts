// src/app/api/challenge/route.ts
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-helpers";
import cap from "@/lib/cap";

export async function POST() {
  try {
    const payload = await cap.createChallenge();
    return NextResponse.json(payload);
  } catch (err) {
    return apiError("Failed to create CAP challenge", 500, {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
