"use client";

import { IMessage } from "@/types";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

interface MessageBubbleProps {
  message: IMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { data: session } = useSession();
  const isOwn = message.sender?._id?.toString() === session?.user?.id;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
          isOwn ? "bg-blue-600 rounded-tr-sm" : "bg-slate-700 rounded-tl-sm"
        }`}
      >
        <p className="text-white">{message.text}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-300">
            {mounted && message.createdAt && formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </span>
          {isOwn && (
            <span className="text-xs text-slate-300">
              {message.readBy?.length > 1 ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
