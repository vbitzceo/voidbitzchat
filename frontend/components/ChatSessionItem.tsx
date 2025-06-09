'use client';

import { ChatSession } from '@/types/chat';
import { MessageSquare, Calendar, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ChatSessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

export default function ChatSessionItem({ 
  session, 
  isActive, 
  onSelect, 
  onDelete 
}: ChatSessionItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete(session.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const createdDate = new Date(session.createdAt).toLocaleDateString();
  const truncatedLastMessage = session.lastMessage?.slice(0, 50) + 
    (session.lastMessage && session.lastMessage.length > 50 ? '...' : '');

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors group relative ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-600'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      onClick={() => onSelect(session.id)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="flex-shrink-0 w-4 h-4 text-gray-500" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
              {session.title}
            </h3>
          </div>
          
          {truncatedLastMessage && (
            <p className="mb-2 text-gray-600 dark:text-gray-400 text-xs line-clamp-2">
              {truncatedLastMessage}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-gray-500 text-xs">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {createdDate}
            </div>
            <span>{session.messageCount} messages</span>
          </div>
        </div>

        {/* Delete button */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {showDeleteConfirm ? (
            <>
              <button
                onClick={handleDelete}
                className="hover:bg-red-100 p-1 rounded font-medium text-red-600 text-xs"
                title="Confirm delete"
              >
                Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="hover:bg-gray-100 p-1 rounded text-gray-600 text-xs"
                title="Cancel"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleDelete}
              className="hover:bg-red-50 p-1 rounded text-gray-400 hover:text-red-600"
              title="Delete session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
