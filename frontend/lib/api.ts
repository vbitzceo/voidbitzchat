import axios from 'axios';
import { 
  ChatSession, 
  ChatSessionDetail, 
  ChatMessage, 
  CreateSessionRequest, 
  ChatMessageRequest, 
  UpdateSessionRequest, 
  ModelDeployment,
  ModelDeploymentManagement,
  CreateModelDeploymentRequest,
  UpdateModelDeploymentRequest,
  TestConnectionResult
} from '@/types/chat';

// API base URL - should be configurable via environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5027/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow credentials for CORS
  withCredentials: true,
});

// API error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class ChatApiService {
  /**
   * Get all chat sessions for the current user
   */
  static async getSessions(): Promise<ChatSession[]> {
    try {
      const response = await apiClient.get<ChatSession[]>('/chat/sessions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      throw new Error('Failed to load chat sessions');
    }
  }

  /**
   * Get a specific chat session with all messages
   */
  static async getSession(sessionId: string): Promise<ChatSessionDetail> {
    try {
      const response = await apiClient.get<ChatSessionDetail>(`/chat/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch session:', error);
      throw new Error('Failed to load chat session');
    }
  }

  /**
   * Create a new chat session
   */
  static async createSession(request: CreateSessionRequest): Promise<ChatSession> {
    try {
      const response = await apiClient.post<ChatSession>('/chat/sessions', request);
      return response.data;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw new Error('Failed to create new chat session');
    }
  }

  /**
   * Send a message to a chat session and get AI response
   */
  static async sendMessage(request: ChatMessageRequest): Promise<ChatMessage> {
    try {
      const response = await apiClient.post<ChatMessage>(
        `/chat/sessions/${request.sessionId}/messages`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Delete a chat session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      await apiClient.delete(`/chat/sessions/${sessionId}`);
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw new Error('Failed to delete chat session');
    }
  }

  /**
   * Update a chat session title
   */
  static async updateSession(sessionId: string, request: UpdateSessionRequest): Promise<ChatSession> {
    try {
      const response = await apiClient.put<ChatSession>(`/chat/sessions/${sessionId}`, request);
      return response.data;
    } catch (error) {
      console.error('Failed to update session:', error);
      throw new Error('Failed to update chat session');
    }
  }
  /**
   * Check API health status
   */
  static async checkHealth(): Promise<{ status: string; timestamp: string; version: string }> {
    try {
      const response = await apiClient.get('/status');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('API is not responding');
    }
  }
  /**
   * Get available model deployments
   */
  static async getModelDeployments(): Promise<ModelDeployment[]> {
    try {
      const response = await apiClient.get<ModelDeployment[]>('/chat/model-deployments');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch model deployments:', error);
      throw new Error('Failed to load model deployments');
    }
  }
  /**
   * Get all model deployments for management (settings page)
   */
  static async getAllModelDeployments(): Promise<ModelDeploymentManagement[]> {
    try {
      const response = await apiClient.get<ModelDeploymentManagement[]>('/modeldeployment');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all model deployments:', error);
      throw new Error('Failed to load model deployments');
    }
  }

  /**
   * Create a new model deployment
   */
  static async createModelDeployment(deployment: CreateModelDeploymentRequest): Promise<ModelDeploymentManagement> {
    try {
      const response = await apiClient.post<ModelDeploymentManagement>('/modeldeployment', deployment);
      return response.data;
    } catch (error) {
      console.error('Failed to create model deployment:', error);
      throw new Error('Failed to create model deployment');
    }
  }

  /**
   * Update a model deployment
   */
  static async updateModelDeployment(id: string, deployment: UpdateModelDeploymentRequest): Promise<void> {
    try {
      await apiClient.put(`/modeldeployment/${id}`, deployment);
    } catch (error) {
      console.error('Failed to update model deployment:', error);
      throw new Error('Failed to update model deployment');
    }
  }

  /**
   * Delete a model deployment
   */
  static async deleteModelDeployment(id: string): Promise<void> {
    try {
      await apiClient.delete(`/modeldeployment/${id}`);
    } catch (error) {
      console.error('Failed to delete model deployment:', error);
      throw new Error('Failed to delete model deployment');
    }
  }

  /**
   * Test model deployment connection
   */
  static async testModelDeployment(id: string): Promise<TestConnectionResult> {
    try {
      const response = await apiClient.post<TestConnectionResult>(`/modeldeployment/${id}/test`);
      return response.data;
    } catch (error) {
      console.error('Failed to test model deployment:', error);
      throw new Error('Failed to test model deployment');
    }
  }
}
