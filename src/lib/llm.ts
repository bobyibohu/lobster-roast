const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'sk-cp-cK42X-Yz5KleqTMKVhWD_TDUaDEIAldS3GkhF-mKg1m4EagFcY2OX7WYu06vabLZPG9ewsomdtIF29bNkJtGOCTaiKUoMHbOREBqkbRdJKT_eq6d4hFPCZE';
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';
const MODEL = 'abab6.5s-chat';

export interface LLMResponse {
  content: string;
  finish_reason: string;
}

export async function callLLM(prompt: string, system?: string): Promise<LLMResponse> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  if (system) {
    messages.push({ role: 'system', content: system });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MiniMax API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.choices && data.choices.length > 0) {
    return {
      content: data.choices[0].message.content,
      finish_reason: data.choices[0].finish_reason,
    };
  }

  throw new Error('No response from LLM');
}

export async function callLLMJson<T>(prompt: string, system?: string): Promise<T> {
  const fullPrompt = `${prompt}\n\n请只输出 JSON，不要输出其他内容。`;

  const response = await callLLM(fullPrompt, system);

  // Parse JSON from response
  const jsonMatch = response.content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse JSON from LLM response');
  }

  return JSON.parse(jsonMatch[0]);
}
