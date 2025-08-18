import React, { useState, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface UseChatOptions {
  api?: string;
  initialMessages?: Message[];
  onError?: (error: any) => void;
}

export interface UseChatReturn {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: any;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { api = '/api/ai/chat', initialMessages = [], onError } = options;
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || data.message || 'No response received'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, api, onError]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error
  };
}
