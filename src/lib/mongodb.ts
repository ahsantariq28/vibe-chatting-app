import mongoose from "mongoose";

const MONGODB_URI = process.env.TEST_ENV === "true"
  ? "mongodb://localhost:27017/chatapp_test"
  : process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

const globalForMongoose = global as unknown as {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = { conn: null, promise: null };
}

async function connectToDB(): Promise<typeof mongoose> {
  console.log("Connecting to MongoDB URI:", MONGODB_URI);
  if (globalForMongoose.mongoose.conn) {
    return globalForMongoose.mongoose.conn;
  }

  if (!globalForMongoose.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    globalForMongoose.mongoose.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }
  globalForMongoose.mongoose.conn = await globalForMongoose.mongoose.promise;
  return globalForMongoose.mongoose.conn;
}

export default connectToDB;
