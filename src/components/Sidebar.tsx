"use client";

import { useState } from "react";
import { IConversation } from "@/types";
import UserSearch from "./UserSearch";
import ConversationList from "./ConversationList";
import { signOut, useSession } from "next-auth/react";
import EditProfileModal from "./EditProfileModal";

interface SidebarProps {
  conversations: IConversation[];
}

export default function Sidebar({ conversations }: SidebarProps) {
  const { data: session } = useSession();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="w-full md:w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-screen">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white">Vibe Chat</h1>
      </div>
      <UserSearch onUserSelect={() => {}} />
      <ConversationList conversations={conversations} />

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="relative cursor-pointer select-none" 
            onClick={() => setIsSettingsOpen(true)}
            title="Edit Profile"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "Me"}
                className="w-10 h-10 rounded-full object-cover border border-slate-600 hover:opacity-80 transition-opacity"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold hover:opacity-80 transition-opacity">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 
              className="text-sm font-semibold text-white truncate cursor-pointer hover:underline"
              onClick={() => setIsSettingsOpen(true)}
            >
              {session?.user?.name || "User"}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Edit Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={() => signOut()}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <EditProfileModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
