'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ModelDeployment } from '@/types/chat';
import { ChatApiService } from '@/lib/api';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string, modelDeploymentId?: string) => void;
  isLoading?: boolean;
}

export default function NewChatModal({ isOpen, onClose, onConfirm, isLoading = false }: NewChatModalProps) {
  const [title, setTitle] = useState('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [modelDeployments, setModelDeployments] = useState<ModelDeployment[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Load model deployments when modal opens
  useEffect(() => {
    if (isOpen) {
      loadModelDeployments();
    }
  }, [isOpen]);

  const loadModelDeployments = async () => {
    try {
      setLoadingModels(true);
      const deployments = await ChatApiService.getModelDeployments();
      setModelDeployments(deployments);
      
      // Set default model if available
      const defaultModel = deployments.find(d => d.isDefault);
      if (defaultModel) {
        setSelectedModelId(defaultModel.id);
      } else if (deployments.length > 0) {
        setSelectedModelId(deployments[0].id);
      }
    } catch (error) {
      console.error('Failed to load model deployments:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onConfirm(title.trim(), selectedModelId || undefined);
      setTitle('');
      setSelectedModelId('');
    }
  };

  const handleClose = () => {
    setTitle('');
    setSelectedModelId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 shadow-xl mx-4 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-gray-200 dark:border-gray-700 border-b">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            Name Your Chat
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="chat-title" className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              Chat Title
            </label>
            <input
              type="text"
              id="chat-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Planning Weekend Trip"
              className="dark:bg-gray-700 shadow-sm px-3 py-2 border border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:text-gray-100"
              maxLength={200}
              disabled={isLoading}
              autoFocus
            />
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Give your chat a descriptive name (max 200 characters)
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="model-select" className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              AI Model
            </label>
            {loadingModels ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <div className="border-b-2 border-blue-600 rounded-full w-4 h-4 animate-spin"></div>
                Loading models...
              </div>
            ) : (
              <select
                id="model-select"
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="dark:bg-gray-700 shadow-sm px-3 py-2 border border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:text-gray-100"
                disabled={isLoading || modelDeployments.length === 0}
              >
                {modelDeployments.length === 0 ? (
                  <option value="">No models available</option>
                ) : (
                  modelDeployments.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.modelType})
                      {model.isDefault ? ' - Default' : ''}
                    </option>
                  ))
                )}
              </select>
            )}
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Choose the AI model for this conversation
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
              disabled={!title.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
