import { useState } from 'react';
import type { Message as MessageType, ModelType } from '../types/chat';
import { MessageMetrics } from './MessageMetrics';
import './Message.css';

interface MessageProps {
  message: MessageType;
  selectedModel: ModelType;
}

const isMarkdownCodeBlock = (str: string): boolean => {
  return str.startsWith('```') && str.endsWith('```');
};

const extractCodeFromBlock = (str: string): string => {
  // Remove opening ```json or ``` and closing ```
  return str.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
};

const CodeBlock = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="code-block-wrapper">
      <button
        className="copy-button"
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      <pre className="message-json">
        <code>{content}</code>
      </pre>
    </div>
  );
};

export const Message = ({ message, selectedModel }: MessageProps) => {
  const isCodeBlock = message.role === 'assistant' && isMarkdownCodeBlock(message.content);

  return (
    <div className={`message ${message.role}`}>
      <div className="message-avatar">
        {message.role === 'user' ? '👤' : '🤖'}
      </div>
      <div className="message-content">
        {isCodeBlock ? (
          <CodeBlock content={extractCodeFromBlock(message.content)} />
        ) : (
          <div className="message-text">{message.content}</div>
        )}
        {message.role === 'assistant' && (
          <MessageMetrics
            usage={message.usage}
            responseTime={message.responseTime}
            model={message.model}
            selectedModel={selectedModel}
          />
        )}
      </div>
    </div>
  );
};
