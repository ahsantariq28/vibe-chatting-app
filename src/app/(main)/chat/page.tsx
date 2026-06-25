import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import connectToDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Sidebar from "@/components/Sidebar";

export default async function ChatPage() {
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

  if (conversations.length > 0) {
    redirect(`/chat/${conversations[0]._id}`);
  }

  return (
    <div className="flex h-screen">
      <Sidebar conversations={plainConversations as any} />
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome to Vibe Chat!
          </h2>
          <p className="text-slate-400">
            Search for a user to start a conversation
          </p>
        </div>
      </div>
    </div>
  );
}
