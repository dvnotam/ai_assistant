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
    isApiKeySet,
    sendMessage,
    clearMessages,
    initializeApiKey,
    clearApiKey,
    loadApiKeyFromStorage,
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
