// frontend/components/Chat.tsx
"use client";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

let socket: Socket;

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Initialize socket connection
    socket = io("http://localhost:1337", {
      withCredentials: true,
    });

    // Handle incoming messages
    socket.on("message", (msg: string) => {
      setMessages((prevMessages) => [...prevMessages, msg]);

      // Save to localStorage
      localStorage.setItem("chatMessages", JSON.stringify([...messages, msg]));
    });

    // Load messages from localStorage
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    return () => {
      socket.disconnect();
    };
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div className="mt-4">
      <div className="border p-4 h-64 overflow-y-scroll">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="text-blue-500">User:</span> {msg}
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          className="border flex-1 p-2"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          className="bg-blue-500 text-white p-2 ml-2"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
