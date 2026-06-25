"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface MessageInputProps {
  conversationId: string;
  onMessageSent: (text: string) => void;
}

export default function MessageInput({
  conversationId,
  onMessageSent,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const socket = useSocket();
  const { data: session } = useSession();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTypingStart = () => {
    if (socket && session?.user) {
      socket.emit("typing_start", {
        conversationId,
        userId: session.user.id,
        userName: session.user.name,
      });
    }
  };

  const handleTypingStop = () => {
    if (socket && session?.user) {
      socket.emit("typing_stop", {
        conversationId,
        userId: session.user.id,
        userName: session.user.name,
      });
    }
  };

  useEffect(() => {
    if (text) {
      handleTypingStart();
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(handleTypingStop, 2000);
    } else {
      handleTypingStop();
    }
    return () => clearTimeout(typingTimeoutRef.current);
  }, [text]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        if (socket) {
          socket.emit("send_message", { ...newMessage, conversationId });
        }
        onMessageSent(text.trim());
        setText("");
        handleTypingStop();
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-slate-800 border-t border-slate-700"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-full bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
        >
          Send
        </button>
      </div>
    </form>
  );
}
