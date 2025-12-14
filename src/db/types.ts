// TypeScript интерфейсы для базы данных

export interface Conversation {
  id?: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

export interface Message {
  id?: number;
  conversationId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface IntermediateResult {
  id?: number;
  conversationId: number;
  taskId: string;
  step: number;
  stepName: string;
  result: any;
  timestamp: Date;
  status: 'pending' | 'completed' | 'error';
}

export interface Setting {
  key: string;
  value: any;
  updatedAt: Date;
}
