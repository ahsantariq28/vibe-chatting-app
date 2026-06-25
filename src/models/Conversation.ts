import mongoose, { Schema, Document } from "mongoose";
import { IConversation } from "../types";

type IConversationDocument = Document & Omit<IConversation, "_id">;

const ConversationSchema: Schema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
    },
    groupImage: {
      type: String,
    },
    lastMessage: {
      text: String,
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      timestamp: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Conversation ||
  mongoose.model<IConversationDocument>("Conversation", ConversationSchema);
