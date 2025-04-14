"use client";

import { useEffect, useRef, useState } from "react";
import ActionBar from "./Actionbar";
import PromptBar from "./PromptBar";
import { Canvas, Tool } from "@/app/draw/Canvas";

// Define DrawingCommand types (you can alternatively import these from a shared types file)
type BaseDrawingCommand = {
  type: string;
  isAI?: boolean;
};

type CircleCommand = BaseDrawingCommand & {
  type: "circle";
  centerX: number;
  centerY: number;
  radius: number;
};

type RectCommand = BaseDrawingCommand & {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
};

type LineCommand = BaseDrawingCommand & {
  type: "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

type PencilCommand = BaseDrawingCommand & {
  type: "pencil";
  points: { x: number; y: number }[];
};

type DrawingCommand = CircleCommand | RectCommand | LineCommand | PencilCommand;


export default function CanvasRenderer({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("rect");
  const [canvas, setCanvas] = useState<Canvas>();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    canvas?.setTool(tool);
  }, [tool, canvas]);

  useEffect(() => {
    let c: Canvas;
    if (canvasRef.current) {
      c = new Canvas(canvasRef.current, roomId, socket);
      setCanvas(c);
    }

    const disableScroll = (e: Event) => e.preventDefault();

    document.body.style.overflow = "hidden";
    document.addEventListener("wheel", disableScroll, { passive: false });

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("wheel", disableScroll);
      c?.destroy();
    };
  }, [roomId, socket]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h") {
        setTool("pan");
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    const handleScaleChange = (newScale: number) => {
      setScale(newScale);
    };

    if (canvas) {
      canvas.onScaleChange = handleScaleChange;
    }
  }, [canvas]);

  const handleGenerateDrawing = (drawingCommands: any[]) => {
    if (!canvas) return;
    
    // Process the drawing commands from the AI
    drawingCommands.forEach(command => {
      if (command.type === "rect") {
        canvas.drawAIRect(command.x, command.y, command.width, command.height);
      } else if (command.type === "circle") {
        canvas.drawAICircle(command.centerX, command.centerY, command.radius);
      } else if (command.type === "line") {
        canvas.drawAILine(command.startX, command.startY, command.endX, command.endY);
      } else if (command.type === "pencil") {
        canvas.drawAIPencil(command.points);
      }
    });
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-screen h-screen"
      />
      <PromptBar onGenerateDrawing={handleGenerateDrawing} />
      <ActionBar
        tool={tool}
        setSelectedTool={setTool}
        onResetView={() => canvas?.resetView()}
        scale={scale}
      />
    </div>
  );
}