import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";

export const useSocket = () => {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      socketRef.current = getSocket();
      socketRef.current.emit("user_online", session.user.id);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [session?.user?.id]);

  return socketRef.current;
};
