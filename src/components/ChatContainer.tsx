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
    selectedModel,
    temperature,
    isApiKeySet,
    sendMessage,
    clearMessages,
    initializeApiKey,
    clearApiKey,
    loadApiKeyFromStorage,
    setResponseFormat,
    setSelectedModel,
    setTemperature,
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
            <label className="sidebar-label">Temperature: {temperature.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="temperature-slider"
            />
            <div className="temperature-labels">
              <span className="temp-label">🎯 Точность</span>
              <span className="temp-label">🚀 Креативность</span>
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
