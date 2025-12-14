import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './database';
import type { Conversation, Message, IntermediateResult } from './types';

// Хук для получения всех диалогов
export function useConversations(): Conversation[] | undefined {
  return useLiveQuery(() => db.conversations.orderBy('updatedAt').reverse().toArray());
}

// Хук для получения конкретного диалога
export function useConversation(id: number | undefined): Conversation | undefined {
  return useLiveQuery(() => (id ? db.conversations.get(id) : undefined), [id]);
}

// Хук для получения сообщений диалога
export function useMessages(conversationId: number | undefined): Message[] | undefined {
  return useLiveQuery(
    () =>
      conversationId
        ? db.messages.where('conversationId').equals(conversationId).sortBy('timestamp')
        : Promise.resolve([]),
    [conversationId]
  );
}

// Хук для получения промежуточных результатов по taskId
export function useIntermediateResults(taskId: string | undefined): IntermediateResult[] | undefined {
  return useLiveQuery(
    () => (taskId ? db.intermediateResults.where('taskId').equals(taskId).sortBy('step') : Promise.resolve([])),
    [taskId]
  );
}

// Хук для получения промежуточных результатов по conversationId
export function useIntermediateResultsByConversation(
  conversationId: number | undefined
): IntermediateResult[] | undefined {
  return useLiveQuery(
    () =>
      conversationId
        ? db.intermediateResults.where('conversationId').equals(conversationId).sortBy('timestamp')
        : Promise.resolve([]),
    [conversationId]
  );
}

// Хук для получения настройки
export function useSetting(key: string): any | undefined {
  return useLiveQuery(async () => {
    const setting = await db.settings.get(key);
    return setting?.value;
  }, [key]);
}

// Хук для получения статистики базы данных
export function useDatabaseStats() {
  return useLiveQuery(async () => {
    const [conversationsCount, messagesCount, intermediateResultsCount, settingsCount] = await Promise.all([
      db.conversations.count(),
      db.messages.count(),
      db.intermediateResults.count(),
      db.settings.count()
    ]);

    return {
      conversationsCount,
      messagesCount,
      intermediateResultsCount,
      settingsCount
    };
  });
}
