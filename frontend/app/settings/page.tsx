'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TestTube, Settings, ArrowLeft } from 'lucide-react';
import { ModelDeploymentDialog } from '@/components/ModelDeploymentDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { TestConnectionDialog } from '@/components/TestConnectionDialog';
import { ModelDeploymentManagement } from '@/types/chat';
import Link from 'next/link';

export default function SettingsPage() {
  const [deployments, setDeployments] = useState<ModelDeploymentManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeployment, setSelectedDeployment] = useState<ModelDeploymentManagement | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [deploymentToDelete, setDeploymentToDelete] = useState<ModelDeploymentManagement | null>(null);
  const [deploymentToTest, setDeploymentToTest] = useState<ModelDeploymentManagement | null>(null);

  useEffect(() => {
    loadDeployments();
  }, []);
  const loadDeployments = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5027/api';
      const response = await fetch(`${baseUrl}/modeldeployment`);
      if (response.ok) {
        const data = await response.json();
        setDeployments(data);
      }
    } catch (error) {
      console.error('Failed to load deployments:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleAdd = () => {
    setSelectedDeployment(null);
    setShowDialog(true);
  };

  const handleEdit = (deployment: ModelDeploymentManagement) => {
    setSelectedDeployment(deployment);
    setShowDialog(true);
  };

  const handleDelete = (deployment: ModelDeploymentManagement) => {
    setDeploymentToDelete(deployment);
    setShowDeleteDialog(true);
  };

  const handleTest = (deployment: ModelDeploymentManagement) => {
    setDeploymentToTest(deployment);
    setShowTestDialog(true);
  };
  const confirmDelete = async () => {
    if (!deploymentToDelete) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5027/api';
      const response = await fetch(`${baseUrl}/modeldeployment/${deploymentToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadDeployments();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete deployment');
      }
    } catch (error) {
      console.error('Failed to delete deployment:', error);
      alert('Failed to delete deployment');
    } finally {
      setShowDeleteDialog(false);
      setDeploymentToDelete(null);
    }
  };

  const handleDialogSuccess = async () => {
    setShowDialog(false);
    setSelectedDeployment(null);
    await loadDeployments();
  };

  if (loading) {
    return (
      <div className="mx-auto px-4 py-8 container">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 py-8 max-w-6xl container">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Chat
            </Link>
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6" />
              <h1 className="font-bold text-2xl">Settings</h1>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                  Model Deployments
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Manage AI model deployments for chat sessions
                </p>
              </div>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Deployment
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {deployments.length === 0 ? (
                <div className="py-8 text-gray-500 dark:text-gray-400 text-center">
                  No model deployments configured. Add one to get started.
                </div>
              ) : (
                deployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="space-y-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {deployment.name}
                        </h3>
                        <div className="flex gap-1">
                          {deployment.isDefault && (
                            <span className="inline-flex items-center bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 rounded-full font-medium text-blue-800 dark:text-blue-200 text-xs">
                              Default
                            </span>
                          )}
                          {deployment.isActive ? (
                            <span className="inline-flex items-center bg-green-100 dark:bg-green-900 px-2.5 py-0.5 rounded-full font-medium text-green-800 dark:text-green-200 text-xs">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-full font-medium text-gray-800 dark:text-gray-200 text-xs">
                              Inactive
                            </span>
                          )}
                          {deployment.isReferencedByChats && (
                            <span className="inline-flex items-center bg-purple-100 dark:bg-purple-900 px-2.5 py-0.5 rounded-full font-medium text-purple-800 dark:text-purple-200 text-xs">
                              In Use
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTest(deployment)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-md text-gray-400 hover:text-blue-600 transition-colors"
                          title="Test Connection"
                        >
                          <TestTube className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(deployment)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-md text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(deployment)}
                          disabled={deployment.isReferencedByChats}
                          className="hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 p-2 rounded-md text-gray-400 hover:text-red-600 transition-colors disabled:cursor-not-allowed"
                          title={deployment.isReferencedByChats ? "Cannot delete - in use by existing chats" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      <div>Model: {deployment.modelType}</div>
                      <div>Deployment: {deployment.deploymentName}</div>
                      <div>Endpoint: {deployment.endpoint}</div>
                      {deployment.description && (
                        <div>Description: {deployment.description}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <ModelDeploymentDialog
          deployment={selectedDeployment}
          open={showDialog}
          onOpenChange={setShowDialog}
          onSuccess={handleDialogSuccess}
        />

        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={confirmDelete}
          title="Delete Model Deployment"
          description={`Are you sure you want to delete "${deploymentToDelete?.name}"? This action cannot be undone.`}
        />

        <TestConnectionDialog
          deployment={deploymentToTest}
          open={showTestDialog}
          onOpenChange={setShowTestDialog}
        />
      </div>
    </div>
  );
}
