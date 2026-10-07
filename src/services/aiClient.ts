export type ChatResponse = {
  reply: string;
};

const baseUrl = import.meta.env.VITE_AI_SERVICE_URL?.replace(/\/$/, '') ?? '';

export function isAiServiceConfigured(): boolean {
  return baseUrl.length > 0;
}

/** ponytail: stub until Cloud Run backend ships; no fetch when URL unset. */
export async function postChat(_message: string): Promise<ChatResponse> {
  if (!isAiServiceConfigured()) {
    return Promise.reject(new Error('AI service not configured (set VITE_AI_SERVICE_URL)'));
  }
  return Promise.reject(new Error('AI chat client not implemented (Phase 4)'));
}
