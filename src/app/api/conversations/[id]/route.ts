import connectToDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await Conversation.findById(params.id)
      .populate("participants", "-password")
      .populate("lastMessage.sender", "-password");

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (!conversation.participants.find((p: any) => p._id.toString() === session.user!.id)) {
      return NextResponse.json(
        { error: "Not a participant of this conversation" },
        { status: 403 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
