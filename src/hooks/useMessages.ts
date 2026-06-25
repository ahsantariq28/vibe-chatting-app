import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import { IMessage } from "@/types";
import { useSession } from "next-auth/react";

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socket = useSocket();
  const { data: session } = useSession();

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("join_room", conversationId);

    const handleNewMessage = (message: IMessage) => {
      console.log("Received new_message event:", message);
      const msgConvId =
        typeof message.conversation === "string"
          ? message.conversation
          : message.conversation.toString();
      const isOwnMessage = (message.sender as any)?._id?.toString() === session?.user?.id;
      if (msgConvId === conversationId && !isOwnMessage) {
        console.log("Message matches conversation ID, adding to state");
        setMessages((prev) => {
          // Check if real message is already in the array
          const exists = prev.some((m) => m._id?.toString() === message._id?.toString());
          if (exists) return prev;
          return [...prev, message];
        });
      } else if (isOwnMessage) {
        // If it's our own message, just remove any temp messages and keep the real one
        setMessages((prev) => {
          const filtered = prev.filter((m) => !(m as any).isTemp);
          const exists = filtered.some((m) => m._id?.toString() === message._id?.toString());
          if (exists) return filtered;
          return [...filtered, message];
        });
      }
    };

    const handleTypingStart = (data: {
      conversationId: string;
      userId: string;
      userName: string;
    }) => {
      if (
        data.conversationId === conversationId &&
        data.userId !== session?.user?.id
      ) {
        setTypingUsers((prev) => [...new Set([...prev, data.userName])]);
      }
    };

    const handleTypingStop = (data: {
      conversationId: string;
      userId: string;
      userName: string;
    }) => {
      if (
        data.conversationId === conversationId &&
        data.userId !== session?.user?.id
      ) {
        setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
      }
    };

    const handleReadReceipt = (data: {
      conversationId: string;
      messageId: string;
      userId: string;
    }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, readBy: [...msg.readBy, { _id: data.userId } as any] }
              : msg,
          ),
        );
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing_start", handleTypingStart);
    socket.on("typing_stop", handleTypingStop);
    socket.on("read_receipt", handleReadReceipt);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing_start", handleTypingStart);
      socket.off("typing_stop", handleTypingStop);
      socket.off("read_receipt", handleReadReceipt);
    };
  }, [socket, conversationId, session?.user?.id]);

  return { messages, setMessages, typingUsers };
};
