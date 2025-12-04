import { useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ApiKeyInput } from './ApiKeyInput';
import { MODEL_NAMES, type ModelType } from '../types/chat';
import './ChatContainer.css';

export const ChatContainer = () => {
  const {
    messages,
    isLoading,
    error,
    responseFormat,
    useSystemPrompt,
    selectedModel,
    isApiKeySet,
    sendMessage,
    clearMessages,
    initializeApiKey,
    clearApiKey,
    loadApiKeyFromStorage,
    setResponseFormat,
    toggleSystemPrompt,
    setSelectedModel,
  } = useChat();

  useEffect(() => {
    loadApiKeyFromStorage();
  }, [loadApiKeyFromStorage]);

  if (!isApiKeySet) {
    return <ApiKeyInput onSubmit={initializeApiKey} />;
  }

  return (
    <div className="chat-container">
      <aside className="chat-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h1 className="sidebar-title">Claude Chat</h1>
          </div>

          <div className="sidebar-section">
            <label className="sidebar-label">Языковая модель</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as ModelType)}
              className="sidebar-select"
            >
              <option value="opus-3.5">{MODEL_NAMES['opus-3.5']}</option>
              <option value="sonnet-4.5">{MODEL_NAMES['sonnet-4.5']}</option>
              <option value="haiku-4.5">{MODEL_NAMES['haiku-4.5']}</option>
            </select>
          </div>

          <div className="sidebar-section">
            <label className="sidebar-label">Стиль общения</label>
            <div className="sidebar-toggle">
              <span className="toggle-label">Обычный</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={useSystemPrompt}
                  onChange={(e) => toggleSystemPrompt(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">Диалог</span>
            </div>
          </div>

          <div className="sidebar-section">
            <label className="sidebar-label">Формат ответа</label>
            <div className="sidebar-toggle">
              <span className="toggle-label">Текст</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={responseFormat === 'json'}
                  onChange={(e) => setResponseFormat(e.target.checked ? 'json' : 'text')}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">JSON</span>
            </div>
          </div>

          <div className="sidebar-section">
            <label className="sidebar-label">Задачи</label>
            <div className="task-buttons">
              <button
                className="task-button"
                onClick={() => sendMessage('Реши задачу\n\nТри выключателя\n\nВ комнате есть три выключателя, но только один из них включает лампочку в соседней закрытой комнате. Ты можешь зайти в соседнюю комнату только один раз. Как определить, какой выключатель управляет лампочкой?')}
                disabled={isLoading}
              >
                Задача 1
              </button>
              <button
                className="task-button"
                onClick={() => sendMessage('Реши задачу\n\nПереправа через реку\n\nФермеру нужно переправить через реку волка, козу и капусту. В лодке помещается только он сам и один предмет. Если оставить волка с козой без присмотра — волк съест козу. Если оставить козу с капустой — коза съест капусту. Как переправить всех?')}
                disabled={isLoading}
              >
                Задача 2
              </button>
              <button
                className="task-button"
                onClick={() => sendMessage('Реши задачу\n\nМонеты\n\nУ тебя 10 стопок монет по 10 монет в каждой. В одной из стопок все монеты фальшивые. Настоящая монета весит 10 грамм, фальшивая — 9 грамм. У тебя есть точные весы, но взвесить можно только один раз. Как найти стопку с фальшивыми монетами?')}
                disabled={isLoading}
              >
                Задача 3
              </button>
              <button
                className="task-button"
                onClick={() => sendMessage('Реши задачу\n\nСтранный лифт\n\nВ здании 10 этажей. Человек живёт на 10-м этаже, но когда возвращается домой один, он доезжает на лифте только до 7-го этажа, а дальше идёт пешком. Когда с ним кто-то едет, он доезжает до 10-го. Почему?')}
                disabled={isLoading}
              >
                Задача 4
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="chat-main-area">
        <header className="chat-header">
          <div className="header-content">
            <div className="header-actions">
              <button onClick={clearMessages} className="header-button" title="Clear chat">
                🗑️ Очистить чат
              </button>
              <button onClick={clearApiKey} className="header-button" title="Change API key">
                🔑 Сменить ключ
              </button>
            </div>
          </div>
        </header>

        <main className="chat-main">
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}
          <MessageList messages={messages} isLoading={isLoading} />
        </main>

        <footer className="chat-footer">
          <MessageInput onSend={sendMessage} disabled={isLoading} />
        </footer>
      </div>
    </div>
  );
};
