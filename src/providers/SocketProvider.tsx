"use client";

import React, { createContext, useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

export const SocketContext = createContext<Socket | null>(null);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketInstance = getSocket();
    socketInstance.emit("user_online", session.user.id);
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
