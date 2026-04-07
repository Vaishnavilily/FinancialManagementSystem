import { NextResponse } from "next/server";
import { handleGeminiChat } from "@/lib/gemini-chat";
import { requireAuth } from "@/lib/jwt";

export async function POST(request) {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }
  return handleGeminiChat(request);
}
