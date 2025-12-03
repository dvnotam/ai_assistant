export type ResponseFormat = 'text' | 'json';

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
}
