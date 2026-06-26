import { Types } from "mongoose";

export interface IUser {
  _id: string | Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  image?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
}

export interface IConversation {
  _id: string | Types.ObjectId;
  participants: IUser[];
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  lastMessage?: {
    text: string;
    sender: IUser;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id: string | Types.ObjectId;
  conversation: string | Types.ObjectId;
  sender: IUser;
  text: string;
  image?: string;
  readBy: IUser[];
  createdAt: Date;
  isTemp?: boolean;
}
