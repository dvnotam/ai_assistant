import Anthropic from '@anthropic-ai/sdk';
import type { TokenUsage } from '../types/chat';

export type ClaudeResponse = {
  content: string;
  usage: TokenUsage;
  model: string;
}

const getSystemPrompt = (temperature: number): string => {
  return `⚠️⚠️⚠️ АБСОЛЮТНОЕ ТРЕБОВАНИЕ: МАКСИМУМ 100 ТОКЕНОВ ⚠️⚠️⚠️

КРИТИЧЕСКОЕ ПРАВИЛО:
ПЕРЕД ОТПРАВКОЙ ОТВЕТА — ПОСЧИТАЙ ТОКЕНЫ!
ЕСЛИ БОЛЬШЕ 100 — СОКРАЩАЙ ДО ТЕХ ПОР, ПОКА НЕ БУДЕТ ≤100!

ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА:
- Только самое важное — никакой воды
- Максимально короткие предложения
- Нет повторений, нет пояснений
- Не извиняйся, не комментируй краткость
- Больше 100 токенов = НЕПРИЕМЛЕМО
- Если тема сложная — предложи конкретизировать

АЛГОРИТМ:
1. Сформулируй ответ
2. Подсчитай токены
3. Если >100 — сокращай безжалостно
4. Повтори проверку
5. Только потом отправляй

Температура: ${temperature.toFixed(1)}`;
};

export class ClaudeService {
  private client: Anthropic | null = null;

  initialize(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
    });
  }

  async sendMessage(
    messages: { role: 'user' | 'assistant'; content: string }[],
    modelId: string,
    temperature: number
  ): Promise<ClaudeResponse> {
    if (!this.client) {
      throw new Error('Claude client not initialized. Please set your API key.');
    }

    // Limited to 100 tokens per response
    const maxTokens = 100;

    try {
      const response = await this.client.messages.create({
        model: modelId,
        max_tokens: maxTokens,
        messages,
        system: getSystemPrompt(temperature),
        temperature: temperature,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response format');
      }

      return {
        content: content.text,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        model: response.model,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get response from Claude: ${error.message}`);
      }
      throw new Error('Failed to get response from Claude');
    }
  }

  isInitialized(): boolean {
    return this.client !== null;
  }
}

export const claudeService = new ClaudeService();
