"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@repo/ui/hooks/use-toast";

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

type DrawingCommand = CircleCommand | RectCommand | LineCommand;

interface PromptBarProps {
  onGenerateDrawing: (drawingCommands: DrawingCommand[]) => void;
}

export default function PromptBar({ onGenerateDrawing }: PromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateDrawing = async () => {
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);

      // Call your API endpoint that uses Gemini
      const response = await fetch("/api/generate-drawing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        console.log(response);
        throw new Error(`Failed to generate drawing: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      onGenerateDrawing(data.drawingCommands);
      setPrompt("");

      toast({
        title: "Drawing generated!",
        description: "Your drawing has been created based on the prompt.",
      });
    } catch (error) {
      console.error("Error generating drawing:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate drawing",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-md rounded-lg border border-border/40 shadow-lg p-2 w-full max-w-md">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="pl-9 pr-3 py-2 bg-background/50 focus:bg-background/70 transition-colors"
            placeholder="Describe what you want to draw..."
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerateDrawing();
              }
            }}
          />
        </div>
        <Button
          onClick={handleGenerateDrawing}
          disabled={isGenerating || !prompt.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              <span>Generate</span>
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1 text-center">
        Press Enter to generate
      </p>
    </div>
  );
}
