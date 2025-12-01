import type { Message as MessageType } from '../types/chat';
import './Message.css';

interface MessageProps {
  message: MessageType;
}

export const Message = ({ message }: MessageProps) => {
  return (
    <div className={`message ${message.role}`}>
      <div className="message-avatar">
        {message.role === 'user' ? '👤' : '🤖'}
      </div>
      <div className="message-content">
        <div className="message-text">{message.content}</div>
      </div>
    </div>
  );
};
