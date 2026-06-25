import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";

export const usePresence = (userId: string, initialIsOnline = false) => {
  const [isOnline, setIsOnline] = useState(initialIsOnline);
  const socket = useSocket();

  useEffect(() => {
    setIsOnline(initialIsOnline);
  }, [initialIsOnline]);

  useEffect(() => {
    if (!socket) return;

    const handlePresenceUpdate = (data: { userId: string; isOnline: boolean }) => {
      if (data.userId === userId) {
        setIsOnline(data.isOnline);
      }
    };

    socket.on("presence_update", handlePresenceUpdate);
    return () => {
      socket.off("presence_update", handlePresenceUpdate);
    };
  }, [socket, userId]);

  return { isOnline };
};
