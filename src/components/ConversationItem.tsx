"use client";

import { IConversation } from "@/types";
import { usePresence } from "@/hooks/usePresence";
import PresenceIndicator from "./PresenceIndicator";

interface ConversationItemProps {
  conversation: IConversation;
  currentUserId: string;
  isActive: boolean;
  onClick: () => void;
  mounted: boolean;
}

export default function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  onClick,
  mounted,
}: ConversationItemProps) {
  const otherParticipant = conversation.participants.find(
    (p) => p?._id?.toString() !== currentUserId,
  );

  const { isOnline } = usePresence(
    otherParticipant?._id?.toString() || "",
    otherParticipant?.isOnline,
  );

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors ${
        isActive ? "bg-slate-700" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          {conversation.isGroup ? (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
              {conversation.groupName?.charAt(0)}
            </div>
          ) : otherParticipant?.image ? (
            <img
              src={otherParticipant.image}
              alt={otherParticipant.name}
              className="w-12 h-12 rounded-full object-cover border border-slate-600 shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
              {otherParticipant?.name?.charAt(0)}
            </div>
          )}
          {!conversation.isGroup && (
            <div className="absolute -bottom-1 -right-1">
              <PresenceIndicator isOnline={isOnline} size="sm" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-white truncate">
              {conversation.isGroup
                ? conversation.groupName
                : otherParticipant?.name}
            </h3>
            {conversation.lastMessage && (
              <span className="text-xs text-slate-400">
                {mounted &&
                  new Date(
                    conversation.lastMessage.timestamp,
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </span>
            )}
          </div>
          {conversation.lastMessage && (
            <p className="text-sm text-slate-400 truncate">
              {conversation.lastMessage.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
