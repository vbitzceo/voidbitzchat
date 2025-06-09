'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface RenameChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
  currentTitle: string;
  isLoading?: boolean;
}

export default function RenameChatModal({ isOpen, onClose, onConfirm, currentTitle, isLoading = false }: RenameChatModalProps) {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && title.trim() !== currentTitle) {
      onConfirm(title.trim());
    }
  };

  const handleClose = () => {
    setTitle(currentTitle);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 shadow-xl mx-4 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-gray-200 dark:border-gray-700 border-b">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            Rename Chat
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="chat-title" className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              Chat Title
            </label>
            <input
              type="text"
              id="chat-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter new chat title"
              className="dark:bg-gray-700 shadow-sm px-3 py-2 border border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:text-gray-100"
              maxLength={200}
              disabled={isLoading}
              autoFocus
            />
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Update the chat title (max 200 characters)
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 dark:text-gray-300 text-sm"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-white text-sm disabled:cursor-not-allowed"
              disabled={!title.trim() || title.trim() === currentTitle || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
