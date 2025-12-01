import { useState } from 'react';
import './ApiKeyInput.css';

interface ApiKeyInputProps {
  onSubmit: (apiKey: string) => void;
}

export const ApiKeyInput = ({ onSubmit }: ApiKeyInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
    }
  };

  return (
    <div className="api-key-container">
      <div className="api-key-card">
        <div className="api-key-header">
          <h1>Welcome to Claude Chat</h1>
          <p>Enter your Anthropic API key to start chatting</p>
        </div>
        <form onSubmit={handleSubmit} className="api-key-form">
          <input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="sk-ant-..."
            className="api-key-input"
            autoFocus
          />
          <button type="submit" className="api-key-submit" disabled={!inputValue.trim()}>
            Start Chatting
          </button>
        </form>
        <div className="api-key-note">
          <p>Your API key is stored locally and never sent to any server except Anthropic's API.</p>
          <p>Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">console.anthropic.com</a></p>
        </div>
      </div>
    </div>
  );
};
