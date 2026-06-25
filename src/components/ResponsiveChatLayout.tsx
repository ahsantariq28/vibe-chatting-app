"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface ResponsiveChatLayoutProps {
  conversations: any[];
  children: React.ReactNode;
}

export default function ResponsiveChatLayout({
  conversations,
  children,
}: ResponsiveChatLayoutProps) {
  const pathname = usePathname();
  const isChatRoom = pathname.startsWith("/chat/") && pathname !== "/chat";

  return (
    <div className="flex h-screen overflow-hidden w-full">
      {/* Sidebar - Hidden on mobile if viewing a specific chat room */}
      <div
        className={`w-full md:w-80 md:block ${
          isChatRoom ? "hidden" : "block"
        }`}
      >
        <Sidebar conversations={conversations} />
      </div>

      {/* Main content pane (ChatWindow / Welcome) - Hidden on mobile if viewing the chat list */}
      <div
        className={`flex-1 flex flex-col bg-slate-900 overflow-hidden md:flex ${
          isChatRoom ? "flex" : "hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
