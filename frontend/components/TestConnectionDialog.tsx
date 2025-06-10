'use client';

import { useState } from 'react';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ModelDeploymentManagement, TestConnectionResult } from '@/types/chat';

interface TestConnectionDialogProps {
  deployment: ModelDeploymentManagement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestConnectionDialog({ 
  deployment, 
  open, 
  onOpenChange 
}: TestConnectionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestConnectionResult | null>(null);

  const handleClose = () => {
    setResult(null);
    onOpenChange(false);
  };

  const handleTest = async () => {
    if (!deployment) return;

    setLoading(true);
    setResult(null);    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5027/api';
      const response = await fetch(`${baseUrl}/modeldeployment/${deployment.id}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        const testResult = await response.json();
        setResult(testResult);
      } else {
        setResult({
          isSuccessful: false,
          message: 'Failed to test connection'
        });
      }
    } catch (error) {
      console.error('Failed to test connection:', error);
      setResult({
        isSuccessful: false,
        message: 'Network error occurred while testing connection'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open || !deployment) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 shadow-xl mx-4 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-gray-200 dark:border-gray-700 border-b">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            Test Connection
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
              {deployment.name}
            </h3>
            <div className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
              <div>Model: {deployment.modelType}</div>
              <div>Deployment: {deployment.deploymentName}</div>
              <div className="truncate">Endpoint: {deployment.endpoint}</div>
            </div>
          </div>

          {result && (
            <div className={`mb-4 p-4 rounded-lg ${
              result.isSuccessful 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {result.isSuccessful ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    result.isSuccessful ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {result.isSuccessful ? 'Connection Successful' : 'Connection Failed'}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    result.isSuccessful ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {result.message}
                  </p>
                  {result.responseTime && (
                    <p className="mt-1 text-green-600 dark:text-green-400 text-xs">
                      Response time: {result.responseTime}ms
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 dark:text-gray-300 text-sm"
            >
              Close
            </button>
            <button
              onClick={handleTest}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-white text-sm disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
