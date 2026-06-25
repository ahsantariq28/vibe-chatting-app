import connectToDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDB();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await Conversation.find({
      participants: { $in: [session.user!.id] },
    })
      .populate("participants", "-password")
      .populate("lastMessage.sender", "-password")
      .sort({ updatedAt: -1 });

    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDB();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { participantIds, isGroup, groupName } = body;

    if (!isGroup && participantIds.length !== 1) {
      return NextResponse.json(
        { error: "DM requires exactly one participant" },
        { status: 400 },
      );
    }

    const existingConversation = await Conversation.findOne({
      participants: {
        $all: [session.user.id, ...participantIds],
        $size: participantIds.length + 1,
      },
      isGroup: false,
    });

    if (existingConversation && !isGroup) {
      return NextResponse.json(existingConversation);
    }

    const newConversation = new Conversation({
      participants: [session.user!.id, ...participantIds],
      isGroup,
      groupName,
    });

    await newConversation.save();
    await newConversation.populate("participants", "-password");
    return NextResponse.json(newConversation);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
