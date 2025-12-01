import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService {
  private client: Anthropic | null = null;

  initialize(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
    });
  }

  async sendMessage(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
    if (!this.client) {
      throw new Error('Claude client not initialized. Please set your API key.');
    }

    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8096,
        messages,
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      throw new Error('Unexpected response format');
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
