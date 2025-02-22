"use client"

import { useRef, useState } from "react";
import ActionBar from "./Actionbar";
import { Canvas } from "@/app/draw/Canvas";

export default function CanvasRenderer({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool,setTool]=useState('rect');
  const [canvas,setCanvas]=useState<Canvas>();
  const [scale,setScale]=useState(1);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-screen h-screen"
      />
      {/* <ActionBar tool={tool} setSelectedTool={setTool} onResetView={()=>canvas?.resetView()} scale={scale}/> */}
    </div>
  );
}
