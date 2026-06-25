"use client";

import { useEffect, useRef } from "react";
import { IConversation, IMessage } from "@/types";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useMessages } from "@/hooks/useMessages";
import PresenceIndicator from "./PresenceIndicator";
import { usePresence } from "@/hooks/usePresence";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ChatWindowProps {
  conversation: IConversation;
  initialMessages: IMessage[];
}

export default function ChatWindow({
  conversation,
  initialMessages,
}: ChatWindowProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const conversationId = conversation._id.toString();
  const { messages, setMessages, typingUsers } = useMessages(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant = conversation.participants.find(
    (p) => p._id.toString() !== session?.user?.id,
  );
  const { isOnline } = usePresence(
    otherParticipant?._id.toString() || "",
    otherParticipant?.isOnline,
  );

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleMessageSent = (text: string) => {
    // Optimistic update: create a temporary message and add it to the state
    if (session?.user) {
      const tempMessage: any = {
        _id: "temp-" + Date.now().toString(), // Temporary ID with prefix
        text,
        sender: session.user,
        conversation: conversationId,
        readBy: [session.user],
        createdAt: new Date(),
        isTemp: true, // Mark as temporary
      };
      setMessages((prev) => [...prev, tempMessage]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-900">
      <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center gap-3">
        <button
          onClick={() => router.push("/chat")}
          className="p-1.5 text-slate-400 hover:text-white md:hidden transition-colors rounded-lg hover:bg-slate-700 mr-1"
          title="Back to conversations"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <div className="relative">
          {conversation.isGroup ? (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {conversation.groupName?.charAt(0)}
            </div>
          ) : otherParticipant?.image ? (
            <img
              src={otherParticipant.image}
              alt={otherParticipant.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-600 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {otherParticipant?.name?.charAt(0)}
            </div>
          )}
          {!conversation.isGroup && (
            <div className="absolute -bottom-1 -right-1">
              <PresenceIndicator isOnline={isOnline} size="sm" />
            </div>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-white">
            {conversation.isGroup
              ? conversation.groupName
              : otherParticipant?.name}
          </h2>
          {!conversation.isGroup && (
            <p className="text-xs text-slate-400">
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble key={message._id.toString()} message={message} />
        ))}
        {typingUsers.length > 0 && (
          <div className="flex justify-start mb-4">
            <div className="bg-slate-700 px-4 py-2 rounded-2xl rounded-tl-sm">
              <p className="text-sm text-slate-300">
                {typingUsers.join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        conversationId={conversationId}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
}
