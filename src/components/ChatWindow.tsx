"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { socket } from "@/lib/socket";
import { api } from "@/lib/api";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import LoadingSpinner from "./LoadingSpinner";
import DateSeparator from "./DateSeparator";
import type { Message, ChatState } from "@/types/types";
import { MessageCircleCode } from "lucide-react";
import { useScrollManager } from "@/hooks/useScrollManager";

const formatDateForSeparator = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

export default function ChatWindow() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [state, setState] = useState<ChatState>({
    messages: [],
    isConnected: false,
    isLoading: true,
    error: null,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollRef = useScrollManager([state.messages], {
    behavior: state.isLoading ? "auto" : "smooth",
    threshold: 150,
  });

  
  // Message loading and socket setup
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await api.fetchMessages();
        setState((prev) => ({
          ...prev,
          messages: fetchedMessages,
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : String(err),
          isLoading: false,
        }));
      }
    };

    loadMessages();
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    function onConnect() {
      console.log("Socket connected:", socket.id);
      setState((prev) => ({ ...prev, isConnected: true }));
    }

    function onDisconnect() {
      console.log("Socket disconnected");
      setState((prev) => ({ ...prev, isConnected: false }));
    }

    function onNewMessage(message: Message) {
      // console.log("Received new message:", message);
      setState((prev) => {
        // Find the message either by its temporary ID or permanent ID
        const messageIndex = prev.messages.findIndex(
          msg => msg.messageId === message.tempMessageId || msg.messageId === message.messageId
        );

        const updatedMessages = [...prev.messages];

        if (messageIndex !== -1) {
          // Update existing message
          updatedMessages[messageIndex] = {
            ...message,
            status: "sent"
          };
        } else {
          // Add new message
          updatedMessages.push({
            ...message,
            status: "sent"
          });
        }

        return {
          ...prev,
          messages: updatedMessages,
          error: null
        };
      });
    }

    function onMessageError({ messageId, error }: { messageId: string; error: string }) {
      console.error("Message error:", messageId, error);
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.messageId === messageId
            ? { ...msg, status: "error" }
            : msg
        ),
        error
      }));
    }

    function onTyping() {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
    }

    // Set up event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("newMessage", onNewMessage);
    socket.on("messageError", onMessageError);
    socket.on("typing", onTyping);

    // Cleanup
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("newMessage", onNewMessage);
      socket.off("messageError", onMessageError);
      socket.off("typing", onTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = async (content: string) => {
    if (!user || !content.trim() || !state.isConnected) return;

    const tempMessageId = `temp_${Date.now()}`;
    const messageData = {
      messageId: tempMessageId,
      content: content.trim(),
      sender: user.id,
      senderName: user.fullName || "Anonymous",
      timestamp: new Date().toISOString(),
      status: "sending" as const
    };

    // Add message to state immediately with sending status
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, messageData],
      error: null
    }));

    try {
      socket.emit("message", messageData);
    } catch (err) {
      console.error("Error sending message:", err);
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.messageId === tempMessageId
            ? { ...msg, status: "error" }
            : msg
        ),
        error: err instanceof Error ? err.message : String(err)
      }));
    }
  };

  // Typing indicator handler
  const handleTyping = useCallback(() => {
    socket.emit("typing");
  }, []);

  const renderMessagesWithSeparators = () => {
    let currentDate = '';
    
    return state.messages.map((message) => {
      const messageDate = new Date(message.timestamp);
      const dateStr = messageDate.toDateString();
      let separator = null;
      
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        separator = (
          <DateSeparator 
            key={`date-${dateStr}`} 
            date={formatDateForSeparator(messageDate)} 
          />
        );
      }
      
      return (
        <React.Fragment key={`message-group-${message.messageId}`}>
          {separator}
          <ChatMessage
            message={{
              messageId: String(message.messageId),
              content: message.content,
              sender: message.sender,
              senderName: message.senderName,
              timestamp: message.timestamp
            }}
            isOwnMessage={message.sender === user?.id}
          />
        </React.Fragment>
      );
    });
  };

  if (!isUserLoaded) return <LoadingSpinner />;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-blue-600">
            <MessageCircleCode size={30} />
          </h1>
          <div className="flex gap-5">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">
                {state.isConnected ? "Online" : "Connecting..."}
              </span>
            </div>
            <UserButton />
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth"
        style={{ height: "calc(100vh - 144px)" }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {renderMessagesWithSeparators()}
          {isTyping && (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-pulse">...</div>
              <span>Someone is typing</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t p-4 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSendMessage={sendMessage}
            onTyping={handleTyping}
            isConnected={state.isConnected}
          />
        </div>
      </div>
    </div>
  );
}
