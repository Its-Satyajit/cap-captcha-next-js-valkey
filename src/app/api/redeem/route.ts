import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-helpers";
import cap from "@/lib/cap";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, solutions } = body;

    if (!token || !solutions) {
      return NextResponse.json(
        { success: false, error: "Missing token or solutions." },
        { status: 400 },
      );
    }
    const result = await cap.redeemChallenge({ token, solutions });
    return NextResponse.json(result);
  } catch (err) {
    return apiError("Failed to redeem CAP challenge", 500, {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
