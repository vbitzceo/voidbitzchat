'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ModelDeploymentManagement } from '@/types/chat';

interface ModelDeploymentDialogProps {
  deployment: ModelDeploymentManagement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ModelDeploymentDialog({ 
  deployment, 
  open, 
  onOpenChange, 
  onSuccess 
}: ModelDeploymentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    deploymentName: '',
    endpoint: '',
    apiKey: '',
    modelType: '',
    description: '',
    isActive: true,
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!deployment;

  useEffect(() => {
    if (deployment) {
      setFormData({
        name: deployment.name,
        deploymentName: deployment.deploymentName,
        endpoint: deployment.endpoint,
        apiKey: '', // Don't pre-populate API key for security
        modelType: deployment.modelType,
        description: deployment.description || '',
        isActive: deployment.isActive,
        isDefault: deployment.isDefault,
      });
    } else {
      setFormData({
        name: '',
        deploymentName: '',
        endpoint: '',
        apiKey: '',
        modelType: '',
        description: '',
        isActive: true,
        isDefault: false,
      });
    }
    setErrors({});
  }, [deployment]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.deploymentName.trim()) {
      newErrors.deploymentName = 'Deployment name is required';
    }
    if (!formData.endpoint.trim()) {
      newErrors.endpoint = 'Endpoint is required';
    }
    if (!formData.apiKey.trim() && !isEditing) {
      newErrors.apiKey = 'API key is required';
    }
    if (!formData.modelType.trim()) {
      newErrors.modelType = 'Model type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5027/api';
      const url = isEditing 
        ? `${baseUrl}/modeldeployment/${deployment.id}`
        : `${baseUrl}/modeldeployment`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload = {
        name: formData.name,
        deploymentName: formData.deploymentName,
        endpoint: formData.endpoint,
        modelType: formData.modelType,
        description: formData.description || null,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
        ...(formData.apiKey && { apiKey: formData.apiKey }) // Only include if provided
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save deployment');
      }
    } catch (error) {
      console.error('Failed to save deployment:', error);
      alert('Failed to save deployment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 shadow-xl mx-4 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-gray-200 dark:border-gray-700 border-b">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            {isEditing ? 'Edit Model Deployment' : 'Add Model Deployment'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="dark:bg-gray-700 shadow-sm px-3 py-2 border border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:text-gray-100"
                disabled={loading}
              />
              {errors.name && <p className="mt-1 text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="deploymentName" className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                Deployment Name *
              </label>
              <input
                type="text"
                id="deploymentName"
                value={formData.deploymentName}
                onChange={(e) => setFormData({ ...formData, deploymentName: e.target.value })}
                className="dark:bg-gray-700 shadow-sm px-3 py-2 border border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:text-gray-100"
                disabled={loading}
              />
              {errors.deploymentName && <p className="mt-1 text-red-500 text-xs">{errors.deploymentName}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="endpoint" className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
              Endpoint *
            </label>
            <input
              type="url"
              id="endpoint"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              placeholder="https://your-resource.openai.azure.com"
              className="dark:bg-gray-700 shadow-sm px-3 py-2 border border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:text-gray-100"
              disabled={loading}
            />
            {errors.endpoint && <p className="mt-1 text-red-500 text-xs">{errors.endpoint}</p>}
          </div>

          <div>
            <label htmlFor="apiKey" className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
              API Key {!isEditing && '*'}
            </label>
            <input
              type="password"
              id="apiKey"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder={isEditing ? "Leave blank to keep existing key" : "Enter API key"}
              className="dark:bg-gray-700 shadow-sm px-3 py-2 border border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:text-gray-100"
              disabled={loading}
            />
            {errors.apiKey && <p className="mt-1 text-red-500 text-xs">{errors.apiKey}</p>}
          </div>

          <div>
            <label htmlFor="modelType" className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
              Model Type *
            </label>
            <select
              id="modelType"
              value={formData.modelType}
              onChange={(e) => setFormData({ ...formData, modelType: e.target.value })}
              className="dark:bg-gray-700 shadow-sm px-3 py-2 border border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:text-gray-100"
              disabled={loading}
            >
              <option value="">Select a model type</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4">gpt-4</option>
              <option value="gpt-35-turbo">gpt-35-turbo</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
              <option value="phi-3">phi-3</option>
            </select>
            {errors.modelType && <p className="mt-1 text-red-500 text-xs">{errors.modelType}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="dark:bg-gray-700 shadow-sm px-3 py-2 border border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:text-gray-100"
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
                disabled={loading}
              />
              <label htmlFor="isActive" className="block ml-2 text-gray-700 dark:text-gray-300 text-sm">
                Active
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
                disabled={loading}
              />
              <label htmlFor="isDefault" className="block ml-2 text-gray-700 dark:text-gray-300 text-sm">
                Set as default model
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 dark:text-gray-300 text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-white text-sm disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
