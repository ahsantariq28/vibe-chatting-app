import { loadEnvConfig } from "@next/env";
const dev = process.env.NODE_ENV !== "production";
loadEnvConfig(process.cwd(), dev);

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const onlineUsers = new Map<string, string>();
const userSockets = new Map<string, string[]>();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("user_online", async (userId: string) => {
      onlineUsers.set(socket.id, userId);
      if (!userSockets.has(userId)) {
        userSockets.set(userId, []);
      }
      userSockets.get(userId)!.push(socket.id);

      try {
        const connectToDB = (await import("./src/lib/mongodb")).default;
        const User = (await import("./src/models/User")).default;
        await connectToDB();
        await User.findByIdAndUpdate(userId, { isOnline: true });
      } catch (err) {
        console.error("Failed to update user online status:", err);
      }

      io.emit("presence_update", { userId, isOnline: true });
    });

    socket.on("join_room", (conversationId: string) => {
      // Leave all rooms except the socket's own ID
      const roomsToLeave = Array.from(socket.rooms).filter(
        (room) => room !== socket.id,
      );
      roomsToLeave.forEach((room) => socket.leave(room));
      socket.join(conversationId);
      console.log(
        "User joined room:",
        conversationId,
        "Current rooms:",
        Array.from(socket.rooms),
      );
    });

    socket.on("send_message", (data) => {
      console.log("Received send_message event:", data);
      console.log("Emitting to room:", data.conversationId);
      io.to(data.conversationId).emit("new_message", data);
    });

    socket.on("typing_start", (data) => {
      socket.to(data.conversationId).emit("typing_start", data);
    });

    socket.on("typing_stop", (data) => {
      socket.to(data.conversationId).emit("typing_stop", data);
    });

    socket.on("mark_read", (data) => {
      io.to(data.conversationId).emit("read_receipt", data);
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);
      const userId = onlineUsers.get(socket.id);
      if (userId) {
        onlineUsers.delete(socket.id);
        const sockets = userSockets.get(userId);
        if (sockets) {
          const updatedSockets = sockets.filter((id) => id !== socket.id);
          userSockets.set(userId, updatedSockets);
          if (updatedSockets.length === 0) {
            userSockets.delete(userId);

            try {
              const connectToDB = (await import("./src/lib/mongodb")).default;
              const User = (await import("./src/models/User")).default;
              await connectToDB();
              await User.findByIdAndUpdate(userId, {
                isOnline: false,
                lastSeen: new Date(),
              });
            } catch (err) {
              console.error("Failed to update user offline status:", err);
            }

            io.emit("presence_update", { userId, isOnline: false });
          }
        }
      }
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
