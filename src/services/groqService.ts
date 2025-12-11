import Groq from 'groq-sdk';
import type { TokenUsage } from '../types/chat';

export type GroqResponse = {
  content: string;
  usage: TokenUsage;
  model: string;
}

export class GroqService {
  private client: Groq | null = null;

  initialize(apiKey: string) {
    this.client = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  async sendMessage(
    messages: { role: 'user' | 'assistant'; content: string }[],
    temperature: number
  ): Promise<GroqResponse> {
    if (!this.client) {
      throw new Error('Groq client not initialized. Please set your API key.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: temperature,
        max_tokens: 8096,
      });

      const content = response.choices[0]?.message?.content || '';

      return {
        content: content,
        usage: {
          input_tokens: response.usage?.prompt_tokens || 0,
          output_tokens: response.usage?.completion_tokens || 0,
          total_tokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get response from Groq: ${error.message}`);
      }
      throw new Error('Failed to get response from Groq');
    }
  }

  isInitialized(): boolean {
    return this.client !== null;
  }
}

export const groqService = new GroqService();
