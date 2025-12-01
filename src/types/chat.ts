export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type ChatState = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
