import { useState, useCallback } from 'react';
import type { Message, ChatState, ResponseFormat } from '../types/chat';
import { claudeService } from '../services/claudeService';

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    responseFormat: 'text',
  });

  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);

  const initializeApiKey = useCallback((key: string) => {
    claudeService.initialize(key);
    setApiKey(key);
    setIsApiKeySet(true);
    // Store in localStorage for convenience (in production, use more secure storage)
    localStorage.setItem('claude_api_key', key);
  }, []);

  const loadApiKeyFromStorage = useCallback(() => {
    const storedKey = localStorage.getItem('claude_api_key');
    if (storedKey) {
      initializeApiKey(storedKey);
    }
  }, [initializeApiKey]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !isApiKeySet) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const conversationHistory = [...state.messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await claudeService.sendMessage(conversationHistory);

      let messageContent: string;

      if (state.responseFormat === 'json') {
        // Remove HTML tags and clean text
        const cleanText = (text: string): string => {
          let cleaned = text.replace(/<[^>]*>/g, ''); // Remove HTML tags
          cleaned = cleaned.replace(/\\n✓/g, ''); // Remove \n✓
          cleaned = cleaned.replace(/\\n\\n/g, ' '); // Remove \n\n
          cleaned = cleaned.replace(/\\n/g, ' '); // Remove \n
          cleaned = cleaned.replace(/\n\n/g, ' '); // Remove actual double newlines
          cleaned = cleaned.replace(/\n/g, ' '); // Remove actual newlines
          cleaned = cleaned.replace(/\s+/g, ' '); // Replace multiple spaces with single space
          return cleaned.trim();
        };

        const cleanedText = cleanText(response.content);

        // Format response as JSON
        const jsonResponse = {
          content: cleanedText,
          tokens: {
            input: response.usage.input_tokens,
            output: response.usage.output_tokens,
            total: response.usage.total_tokens,
          },
          model: response.model,
          timestamp: Date.now(),
        };
        // Wrap in markdown code block
        messageContent = '```json\n' + JSON.stringify(jsonResponse, null, 2) + '\n```';
      } else {
        // Return as plain text
        messageContent = response.content;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: messageContent,
        timestamp: Date.now(),
        usage: response.usage,
        model: response.model,
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [isApiKeySet, state.messages, state.responseFormat]);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      isLoading: false,
      error: null,
    }));
  }, []);

  const setResponseFormat = useCallback((format: ResponseFormat) => {
    setState(prev => ({
      ...prev,
      responseFormat: format,
    }));
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKey('');
    setIsApiKeySet(false);
    localStorage.removeItem('claude_api_key');
    clearMessages();
  }, [clearMessages]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    responseFormat: state.responseFormat,
    apiKey,
    isApiKeySet,
    sendMessage,
    clearMessages,
    initializeApiKey,
    clearApiKey,
    loadApiKeyFromStorage,
    setResponseFormat,
  };
};
