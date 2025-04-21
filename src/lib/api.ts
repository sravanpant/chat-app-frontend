// frontend/src/lib/api.ts

import { Message, CreateMessageData, StrapiResponse } from "@/types/types";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "APIError";
  }
}

export const api = {
  async fetchMessages(): Promise<Message[]> {
    try {
      const response = await fetch(
        `${STRAPI_URL}/api/messages?sort=timestamp:asc`, // Add pagination parameter
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new APIError(`HTTP error! status: ${response.status}`);
      }

      const data: StrapiResponse<Message> = await response.json();
      return data.data.map((item) => item);
    } catch (error) {
      console.error("Error in fetchMessages:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : "Failed to fetch messages"
      );
    }
  },

  async createMessage(messageData: CreateMessageData): Promise<Message> {
    try {
      // Format the data according to Strapi's expectations
      const requestData = {
        data: {
          content: messageData.content,
          sender: messageData.sender,
          senderName: messageData.senderName,
          timestamp: messageData.timestamp,
          messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        },
      };

      console.log("Sending message data:", requestData);

      const response = await fetch(`${STRAPI_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new APIError(
          errorData.error?.message || "Failed to create message",
          response.status
        );
      }

      const result = await response.json();
      console.log("Create message response:", result);

      // Extract the message from Strapi's response format
      // Access properties directly on result.data without 'attributes'
      return {
        messageId: result.data.messageId,
        content: result.data.content,
        sender: result.data.sender,
        senderName: result.data.senderName,
        timestamp: result.data.timestamp,
        createdAt: result.data.createdAt,
        updatedAt: result.data.updatedAt,
        publishedAt: result.data.publishedAt,
      };
    } catch (error) {
      console.error("Error in createMessage:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : "Failed to create message"
      );
    }
  },
} as const;

export type API = typeof api;
