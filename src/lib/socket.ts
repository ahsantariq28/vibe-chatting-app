import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
    socket = socketUrl ? io(socketUrl) : io();
  } else if (socket.disconnected) {
    socket.connect();
  }
  return socket;
};
