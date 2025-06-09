'use client';

import { useState } from 'react';
import { ChatSession } from '@/types/chat';
import ChatSidebar from '@/components/ChatSidebar';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSessionSelect = (session: ChatSession | null) => {
    setSelectedSession(session);
  };

  const handleSessionUpdate = () => {
    // Trigger refresh of sessions list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex bg-gray-100 dark:bg-gray-900 h-screen">
      <ChatSidebar
        selectedSessionId={selectedSession?.id || null}
        onSessionSelect={handleSessionSelect}
        onRefreshSessions={refreshTrigger}
      />
      <ChatInterface
        selectedSession={selectedSession}
        onSessionUpdate={handleSessionUpdate}
      />
    </div>
  );
}
