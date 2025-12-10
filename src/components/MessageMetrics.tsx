import { MODEL_PRICING } from '../types/chat';
import type { TokenUsage, ModelType } from '../types/chat';
import './MessageMetrics.css';

interface MessageMetricsProps {
  usage?: TokenUsage;
  responseTime?: number;
  model?: string;
  selectedModel: ModelType;
}

export const MessageMetrics = ({ usage, responseTime, model, selectedModel }: MessageMetricsProps) => {
  if (!usage && !responseTime) return null;

  // Вычисляем стоимость
  const calculateCost = (): number => {
    if (!usage) return 0;

    const pricing = MODEL_PRICING[selectedModel];
    const inputCost = (usage.input_tokens / 1_000_000) * pricing.input;
    const outputCost = (usage.output_tokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  };

  const cost = calculateCost();
  const isFree = cost === 0;

  // Форматируем время ответа
  const formatTime = (ms?: number): string => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}мс`;
    return `${(ms / 1000).toFixed(2)}с`;
  };

  return (
    <div className="message-metrics">
      {responseTime !== undefined && (
        <div className="metric-item">
          <span className="metric-icon">⏱️</span>
          <span className="metric-label">Время:</span>
          <span className="metric-value">{formatTime(responseTime)}</span>
        </div>
      )}

      {usage && (
        <>
          <div className="metric-item">
            <span className="metric-icon">📊</span>
            <span className="metric-label">Токены:</span>
            <span className="metric-value">
              {usage.input_tokens.toLocaleString()} + {usage.output_tokens.toLocaleString()} = {usage.total_tokens.toLocaleString()}
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-icon">💰</span>
            <span className="metric-label">Стоимость:</span>
            <span className={`metric-value ${isFree ? 'free' : ''}`}>
              {isFree ? 'Бесплатно' : `$${cost.toFixed(6)}`}
            </span>
          </div>
        </>
      )}

      {model && (
        <div className="metric-item">
          <span className="metric-icon">🤖</span>
          <span className="metric-label">Модель:</span>
          <span className="metric-value model-name">{model}</span>
        </div>
      )}
    </div>
  );
};
