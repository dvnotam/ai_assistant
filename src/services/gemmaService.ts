import { HfInference } from '@huggingface/inference';

export interface GemmaResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  model: string;
}

const SYSTEM_PROMPT = `КРИТИЧЕСКОЕ ТРЕБОВАНИЕ: Максимум 100 токенов.

Правила:
- Только самое важное
- Короткие предложения
- Без повторений
- Логически завершай ответ
- Если нужно больше — предложи уточнить
- Не извиняйся за краткость

Превышаешь 100 токенов — сокращай безжалостно.`;

export class GemmaService {
  private client: HfInference | null = null;

  initialize(apiKey: string) {
    this.client = new HfInference(apiKey);
  }

  async sendMessage(
    messages: { role: 'user' | 'assistant'; content: string }[],
    temperature: number
  ): Promise<GemmaResponse> {
    if (!this.client) {
      throw new Error('Gemma service not initialized');
    }

    try {
      const response = await this.client.chatCompletion({
        model: 'google/gemma-2-9b-it',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        temperature: temperature,
        max_tokens: 100,
      });

      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage;

      return {
        content,
        usage: {
          input_tokens: usage?.prompt_tokens || 0,
          output_tokens: usage?.completion_tokens || 0,
          total_tokens: usage?.total_tokens || 0,
        },
        model: 'Gemma-2-9B-IT',
      };
    } catch (error) {
      console.error('Gemma API error:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to perform inference: ${error.message}`
          : 'Failed to perform inference'
      );
    }
  }
}

export const gemmaService = new GemmaService();
