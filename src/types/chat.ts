export type ResponseFormat = 'text' | 'json';

export type ModelType = 'opus-3.5' | 'sonnet-4.5' | 'haiku-4.5';

export const MODEL_IDS: Record<ModelType, string> = {
  'opus-3.5': 'claude-3-opus-20240229',
  'sonnet-4.5': 'claude-sonnet-4-5-20250929',
  'haiku-4.5': 'claude-haiku-4-5-20251001',
};

export const MODEL_NAMES: Record<ModelType, string> = {
  'opus-3.5': 'Opus 3.5',
  'sonnet-4.5': 'Sonnet 4.5',
  'haiku-4.5': 'Haiku 4.5',
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
}

export type ChatState = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  responseFormat: ResponseFormat;
  useSystemPrompt: boolean;
  selectedModel: ModelType;
}
