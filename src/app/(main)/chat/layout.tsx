import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import connectToDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import SocketProvider from "@/providers/SocketProvider";
import ResponsiveChatLayout from "@/components/ResponsiveChatLayout";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  await connectToDB();
  const conversations = await Conversation.find({
    participants: { $in: [session.user!.id] },
  })
    .populate("participants", "-password")
    .populate("lastMessage.sender", "-password")
    .sort({ updatedAt: -1 })
    .lean();

  const plainConversations = JSON.parse(JSON.stringify(conversations));

  return (
    <SocketProvider>
      <ResponsiveChatLayout conversations={plainConversations as any}>
        {children}
      </ResponsiveChatLayout>
    </SocketProvider>
  );
}
