import { db } from '../db/database';

// Очистка всей базы данных
export async function clearAllData(): Promise<void> {
  try {
    await db.transaction('rw', [db.conversations, db.messages, db.intermediateResults, db.settings], async () => {
      await db.conversations.clear();
      await db.messages.clear();
      await db.intermediateResults.clear();
      await db.settings.clear();
    });
    console.log('✅ Вся база данных очищена');
  } catch (error) {
    console.error('❌ Ошибка при очистке базы данных:', error);
    throw error;
  }
}

// Экспорт данных в JSON
export async function exportData(): Promise<string> {
  try {
    const [conversations, messages, intermediateResults, settings] = await Promise.all([
      db.conversations.toArray(),
      db.messages.toArray(),
      db.intermediateResults.toArray(),
      db.settings.toArray()
    ]);

    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      data: {
        conversations,
        messages,
        intermediateResults,
        settings
      }
    };

    const jsonString = JSON.stringify(data, null, 2);
    console.log('✅ Данные экспортированы');
    return jsonString;
  } catch (error) {
    console.error('❌ Ошибка при экспорте данных:', error);
    throw error;
  }
}

// Импорт данных из JSON
export async function importData(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);

    if (!data.data) {
      throw new Error('Неверный формат данных');
    }

    await db.transaction('rw', [db.conversations, db.messages, db.intermediateResults, db.settings], async () => {
      // Очищаем существующие данные
      await db.conversations.clear();
      await db.messages.clear();
      await db.intermediateResults.clear();
      await db.settings.clear();

      // Импортируем новые данные
      if (data.data.conversations) {
        await db.conversations.bulkAdd(data.data.conversations);
      }
      if (data.data.messages) {
        await db.messages.bulkAdd(data.data.messages);
      }
      if (data.data.intermediateResults) {
        await db.intermediateResults.bulkAdd(data.data.intermediateResults);
      }
      if (data.data.settings) {
        await db.settings.bulkPut(data.data.settings);
      }
    });

    console.log('✅ Данные импортированы успешно');
  } catch (error) {
    console.error('❌ Ошибка при импорте данных:', error);
    throw error;
  }
}

// Получение статистики использования базы данных
export async function getDatabaseStats(): Promise<{
  conversations: number;
  messages: number;
  intermediateResults: number;
  settings: number;
  totalSize: string;
}> {
  try {
    const [conversations, messages, intermediateResults, settings] = await Promise.all([
      db.conversations.count(),
      db.messages.count(),
      db.intermediateResults.count(),
      db.settings.count()
    ]);

    // Примерная оценка размера (более точная оценка требует navigator.storage API)
    let totalSize = 'Неизвестно';
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage) {
        totalSize = `${(estimate.usage / 1024 / 1024).toFixed(2)} MB`;
      }
    }

    const stats = {
      conversations,
      messages,
      intermediateResults,
      settings,
      totalSize
    };

    console.log('📊 Статистика базы данных:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Ошибка при получении статистики:', error);
    throw error;
  }
}

// Проверка доступности IndexedDB
export function isIndexedDBAvailable(): boolean {
  try {
    return !!window.indexedDB;
  } catch {
    return false;
  }
}

// Создание тестовых данных для демонстрации персистентности
export async function createTestData(): Promise<void> {
  try {
    console.log('🔧 Создание тестовых данных...');

    // Создаем тестовый диалог
    const conversationId = await db.conversations.add({
      title: 'Тестовый диалог',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: { test: true }
    });

    // Добавляем сообщения
    await db.messages.bulkAdd([
      {
        conversationId,
        role: 'user',
        content: 'Привет! Это тестовое сообщение.',
        timestamp: new Date(),
        metadata: { test: true }
      },
      {
        conversationId,
        role: 'assistant',
        content: 'Здравствуйте! Я сохранен в IndexedDB.',
        timestamp: new Date(),
        metadata: { test: true }
      }
    ]);

    // Добавляем промежуточные результаты
    await db.intermediateResults.bulkAdd([
      {
        conversationId,
        taskId: 'test-task-1',
        step: 1,
        stepName: 'Инициализация',
        result: { status: 'initialized' },
        timestamp: new Date(),
        status: 'completed'
      },
      {
        conversationId,
        taskId: 'test-task-1',
        step: 2,
        stepName: 'Обработка',
        result: { progress: 50 },
        timestamp: new Date(),
        status: 'pending'
      }
    ]);

    // Добавляем настройку
    await db.settings.put({
      key: 'test_setting',
      value: 'Test value',
      updatedAt: new Date()
    });

    console.log('✅ Тестовые данные созданы успешно!');
    console.log(`📝 Создан диалог с ID: ${conversationId}`);
  } catch (error) {
    console.error('❌ Ошибка при создании тестовых данных:', error);
    throw error;
  }
}
