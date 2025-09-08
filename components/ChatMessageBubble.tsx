
import React from 'react';
import type { ChatMessage } from '../types';
import { Icon } from './Icon';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 rounded-lg rounded-br-none p-3 max-w-lg shadow-md">
          <p className="text-white text-base leading-relaxed">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
        <div className="flex items-start gap-3">
            <div className="bg-slate-700 p-2 rounded-full">
                <Icon icon="model" className="w-6 h-6 text-blue-300" />
            </div>
            <div className="bg-slate-800 rounded-lg rounded-bl-none p-3 max-w-lg shadow-md">
                <p className="text-slate-200 text-base leading-relaxed">{message.text}</p>
            </div>
        </div>
    </div>
  );
};

export default ChatMessageBubble;
