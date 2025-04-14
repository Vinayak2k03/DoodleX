import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";

// Define types for drawing commands
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

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Process prompt to drawing commands
async function promptToDrawingCommands(prompt: string): Promise<DrawingCommand[]> {
  try {
    console.log(`Generating drawing for prompt: "${prompt}"`);
    
    // Canvas dimensions for reference
    const canvasWidth = 1920;
    const canvasHeight = 900;
    
    // System prompt to guide the AI
    const systemPrompt = `You are an AI that converts text descriptions into drawing commands. 
Create a list of simple drawing commands (circles, rectangles, lines) that represent the described scene or object.

You must respond with a valid JSON array of drawing commands. Each command should be one of:
1. Circle: { "type": "circle", "centerX": number, "centerY": number, "radius": number }
2. Rectangle: { "type": "rect", "x": number, "y": number, "width": number, "height": number }
3. Line: { "type": "line", "startX": number, "startY": number, "endX": number, "endY": number }

The canvas is ${canvasWidth}x${canvasHeight} pixels. Position (0,0) is the top-left corner.

POSITIONAL GUIDELINES:
- "top-left" refers to the area near (100, 100)
- "top-right" refers to the area near (${canvasWidth - 100}, 100)
- "bottom-left" refers to the area near (100, ${canvasHeight - 100})
- "bottom-right" refers to the area near (${canvasWidth - 100}, ${canvasHeight - 100})
- "center" refers to the area near (${canvasWidth/2}, ${canvasHeight/2})
- "top" refers to the area near (${canvasWidth/2}, 100)
- "bottom" refers to the area near (${canvasWidth/2}, ${canvasHeight - 100})
- "left" refers to the area near (100, ${canvasHeight/2})
- "right" refers to the area near (${canvasWidth - 100}, ${canvasHeight/2})

Pay careful attention to positional words in the prompt and place shapes accordingly.
Create a simple but recognizable representation using 5-15 shapes.
ONLY respond with the JSON array, no other text.`;

    // Use Gemini to generate the drawing
    const result: GenerateContentResult = await model.generateContent([
      { text: systemPrompt },
      { text: `Create drawing commands for: ${prompt}` }
    ]);
    
    const response = result.response;
    const text = response.text();
    
    // Try to extract valid JSON from the response
    try {
      // First attempt: Direct parsing
      let drawingCommands: unknown = JSON.parse(text);
      
      // Normalize: If not array, look for array property
      if (!Array.isArray(drawingCommands)) {
        const commandsObj = drawingCommands as Record<string, unknown>;
        drawingCommands = commandsObj.commands || 
                          commandsObj.shapes || 
                          commandsObj.drawings || 
                          commandsObj.result;
                          
        if (!Array.isArray(drawingCommands)) {
          throw new Error("Response is not in expected format");
        }
      }
      
      // Validate each command
      const validatedCommands = drawingCommands.filter((cmd: unknown): cmd is DrawingCommand => {
        const typedCmd = cmd as Partial<DrawingCommand>;
        if (!typedCmd || !typedCmd.type) return false;
        
        switch (typedCmd.type.toLowerCase()) {
          case "circle":
            return (
              typeof (typedCmd as Partial<CircleCommand>).centerX === 'number' && 
              typeof (typedCmd as Partial<CircleCommand>).centerY === 'number' && 
              typeof (typedCmd as Partial<CircleCommand>).radius === 'number' && 
              (typedCmd as Partial<CircleCommand>).radius! > 0
            );
          case "rect":
          case "rectangle":
            typedCmd.type = "rect"; // Normalize type
            return (
              typeof (typedCmd as Partial<RectCommand>).x === 'number' && 
              typeof (typedCmd as Partial<RectCommand>).y === 'number' && 
              typeof (typedCmd as Partial<RectCommand>).width === 'number' && 
              typeof (typedCmd as Partial<RectCommand>).height === 'number' && 
              (typedCmd as Partial<RectCommand>).width! > 0 && 
              (typedCmd as Partial<RectCommand>).height! > 0
            );
          case "line":
            return (
              typeof (typedCmd as Partial<LineCommand>).startX === 'number' && 
              typeof (typedCmd as Partial<LineCommand>).startY === 'number' && 
              typeof (typedCmd as Partial<LineCommand>).endX === 'number' && 
              typeof (typedCmd as Partial<LineCommand>).endY === 'number'
            );
          default:
            return false;
        }
      });
      
      if (validatedCommands.length === 0) {
        throw new Error("No valid drawing commands found");
      }
      
      // Mark all commands as AI-generated
      validatedCommands.forEach(cmd => {
        cmd.isAI = true;
      });
      
      return validatedCommands;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response:", text);
      
      // Try regex extraction if direct parsing fails
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          const parsedCommands = JSON.parse(jsonMatch[0]) as unknown[];
          // Mark all commands as AI-generated
          const typedCommands = parsedCommands.filter((cmd: unknown): cmd is DrawingCommand => {
            const typedCmd = cmd as Partial<DrawingCommand>;
            return !!typedCmd && typeof typedCmd.type === 'string';
          });
          
          typedCommands.forEach((cmd) => {
            cmd.isAI = true;
          });
          return typedCommands;
        } catch (_parseError) { // Renamed 'e' to '_parseError'
          console.error("Failed to extract JSON with regex");
        }
      }
      
      // If all parsing attempts fail, use fallback
      return fallbackDrawing(prompt, canvasWidth, canvasHeight);
    }
  } catch (error) {
    console.error("Error in promptToDrawingCommands:", error);
    // Fix: Ensure canvasWidth and canvasHeight are defined here
    return fallbackDrawing(prompt, 800, 600);
  }
}

