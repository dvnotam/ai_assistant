export type ResponseFormat = 'text' | 'json';

export type ModelType = 'opus-3.5' | 'sonnet-4.5' | 'haiku-4.5' | 'groq' | 'qwen' | 'llama' | 'gemma';

export const MODEL_IDS: Record<ModelType, string> = {
  'opus-3.5': 'claude-3-opus-20240229',
  'sonnet-4.5': 'claude-sonnet-4-5-20250929',
  'haiku-4.5': 'claude-haiku-4-5-20251001',
  'groq': 'llama-3.3-70b-versatile',
  'qwen': 'Qwen/Qwen2.5-72B-Instruct',
  'llama': 'meta-llama/Llama-3.3-70B-Instruct',
  'gemma': 'google/gemma-2-9b-it',
};

export const MODEL_NAMES: Record<ModelType, string> = {
  'opus-3.5': 'Opus 3.5',
  'sonnet-4.5': 'Sonnet 4.5',
  'haiku-4.5': 'Haiku 4.5',
  'groq': 'Llama 3.3 70B (Groq)',
  'qwen': 'Qwen 2.5 72B (HuggingFace)',
  'llama': 'Llama 3.3 70B (HuggingFace)',
  'gemma': 'Gemma 2 9B (HuggingFace)',
};

// Цены в $ за 1M токенов
export const MODEL_PRICING: Record<ModelType, { input: number; output: number }> = {
  'opus-3.5': { input: 15, output: 75 },      // Claude Opus 3.5
  'sonnet-4.5': { input: 3, output: 15 },     // Claude Sonnet 4.5
  'haiku-4.5': { input: 0.8, output: 4 },     // Claude Haiku 4.5
  'groq': { input: 0, output: 0 },            // Groq - бесплатно
  'qwen': { input: 0, output: 0 },            // HuggingFace - бесплатно
  'llama': { input: 0, output: 0 },           // HuggingFace - бесплатно
  'gemma': { input: 0, output: 0 },           // HuggingFace - бесплатно
};

export type TokenUsage = {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  usage?: TokenUsage;
  model?: string;
  responseTime?: number; // время ответа в миллисекундах
}

export type ChatState = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  responseFormat: ResponseFormat;
  selectedModel: ModelType;
  temperature: number;
}
