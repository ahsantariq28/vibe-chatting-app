import { auth } from "@/lib/auth";
import connectToDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
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

  const conversation = await Conversation.findById(params.conversationId)
    .populate("participants", "-password")
    .lean();

  const messages = await Message.find({ conversation: params.conversationId })
    .sort({ createdAt: 1 })
    .populate("sender", "-password")
    .populate("readBy", "-password")
    .lean();

  const plainConversation = JSON.parse(JSON.stringify(conversation));
  const plainMessages = JSON.parse(JSON.stringify(messages));

  return (
    <ChatWindow
      conversation={plainConversation as any}
      initialMessages={plainMessages as any}
    />
  );
}
