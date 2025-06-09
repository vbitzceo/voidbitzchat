'use client';

import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start gap-3 mb-6">
      <div className="flex flex-shrink-0 justify-center items-center bg-blue-600 rounded-full w-8 h-8">
        <Bot className="w-5 h-5 text-white" />
      </div>
      
      <div className="max-w-[80%]">        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl text-gray-900 dark:text-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">AI is thinking</span>
            <div className="flex gap-1">
              <div className="bg-blue-500 rounded-full w-2 h-2 typing-dot-1"></div>
              <div className="bg-blue-500 rounded-full w-2 h-2 typing-dot-2"></div>
              <div className="bg-blue-500 rounded-full w-2 h-2 typing-dot-3"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-1 text-gray-500 dark:text-gray-400 text-xs text-left">
          Generating response...
        </div>
      </div>
    </div>
  );
}
