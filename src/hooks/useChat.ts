import { useState, useCallback } from 'react';
import type { Message, ChatState, ResponseFormat, ModelType } from '../types/chat';
import { MODEL_IDS } from '../types/chat';
import { claudeService } from '../services/claudeService';
import { groqService } from '../services/groqService';
import { qwenService } from '../services/qwenService';
import { llamaService } from '../services/llamaService';
import { gemmaService } from '../services/gemmaService';

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    responseFormat: 'text',
    selectedModel: 'sonnet-4.5',
    temperature: 0.7,
  });

  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);
  const [groqApiKey, setGroqApiKey] = useState<string>('');
  const [isGroqApiKeySet, setIsGroqApiKeySet] = useState<boolean>(false);
  const [qwenApiKey, setQwenApiKey] = useState<string>('');
  const [isQwenApiKeySet, setIsQwenApiKeySet] = useState<boolean>(false);
  const [llamaApiKey, setLlamaApiKey] = useState<string>('');
  const [isLlamaApiKeySet, setIsLlamaApiKeySet] = useState<boolean>(false);
  const [gemmaApiKey, setGemmaApiKey] = useState<string>('');
  const [isGemmaApiKeySet, setIsGemmaApiKeySet] = useState<boolean>(false);

  const initializeApiKey = useCallback((key: string) => {
    claudeService.initialize(key);
    setApiKey(key);
    setIsApiKeySet(true);
    // Store in localStorage for convenience (in production, use more secure storage)
    localStorage.setItem('claude_api_key', key);
  }, []);

  const initializeGroqApiKey = useCallback((key: string) => {
    groqService.initialize(key);
    setGroqApiKey(key);
    setIsGroqApiKeySet(true);
    localStorage.setItem('groq_api_key', key);
  }, []);

  const initializeQwenApiKey = useCallback((key: string) => {
    qwenService.initialize(key);
    setQwenApiKey(key);
    setIsQwenApiKeySet(true);
    localStorage.setItem('qwen_api_key', key);
  }, []);

  const initializeLlamaApiKey = useCallback((key: string) => {
    llamaService.initialize(key);
    setLlamaApiKey(key);
    setIsLlamaApiKeySet(true);
    localStorage.setItem('llama_api_key', key);
  }, []);

  const initializeGemmaApiKey = useCallback((key: string) => {
    gemmaService.initialize(key);
    setGemmaApiKey(key);
    setIsGemmaApiKeySet(true);
    localStorage.setItem('gemma_api_key', key);
  }, []);

  const loadApiKeyFromStorage = useCallback(() => {
    const storedKey = localStorage.getItem('claude_api_key');
    if (storedKey) {
      initializeApiKey(storedKey);
    }

    const storedGroqKey = localStorage.getItem('groq_api_key');
    if (storedGroqKey) {
      initializeGroqApiKey(storedGroqKey);
    }

    const storedQwenKey = localStorage.getItem('qwen_api_key');
    if (storedQwenKey) {
      initializeQwenApiKey(storedQwenKey);
    }

    const storedLlamaKey = localStorage.getItem('llama_api_key');
    if (storedLlamaKey) {
      initializeLlamaApiKey(storedLlamaKey);
    }

    const storedGemmaKey = localStorage.getItem('gemma_api_key');
    if (storedGemmaKey) {
      initializeGemmaApiKey(storedGemmaKey);
    }

    const storedModel = localStorage.getItem('claude_selected_model') as ModelType | null;
    if (storedModel && (storedModel === 'opus-3.5' || storedModel === 'sonnet-4.5' || storedModel === 'haiku-4.5' || storedModel === 'groq' || storedModel === 'qwen' || storedModel === 'llama' || storedModel === 'gemma')) {
      setState(prev => ({
        ...prev,
        selectedModel: storedModel,
      }));
    }
  }, [initializeApiKey, initializeGroqApiKey, initializeQwenApiKey, initializeLlamaApiKey, initializeGemmaApiKey]);

  const sendMessage = useCallback(async (content: string) => {
    const isGroq = state.selectedModel === 'groq';
    const isQwen = state.selectedModel === 'qwen';
    const isLlama = state.selectedModel === 'llama';
    const isGemma = state.selectedModel === 'gemma';
    if (!content.trim()) return;
    if (isGroq && !isGroqApiKeySet) return;
    if (isQwen && !isQwenApiKeySet) return;
    if (isLlama && !isLlamaApiKeySet) return;
    if (isGemma && !isGemmaApiKeySet) return;
    if (!isGroq && !isQwen && !isLlama && !isGemma && !isApiKeySet) return;

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

      const isGroq = state.selectedModel === 'groq';
      const isQwen = state.selectedModel === 'qwen';
      const isLlama = state.selectedModel === 'llama';
      const isGemma = state.selectedModel === 'gemma';

      // Запускаем таймер
      const startTime = Date.now();

      const response = isGemma
        ? await gemmaService.sendMessage(conversationHistory, state.temperature)
        : isLlama
        ? await llamaService.sendMessage(conversationHistory, state.temperature)
        : isQwen
        ? await qwenService.sendMessage(conversationHistory, state.temperature)
        : isGroq
        ? await groqService.sendMessage(conversationHistory, state.temperature)
        : await claudeService.sendMessage(
            conversationHistory,
            MODEL_IDS[state.selectedModel],
            state.temperature
          );

      // Вычисляем время ответа
      const responseTime = Date.now() - startTime;

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
        responseTime: responseTime,
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
  }, [isApiKeySet, isGroqApiKeySet, isQwenApiKeySet, isLlamaApiKeySet, isGemmaApiKeySet, state.messages, state.responseFormat, state.selectedModel, state.temperature]);

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

  const setSelectedModel = useCallback((model: ModelType) => {
    setState(prev => ({
      ...prev,
      selectedModel: model,
    }));
    localStorage.setItem('claude_selected_model', model);
  }, []);

  const setTemperature = useCallback((temp: number) => {
    setState(prev => ({
      ...prev,
      temperature: temp,
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
    selectedModel: state.selectedModel,
    temperature: state.temperature,
    apiKey,
    isApiKeySet,
    groqApiKey,
    isGroqApiKeySet,
    qwenApiKey,
    isQwenApiKeySet,
    llamaApiKey,
    isLlamaApiKeySet,
    gemmaApiKey,
    isGemmaApiKeySet,
    sendMessage,
    clearMessages,
    initializeApiKey,
    initializeGroqApiKey,
    initializeQwenApiKey,
    initializeLlamaApiKey,
    initializeGemmaApiKey,
    clearApiKey,
    loadApiKeyFromStorage,
    setResponseFormat,
    setSelectedModel,
    setTemperature,
  };
};
