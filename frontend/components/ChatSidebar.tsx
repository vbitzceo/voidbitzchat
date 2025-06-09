'use client';

import { useState, useEffect } from 'react';
import { ChatSession } from '@/types/chat';
import { ChatApiService } from '@/lib/api';
import ChatSessionItem from './ChatSessionItem';
import NewChatModal from './NewChatModal';
import { Plus, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';

interface ChatSidebarProps {
  selectedSessionId: string | null;
  onSessionSelect: (session: ChatSession | null) => void;
  onRefreshSessions: number; // Used as a trigger to refresh
  onSessionUpdate?: (updatedSession: ChatSession) => void; // Called when a session is updated
}

export default function ChatSidebar({ 
  selectedSessionId, 
  onSessionSelect, 
  onRefreshSessions,
  onSessionUpdate 
}: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Load sessions on component mount and when refresh is triggered
  useEffect(() => {
    loadSessions();
  }, [onRefreshSessions]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sessionsData = await ChatApiService.getSessions();
      setSessions(sessionsData);
    } catch (error) {
      setError('Failed to load chat sessions');
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreateSession = async (title: string) => {
    try {
      setIsCreating(true);
      setError(null);
      
      const newSession = await ChatApiService.createSession({
        title
      });
      
      // Add new session to the beginning of the list
      setSessions(prev => [newSession, ...prev]);
      
      // Select the new session
      onSessionSelect(newSession);
      
      // Close modal
      setShowNewChatModal(false);
      
    } catch (error) {
      setError('Failed to create new chat session');
      console.error('Error creating session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      setError(null);
      await ChatApiService.deleteSession(sessionId);
      
      // Remove session from list
      setSessions(prev => prev.filter(s => s.id !== sessionId));
        // If deleted session was selected, clear selection
      if (selectedSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        const nextSession = remainingSessions.length > 0 ? remainingSessions[0] : null;
        onSessionSelect(nextSession);
      }
      
    } catch (error) {
      setError('Failed to delete chat session');
      console.error('Error deleting session:', error);
    }
  };
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      setError(null);
      const updatedSession = await ChatApiService.updateSession(sessionId, { title: newTitle });
      
      // Update session in list
      setSessions(prev => 
        prev.map(s => s.id === sessionId ? updatedSession : s)
      );
      
      // Notify parent about the session update
      onSessionUpdate?.(updatedSession);
      
    } catch (error) {
      setError('Failed to rename chat session');
      console.error('Error renaming session:', error);
      throw error; // Re-throw to handle in component
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-r w-80 h-full">
      {/* Header */}
      <div className="p-4 border-gray-200 dark:border-gray-700 border-b">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
              VoidBitz Chat
            </h1>
          </div>
        </div>
          <button
          onClick={() => setShowNewChatModal(true)}
          disabled={isCreating}
          className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg w-full text-white transition-colors disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Chat
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 border-red-200 dark:border-red-800 border-b">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <Loader2 className="mx-auto mb-2 w-6 h-6 text-gray-400 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Loading sessions...</p>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <MessageSquare className="mx-auto mb-4 w-12 h-12 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No chat sessions yet
            </p>
            <p className="mt-1 text-gray-400 dark:text-gray-500 text-xs">
              Create your first chat to get started
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">            {sessions.map((session) => (
              <ChatSessionItem
                key={session.id}
                session={session}
                isActive={session.id === selectedSessionId}
                onSelect={() => onSessionSelect(session)}
                onDelete={handleDeleteSession}
                onRename={handleRenameSession}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-gray-200 dark:border-gray-700 border-t">
        <p className="text-gray-500 dark:text-gray-400 text-xs text-center">
          Powered by Azure OpenAI & Semantic Kernel
        </p>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onConfirm={handleCreateSession}
        isLoading={isCreating}
      />
    </div>
  );
}
