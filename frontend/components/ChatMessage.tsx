'use client';

import { ChatMessage } from '@/types/chat';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessage;
}

export default function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex flex-shrink-0 justify-center items-center bg-blue-600 rounded-full w-8 h-8">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white ml-auto'
              : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
          }`}
        >
          <div className="break-words whitespace-pre-wrap">{message.content}</div>
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {timestamp}
        </div>
      </div>

      {isUser && (
        <div className="flex flex-shrink-0 justify-center items-center bg-gray-600 rounded-full w-8 h-8">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}
