import Anthropic from '@anthropic-ai/sdk';
import type { TokenUsage } from '../types/chat';

export type ClaudeResponse = {
  content: string;
  usage: TokenUsage;
  model: string;
}

export class ClaudeService {
  private client: Anthropic | null = null;
  private model = 'claude-haiku-4-5-20251001';

  initialize(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
    });
  }

  async sendMessage(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<ClaudeResponse> {
    if (!this.client) {
      throw new Error('Claude client not initialized. Please set your API key.');
    }

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 8096,
        messages,
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
