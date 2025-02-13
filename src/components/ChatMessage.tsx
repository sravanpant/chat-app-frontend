// components/ChatMessage.tsx
import { cn } from "@/lib/utils";
import { ChatMessageProps } from "@/types/types";
import { Check, Clock } from "lucide-react";

export default function ChatMessage({
  message,
  isOwnMessage,
}: ChatMessageProps) {
  return (
    <div className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] space-y-1",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl p-3 shadow-sm transition-all",
            isOwnMessage
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-white border rounded-bl-none"
          )}
        >
          <p className="text-sm">{message.content}</p>

          <div className="flex items-center justify-end space-x-2 mt-2">
            <span className="text-xs opacity-75">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isOwnMessage && (
              <span className="text-xs">
                {message.status === "sending" ? <Clock /> : <Check size={15} />}
              </span>
            )}
          </div>
        </div>

        {!isOwnMessage && (
          <span className="text-xs text-gray-500 font-medium">
            {message.senderName}
          </span>
        )}
      </div>
    </div>
  );
}
