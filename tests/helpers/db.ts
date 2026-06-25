import mongoose from "mongoose";
import User from "../../src/models/User";
import Conversation from "../../src/models/Conversation";
import Message from "../../src/models/Message";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp_test";

export async function clearDatabase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }

  // Explicitly clean collections using models to ensure they are registered and cleared
  await User.deleteMany({});
  await Conversation.deleteMany({});
  await Message.deleteMany({});
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
