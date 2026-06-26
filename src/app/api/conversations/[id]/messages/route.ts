import connectToDB from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDB();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await Conversation.findById(params.id);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    if (!conversation.participants.includes(session.user!.id as any)) {
      return NextResponse.json(
        { error: "Not a participant of this conversation" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "-password")
      .populate("readBy", "-password");

    return NextResponse.json(messages.reverse());
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDB();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await Conversation.findById(params.id);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    if (!conversation.participants.includes(session.user!.id as any)) {
      return NextResponse.json(
        { error: "Not a participant of this conversation" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { text, image } = body;

    const newMessage = new Message({
      conversation: params.id,
      sender: session.user!.id,
      text,
      image,
      readBy: [session.user!.id],
    });

    await newMessage.save();
    await newMessage.populate("sender", "-password");

    await Conversation.findByIdAndUpdate(params.id, {
      lastMessage: {
        text: image ? "📷 Image" : text,
        sender: session.user!.id,
        timestamp: new Date(),
      },
    });

    const plainMessage = JSON.parse(JSON.stringify(newMessage));
    return NextResponse.json(plainMessage);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
