import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Conversation, Message, IntermediateResult, Setting } from './types';

// Класс базы данных
export class AppDatabase extends Dexie {
  conversations!: Table<Conversation, number>;
  messages!: Table<Message, number>;
  intermediateResults!: Table<IntermediateResult, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super('AIAssistantDB');

    this.version(1).stores({
      conversations: '++id, createdAt, updatedAt',
      messages: '++id, conversationId, timestamp',
      intermediateResults: '++id, conversationId, taskId, timestamp, status',
      settings: 'key, updatedAt'
    });
  }
}

// Экспортируем единственный экземпляр базы данных
export const db = new AppDatabase();
