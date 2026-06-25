import { auth } from "@/lib/auth";
import connectToDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const session = await auth();
  if (!session) {
    return null;
  }

  await connectToDB();

  const conversations = await Conversation.find({
    participants: { $in: [session.user!.id] },
  })
    .populate("participants", "-password")
    .populate("lastMessage.sender", "-password")
    .sort({ updatedAt: -1 })
    .lean();

  const conversation = await Conversation.findById(params.conversationId)
    .populate("participants", "-password")
    .lean();

  const messages = await Message.find({ conversation: params.conversationId })
    .sort({ createdAt: 1 })
    .populate("sender", "-password")
    .populate("readBy", "-password")
    .lean();

  const plainConversations = JSON.parse(JSON.stringify(conversations));
  const plainConversation = JSON.parse(JSON.stringify(conversation));
  const plainMessages = JSON.parse(JSON.stringify(messages));

  return (
    <div className="flex h-screen">
      <Sidebar conversations={plainConversations as any} />
      <ChatWindow
        conversation={plainConversation as any}
        initialMessages={plainMessages as any}
      />
    </div>
  );
}
