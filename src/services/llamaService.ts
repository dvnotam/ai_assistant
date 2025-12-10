import { HfInference } from '@huggingface/inference';

export interface LlamaResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export class LlamaService {
  private client: HfInference | null = null;

  initialize(apiKey: string) {
    this.client = new HfInference(apiKey);
  }

  async sendMessage(
    messages: { role: 'user' | 'assistant'; content: string }[],
    temperature: number
  ): Promise<LlamaResponse> {
    if (!this.client) {
      throw new Error('Llama service not initialized');
    }

    try {
      const response = await this.client.chatCompletion({
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: temperature,
        max_tokens: 2048,
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
        model: 'Llama-3.3-70B-Instruct',
      };
    } catch (error) {
      console.error('Llama API error:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to perform inference: ${error.message}`
          : 'Failed to perform inference'
      );
    }
  }
}

export const llamaService = new LlamaService();
