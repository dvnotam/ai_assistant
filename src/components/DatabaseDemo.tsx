import { useState } from 'react';
import { useConversations, useDatabaseStats } from '../db/hooks';
import { createConversation, addMessage } from '../db/operations';
import {
  clearAllData,
  exportData,
  getDatabaseStats,
  createTestData,
  isIndexedDBAvailable
} from '../utils/dbHelpers';
import './DatabaseDemo.css';

export const DatabaseDemo = () => {
  const conversations = useConversations();
  const stats = useDatabaseStats();
  const [status, setStatus] = useState<string>('');

  const handleCreateTestData = async () => {
    try {
      await createTestData();
      setStatus('✅ Тестовые данные созданы! Перезагрузите страницу, чтобы убедиться в персистентности.');
    } catch (error) {
      setStatus(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const id = await createConversation('Новый диалог', { createdBy: 'user' });
      await addMessage(id, 'user', 'Привет!');
      await addMessage(id, 'assistant', 'Здравствуйте! Чем могу помочь?');
      setStatus(`✅ Создан диалог #${id}`);
    } catch (error) {
      setStatus(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Удалить все данные из базы?')) {
      try {
        await clearAllData();
        setStatus('✅ Все данные удалены');
      } catch (error) {
        setStatus(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `db-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('✅ Данные экспортированы');
    } catch (error) {
      setStatus(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const handleShowStats = async () => {
    try {
      const dbStats = await getDatabaseStats();
      setStatus(`📊 Статистика: Диалогов: ${dbStats.conversations}, Сообщений: ${dbStats.messages}, Результатов: ${dbStats.intermediateResults}, Настроек: ${dbStats.settings}, Размер: ${dbStats.totalSize}`);
    } catch (error) {
      setStatus(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  if (!isIndexedDBAvailable()) {
    return (
      <div className="database-demo">
        <h2>❌ IndexedDB недоступен</h2>
        <p>Ваш браузер не поддерживает IndexedDB или он отключен.</p>
      </div>
    );
  }

  return (
    <div className="database-demo">
      <h2>🗄️ Database Demo - IndexedDB + Dexie.js</h2>

      <div className="demo-section">
        <h3>📊 Статистика (Live Updates)</h3>
        {stats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.conversationsCount}</div>
              <div className="stat-label">Диалогов</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.messagesCount}</div>
              <div className="stat-label">Сообщений</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.intermediateResultsCount}</div>
              <div className="stat-label">Результатов</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.settingsCount}</div>
              <div className="stat-label">Настроек</div>
            </div>
          </div>
        ) : (
          <p>Загрузка...</p>
        )}
      </div>

      <div className="demo-section">
        <h3>🛠️ Действия</h3>
        <div className="button-grid">
          <button onClick={handleCreateTestData} className="demo-button primary">
            Создать тестовые данные
          </button>
          <button onClick={handleCreateConversation} className="demo-button">
            Создать новый диалог
          </button>
          <button onClick={handleShowStats} className="demo-button">
            Показать детальную статистику
          </button>
          <button onClick={handleExport} className="demo-button">
            Экспортировать данные
          </button>
          <button onClick={handleClearAll} className="demo-button danger">
            Очистить все данные
          </button>
        </div>
      </div>

      {status && (
        <div className="demo-section">
          <div className="status-message">{status}</div>
        </div>
      )}

      <div className="demo-section">
        <h3>💬 Диалоги (Live Updates)</h3>
        {conversations && conversations.length > 0 ? (
          <div className="conversations-list">
            {conversations.map((conv) => (
              <div key={conv.id} className="conversation-card">
                <div className="conv-title">{conv.title}</div>
                <div className="conv-meta">
                  ID: {conv.id} | Создан: {new Date(conv.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Нет сохраненных диалогов. Создайте тестовые данные или новый диалог.</p>
        )}
      </div>

      <div className="demo-section">
        <h3>✅ Проверка персистентности</h3>
        <ol className="persistence-check">
          <li>Нажмите "Создать тестовые данные"</li>
          <li>Обновите страницу (F5) - данные должны остаться</li>
          <li>Закройте вкладку и откройте снова - данные должны остаться</li>
          <li>Перезапустите браузер - данные должны остаться</li>
        </ol>
        <p className="note">
          💡 Данные сохраняются в IndexedDB и доступны между сессиями браузера.
        </p>
      </div>
    </div>
  );
};
