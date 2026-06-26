import connectToDB from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDB();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = await Message.findById(params.id);
    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 },
      );
    }

    // Check if user is the sender
    if (message.sender.toString() !== session.user!.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this message" },
        { status: 403 },
      );
    }

    const conversationId = message.conversation;
    await Message.findByIdAndDelete(params.id);

    // Find the second-to-last message to update the conversation's lastMessage
    const secondLastMessage = await Message.findOne({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .populate("sender", "-password");

    if (secondLastMessage) {
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          text: secondLastMessage.image ? "📷 Image" : secondLastMessage.text,
          sender: secondLastMessage.sender,
          timestamp: secondLastMessage.createdAt,
        },
      });
    } else {
      // No more messages, clear lastMessage
      await Conversation.findByIdAndUpdate(conversationId, {
        $unset: { lastMessage: "" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
