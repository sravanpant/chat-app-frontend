// src/lib/socket.ts
import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"],
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});
