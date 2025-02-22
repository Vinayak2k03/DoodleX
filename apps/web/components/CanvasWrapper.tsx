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
      const data = JSON.parse(event.data);
      if (data.type === "join") {
        console.log("Successfully joined room:", data.roomId);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
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
