"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { socket } from "@/lib/socket";
import { api } from "@/lib/api";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import LoadingSpinner from "./LoadingSpinner";
import type { Message, ChatState } from "@/types/types";
import { MessageCircleCode } from "lucide-react";

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

  // Improved scroll handling
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, scrollToBottom]);

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
      console.log("Received new message:", message);
      setState((prev) => {
        // Check if message already exists
        if (prev.messages.some((msg) => msg.messageId === message.messageId)) {
          return prev;
        }
        return {
          ...prev,
          messages: [...prev.messages, message],
        };
      });
      scrollToBottom();
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
    socket.on("typing", onTyping);

    // Cleanup
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("newMessage", onNewMessage);
      socket.off("typing", onTyping);
    };
  }, [scrollToBottom]);

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    const messageData = {
      content: content.trim(),
      sender: user.id,
      senderName: user.fullName || "Anonymous",
      timestamp: new Date().toISOString(),
      messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };

    try {
      // Emit to socket server directly
      socket.emit("message", messageData);
    } catch (err) {
      console.error("Error sending message:", err);
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  };

  // Typing indicator handler
  const handleTyping = useCallback(() => {
    socket.emit("typing");
  }, []);

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
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {state.messages.map((message) => (
            <ChatMessage
              key={message.messageId}
              message={message}
              isOwnMessage={message.sender === user?.id}
            />
          ))}
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
