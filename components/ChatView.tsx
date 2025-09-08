
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { createChat } from '../services/geminiService';
import { CHAT_MODEL_NAME } from '../constants';
import ChatMessageBubble from './ChatMessageBubble';
import LoadingSpinner from './LoadingSpinner';
import { Icon } from './Icon';
import type { Chat } from '@google/genai';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = createChat(CHAT_MODEL_NAME);
     setMessages([
        {
            id: 'initial-message',
            role: 'model',
            text: "Hello! I'm Gemini. How can I help you today?"
        }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
        if (chatRef.current) {
            const response = await chatRef.current.sendMessage({ message: trimmedInput });
            const modelMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: response.text,
            };
            setMessages((prev) => [...prev, modelMessage]);
        }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-3 max-w-lg">
                    <Icon icon="model" className="w-8 h-8 flex-shrink-0 text-blue-400" />
                    <div className="flex items-center space-x-1">
                       <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-0"></span>
                       <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-150"></span>
                       <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-300"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-slate-800/70 backdrop-blur-sm border-t border-slate-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
          >
            {isLoading ? <LoadingSpinner /> : <Icon icon="send" className="w-6 h-6" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
