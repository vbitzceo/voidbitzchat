'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatSession, ChatSessionDetail, ChatMessage } from '@/types/chat';
import { ChatApiService } from '@/lib/api';
import ChatMessageComponent from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { Bot, AlertCircle } from 'lucide-react';

interface ChatInterfaceProps {
  selectedSession: ChatSession | null;
  onSessionUpdate: () => void;
}

export default function ChatInterface({ selectedSession, onSessionUpdate }: ChatInterfaceProps) {
  const [sessionDetail, setSessionDetail] = useState<ChatSessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load session detail when selected session changes
  useEffect(() => {
    if (selectedSession) {
      loadSessionDetail(selectedSession.id);
    } else {
      setSessionDetail(null);
    }
  }, [selectedSession]);
  // Auto-scroll to bottom when new messages arrive or when waiting for response
  useEffect(() => {
    scrollToBottom();
  }, [sessionDetail?.messages, isWaitingForResponse]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessionDetail = async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const detail = await ChatApiService.getSession(sessionId);
      setSessionDetail(detail);
    } catch (error) {
      setError('Failed to load chat session');
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedSession) {
      setError('No session selected');
      return;
    }

    try {
      setError(null);
      setIsWaitingForResponse(true);
      
      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        sessionId: selectedSession.id,
        content: message,
        role: 'user',
        timestamp: new Date().toISOString(),
        tokenCount: 0
      };

      setSessionDetail(prev => prev ? {
        ...prev,
        messages: [...prev.messages, userMessage]
      } : null);      // Send message to API
      await ChatApiService.sendMessage({
        sessionId: selectedSession.id,
        message
      });

      // Update session detail with actual response
      await loadSessionDetail(selectedSession.id);
      
      // Notify parent to refresh sessions list
      onSessionUpdate();
      
    } catch (error) {
      setError('Failed to send message');
      console.error('Error sending message:', error);
      
      // Remove the temporary user message on error
      setSessionDetail(prev => prev ? {
        ...prev,
        messages: prev.messages.filter(m => !m.id.startsWith('temp-'))
      } : null);
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  if (!selectedSession) {
    return (
      <div className="flex flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Bot className="mx-auto mb-4 w-16 h-16 text-gray-400" />
          <h2 className="mb-2 font-semibold text-gray-700 dark:text-gray-300 text-xl">
            Welcome to VoidBitz Chat
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Select a chat session or create a new one to start chatting
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <div className="text-center">
          <div className="mx-auto mb-4 border-b-2 border-blue-600 rounded-full w-8 h-8 animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full">      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-gray-200 dark:border-gray-700 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
              {selectedSession.title}
            </h1>
            {selectedSession.modelDeploymentName && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Model: {selectedSession.modelDeploymentName}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isWaitingForResponse ? (
                <span className="flex items-center gap-1">
                  <span className="bg-blue-500 rounded-full w-2 h-2 animate-pulse"></span>
                  AI is responding...
                </span>
              ) : (
                `${sessionDetail?.messageCount || 0} messages`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 mx-4 mt-4 p-4 border-red-400 border-l-4">
          <div className="flex items-center">
            <AlertCircle className="mr-3 w-5 h-5 text-red-400" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 space-y-4 p-4 overflow-y-auto">
        {sessionDetail?.messages.length === 0 ? (
          <div className="py-8 text-center">
            <Bot className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>        ) : (
          <>
            {sessionDetail?.messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
            {isWaitingForResponse && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading || isWaitingForResponse}
        placeholder="Type your message..."
      />
    </div>
  );
}
