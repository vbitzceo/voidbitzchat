// Types for the chat application

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  tokenCount: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  modelDeploymentId?: string;
  modelDeploymentName?: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export interface CreateSessionRequest {
  title: string;
  modelDeploymentId?: string;
}

export interface UpdateSessionRequest {
  title: string;
}

export interface ChatMessageRequest {
  sessionId: string;
  message: string;
}

export interface ModelDeployment {
  id: string;
  name: string;
  modelType: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
