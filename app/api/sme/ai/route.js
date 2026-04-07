import { handleGeminiChat } from "@/lib/gemini-chat";

/** @deprecated Prefer POST /api/chat — kept for backward compatibility. */
export async function POST(request) {
  return handleGeminiChat(request);
}
