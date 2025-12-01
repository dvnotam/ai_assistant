import { useState, useCallback } from 'react';
import type { Message, ChatState } from '../types/chat';
import { claudeService } from '../services/claudeService';

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
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
  }, [isApiKeySet, state.messages]);

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
    });
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
    apiKey,
    isApiKeySet,
    sendMessage,
    clearMessages,
    initializeApiKey,
    clearApiKey,
    loadApiKeyFromStorage,
  };
};
