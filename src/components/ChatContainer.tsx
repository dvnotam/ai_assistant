import { useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ApiKeyInput } from './ApiKeyInput';
import './ChatContainer.css';

export const ChatContainer = () => {
  const {
    messages,
    isLoading,
    error,
    responseFormat,
    isApiKeySet,
    sendMessage,
    clearMessages,
    initializeApiKey,
    clearApiKey,
    loadApiKeyFromStorage,
    setResponseFormat,
  } = useChat();

  useEffect(() => {
    loadApiKeyFromStorage();
  }, [loadApiKeyFromStorage]);

  if (!isApiKeySet) {
    return <ApiKeyInput onSubmit={initializeApiKey} />;
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="header-content">
          <h1 className="header-title">Claude Chat</h1>
          <div className="header-actions">
            <div className="format-toggle">
              <span className="format-label">Текст</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={responseFormat === 'json'}
                  onChange={(e) => setResponseFormat(e.target.checked ? 'json' : 'text')}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="format-label">JSON</span>
            </div>
            <button onClick={clearMessages} className="header-button" title="Clear chat">
              🗑️ Clear
            </button>
            <button onClick={clearApiKey} className="header-button" title="Change API key">
              🔑 Change Key
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
  );
};
