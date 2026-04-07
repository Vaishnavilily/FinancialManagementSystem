import { handleGeminiChat } from "@/lib/gemini-chat";

export async function POST(request) {
  return handleGeminiChat(request);
}