// Helper function to determine position from prompt
function getPositionFromPrompt(prompt: string, canvasWidth: number, canvasHeight: number): { x: number, y: number } {
  // Default position (center of canvas)
  const defaultPosition = { x: canvasWidth / 2, y: canvasHeight / 2 };
  
  // Check for positional keywords
  if (prompt.includes("top") || prompt.includes("upper")) {
    if (prompt.includes("left")) {
      return { x: 100, y: 100 }; // Top-left
    } else if (prompt.includes("right")) {
      return { x: canvasWidth - 100, y: 100 }; // Top-right
    } else {
      return { x: canvasWidth / 2, y: 100 }; // Top-center
    }
  } else if (prompt.includes("bottom") || prompt.includes("lower")) {
    if (prompt.includes("left")) {
      return { x: 100, y: canvasHeight - 100 }; // Bottom-left
    } else if (prompt.includes("right")) {
      return { x: canvasWidth - 100, y: canvasHeight - 100 }; // Bottom-right
    } else {
      return { x: canvasWidth / 2, y: canvasHeight - 100 }; // Bottom-center
    }
  } else if (prompt.includes("left")) {
    return { x: 100, y: canvasHeight / 2 }; // Left-center
  } else if (prompt.includes("right")) {
    return { x: canvasWidth - 100, y: canvasHeight / 2 }; // Right-center
  }
  
  return defaultPosition;
}

// Fallback function for when AI generation fails
function fallbackDrawing(prompt: string, canvasWidth: number, canvasHeight: number): DrawingCommand[] {
  console.log("Using fallback drawing for:", prompt);
  const lowerPrompt = prompt.toLowerCase();
  
  // Determine position from prompt
  const position = getPositionFromPrompt(lowerPrompt, canvasWidth, canvasHeight);
  
  if (lowerPrompt.includes("circle")) {
    return [
      {
        type: "circle",
        centerX: position.x,
        centerY: position.y,
        radius: 100,
        isAI: true
      }
    ];
  } else if (lowerPrompt.includes("square") || lowerPrompt.includes("rectangle")) {
    return [
      {
        type: "rect",
        x: position.x - 100,
        y: position.y - 100,
        width: 200,
        height: 200,
        isAI: true
      }
    ];
  } else if (lowerPrompt.includes("face") || lowerPrompt.includes("smiley")) {
    // Create a simple face at the specified position
    return [
      // Face
      {
        type: "circle",
        centerX: position.x,
        centerY: position.y,
        radius: 100,
        isAI: true
      },
      // Left eye
      {
        type: "circle",
        centerX: position.x - 40,
        centerY: position.y - 30,
        radius: 15,
        isAI: true
      },
      // Right eye
      {
        type: "circle",
        centerX: position.x + 40,
        centerY: position.y - 30,
        radius: 15,
        isAI: true
      },
      // Smile
      {
        type: "line",
        startX: position.x - 40,
        startY: position.y + 30,
        endX: position.x + 40,
        endY: position.y + 30,
        isAI: true
      }
    ];
  } else if (lowerPrompt.includes("house") || lowerPrompt.includes("home")) {
    return [
      // House base
      {
        type: "rect",
        x: position.x - 100,
        y: position.y - 80,
        width: 200,
        height: 150,
        isAI: true
      },
      // Roof
      {
        type: "line",
        startX: position.x - 120,
        startY: position.y - 80,
        endX: position.x,
        endY: position.y - 150,
        isAI: true
      },
      {
        type: "line",
        startX: position.x,
        startY: position.y - 150,
        endX: position.x + 120,
        endY: position.y - 80,
        isAI: true
      },
      // Door
      {
        type: "rect",
        x: position.x - 30,
        y: position.y + 20,
        width: 60,
        height: 50,
        isAI: true
      }
    ];
  }
  
  // Default fallback with multiple shapes
  return [
    {
      type: "circle",
      centerX: position.x - 100,
      centerY: position.y - 100,
      radius: 50,
      isAI: true
    },
    {
      type: "rect",
      x: position.x,
      y: position.y,
      width: 150,
      height: 100,
      isAI: true
    },
    {
      type: "line",
      startX: position.x - 150,
      startY: position.y - 150,
      endX: position.x + 150,
      endY: position.y + 150,
      isAI: true
    }
  ];
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt" },
        { status: 400 }
      );
    }
    
    const drawingCommands = await promptToDrawingCommands(prompt);
    console.log(`Generated ${drawingCommands.length} drawing commands for prompt: "${prompt}"`);
    
    return NextResponse.json({ drawingCommands });
  } catch (error) {
    console.error("Error processing drawing request:", error);
    return NextResponse.json(
      { error: "Failed to generate drawing" },
      { status: 500 }
    );
  }
}