// src/types/types.ts
export interface MessageAttributes {
  content: string;
  sender: string;
  senderName: string;
  timestamp: string;
  messageId: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  tempMessageId?: string;
  status?: "sending" | "sent" | "error";
}

export interface Message {
  messageId: string | number;
  content: string;
  sender: string;
  senderName: string;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  tempMessageId?: string;
  status?: "sending" | "sent" | "error";
}

export interface CreateMessageData {
  content: string;
  sender: string;
  senderName: string;
  timestamp: string;
}

export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiError {
  status: number;
  name: string;
  message: string;
  details: Record<string, unknown>;
}

export interface ChatState {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping: () => void;
  isConnected: boolean;
}

export interface ChatMessageProps {
  message: MessageAttributes;
  isOwnMessage: boolean;
}

export interface DateSeparatorProps {
  date: string;
}
