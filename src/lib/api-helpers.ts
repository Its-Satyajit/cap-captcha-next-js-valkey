import { NextResponse } from "next/server";

export function apiError(
  message: string,
  status: number = 500,
  context: Record<string, any> = {},
) {
  // Log the detailed error on the server for debugging
  console.error(`[API Error] ${message}`, { status, ...context });

  // Return a generic, safe error message to the client
  return NextResponse.json(
    { success: false, error: "An internal server error occurred." },
    { status },
  );
}
