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

const PORT = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({ port: PORT });

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
  const url = request.url;
  if (!url) {
    return ws.close();
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  if (!token) {
    console.log("No token provided");
    return ws.close();
  }

  const userId = checkUser(token);
  if (!userId) {
    console.log("Invalid token");
    return ws.close();
  }

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
          console.error("Invalid roomId:", data.roomId);
          return;
        }

        // Log the message for debugging
        console.log(
          `Received shape update for room ${roomId} from user ${userId}`
        );

        try {
          // Save to the database
          await prismaClient.chat.create({
            data: {
              roomId,
              userId,
              message: data.message,
            },
          });

          // Broadcast to ALL users in the room
          let broadcastCount = 0;
          users.forEach((user) => {
            user.ws.send(
              JSON.stringify({
                type: "shape_update",
                userId: user.userId === userId ? "self" : userId, // Mark as 'self' if sending back to originator
                message: data.message,
                roomId: roomId,
              })
            );
          });

          console.log(
            `Broadcasted shape to ${broadcastCount} users in room ${roomId}`
          );
        } catch (error) {
          console.error("Error handling shape update:", error);
        }
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
