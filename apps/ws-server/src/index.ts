import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

type User = {
  userId: string;
  ws: WebSocket;
  rooms: number[];
};

const users: User[] = [];

const wss = new WebSocketServer({ port: 8080 });

function checkUser(token: string): string | null {
  const decodedToken = jwt.verify(token, JWT_SECRET);
  if (typeof decodedToken === "string") {
    return null;
  }

  if (!decodedToken || !decodedToken.userId) {
    return null;
  }

  return decodedToken.userId;
}

wss.on("connection", (ws, request) => {
  console.log("New WebSocket connection attempt from:", request.socket.remoteAddress);
  const url = request.url;
  if (!url) {
    console.log("No URL in request");
    return ws.close();
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  if (!token) {
    console.log("No token provided");
    return ws.close();
  }

  console.log("Attempting to verify token");
  const userId = checkUser(token);
  if (!userId) {
    console.log("Invalid token");
    return ws.close();
  }

  console.log("User authenticated:", userId);
  users.push({
    userId,
    ws,
    rooms: [],
  });

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message as unknown as string);
      console.log("Received message:", data); // Debug log

      if (data.type === "join") {
        const roomId = Number(data.roomId);
        if (isNaN(roomId)) {
          console.log("Invalid roomId:", data.roomId);
          return ws.close();
        }

        console.log("Joining room:", roomId);
        const user = users.find((user) => user.userId === userId);

        if (!user) {
          console.log("User not found:", userId);
          return ws.close();
        }

        if (!user.rooms.includes(roomId)) {
          user.rooms.push(roomId);
        }

        console.log("User rooms after join:", user.rooms);
        ws.send(
          JSON.stringify({
            type: "join",
            roomId,
          })
        );
        return;
      }

      // Ensure shape_update is handled separately
      if (data.type === "shape_update") {
        const roomId = Number(data.roomId);
        if (!roomId) {
          return;
        }

        // Check if the user is in the room
        const userRoom = users.find(
          (user) => user.userId === userId && user.rooms.includes(roomId)
        );

        if (!userRoom) {
          return;
        }

        // Save to the database
        await prismaClient.chat.create({
          data: {
            roomId,
            userId,
            message: data.message,
          },
        });

        // Broadcast to all users in the room
        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(
              JSON.stringify({
                type: "shape_update",
                message: data.message,
                roomId,
                userId,
              })
            );
          }
        });
      }

      if (data.type === "leave") {
        const roomId = Number(data.roomId);
        if (!roomId) {
          return;
        }

        const user = users.find((user) => user.userId === userId);
        if (!user) {
          return;
        }

        user.rooms = user.rooms.filter((id) => id !== roomId);

        ws.send(
          JSON.stringify({
            type: "leave",
            roomId,
          })
        );
      }

      if (data.type === "chat") {
        const roomId = Number(data.roomId);
        const message = data.message;

        if (!roomId || !message) {
          return;
        }

        await prismaClient.chat.create({
          data: {
            roomId,
            userId,
            message,
          },
        });

        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(
              JSON.stringify({
                type: "chat",
                message,
                roomId,
              })
            );
          }
        });
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });

  ws.on("close", () => {
    const index = users.findIndex((user) => user.userId === userId);
    if (index !== -1) {
      users.splice(index, 1);
    }
  });
});
