import axios from 'axios';
import { ChatSession, ChatSessionDetail, ChatMessage, CreateSessionRequest, ChatMessageRequest, UpdateSessionRequest } from '@/types/chat';

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
}
