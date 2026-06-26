"use client";

import { IConversation } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ConversationItem from "./ConversationItem";

interface ConversationListProps {
  conversations: IConversation[];
}

export default function ConversationList({
  conversations,
}: ConversationListProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <p className="text-lg text-slate-400 mb-2">No conversations yet</p>
          <p className="text-sm text-slate-500">
            Start a new conversation by searching for users above!
          </p>
        </div>
      ) : (
        conversations.map((conversation) => {
          const convId = conversation._id?.toString() || "";
          const isActive = pathname === `/chat/${convId}`;

          return (
            <ConversationItem
              key={convId}
              conversation={conversation}
              currentUserId={session?.user?.id || ""}
              isActive={isActive}
              onClick={() => router.push(`/chat/${convId}`)}
              mounted={mounted}
            />
          );
        })
      )}
    </div>
  );
}
