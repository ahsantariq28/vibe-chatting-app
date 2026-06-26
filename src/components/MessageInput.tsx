"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Loader from "./Loader";

interface MessageInputProps {
  conversationId: string;
  onMessageSent: (text: string, image?: string) => void;
}

export default function MessageInput({
  conversationId,
  onMessageSent,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxWidth = 600;
        const maxHeight = 600;

        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setImage(dataUrl);
        }
      };
      img.onerror = () => {
        toast.error("Failed to load image. Please select a valid image file.");
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      toast.error("Error reading file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), image }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        if (socket) {
          socket.emit("send_message", { ...newMessage, conversationId });
        }
        onMessageSent(text.trim(), image || undefined);
        setText("");
        setImage(null);
        handleTypingStop();
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 sm:p-4 bg-slate-800 border-t border-slate-700"
    >
      {image && (
        <div className="mb-3 inline-flex">
          <div className="relative">
            <img
              src={image}
              alt="Preview"
              className="max-h-40 sm:max-h-80 rounded-xl border border-slate-600"
            />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 w-10 h-10 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 sm:px-3 sm:py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-full transition-colors min-h-[44px] min-w-[44px]"
          title="Upload image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-full bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500 min-h-[44px] text-base"
        />
        <button
          type="submit"
          disabled={(!text.trim() && !image) || loading}
          className="p-3 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors flex items-center gap-2 min-h-[44px] min-w-[44px]"
        >
          {loading ? <Loader size="xs" color="white" /> : "Send"}
        </button>
      </div>
    </form>
  );
}
