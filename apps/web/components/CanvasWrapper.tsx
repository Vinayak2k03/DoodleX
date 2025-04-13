"use client";

import { useEffect } from "react";
import Canvas from "./Canvas";
import { useSocket } from "@/hooks/useSocket";

export default function CanvasWrapper({ roomId }: { roomId: string }) {
  const { socket, loading } = useSocket();

  useEffect(() => {
    if (!socket || loading) return;

    socket.send(
      JSON.stringify({
        type: "join",
        roomId,
      })
    );

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("CanvasWrapper received message:", data.type);
        
        if (data.type === "join") {
          console.log("Successfully joined room:", data.roomId);
        } else if (data.type === "shape_update") {
          console.log("Shape update received in wrapper");
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      console.log("Leaving room:", roomId);
      socket.removeEventListener("message", handleMessage);
      socket.send(
        JSON.stringify({
          type: "leave",
          roomId,
        })
      );
    };
  }, [socket, loading, roomId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!socket) {
    return <div>Connecting to server...</div>;
  }

  return <Canvas roomId={roomId} socket={socket}/>;
}
