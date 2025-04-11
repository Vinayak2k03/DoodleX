import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with API key
// Change this to use GOOGLE_API_KEY since that's what you've defined in .env
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Process prompt to drawing commands
async function promptToDrawingCommands(prompt: string): Promise<any[]> {
  try {
    console.log(`Generating drawing for prompt: "${prompt}"`);
    
    // Canvas dimensions for reference
    const canvasWidth = 800;
    const canvasHeight = 600;
    
    // System prompt to guide the AI
    const systemPrompt = `You are an AI that converts text descriptions into drawing commands. 
Create a list of simple drawing commands (circles, rectangles, lines) that represent the described scene or object.

You must respond with a valid JSON array of drawing commands. Each command should be one of:
1. Circle: { "type": "circle", "centerX": number, "centerY": number, "radius": number }
2. Rectangle: { "type": "rect", "x": number, "y": number, "width": number, "height": number }
3. Line: { "type": "line", "startX": number, "startY": number, "endX": number, "endY": number }

The canvas is ${canvasWidth}x${canvasHeight} pixels. Position (0,0) is the top-left corner.
Create a simple but recognizable representation using 5-15 shapes.
ONLY respond with the JSON array, no other text.`;

    // Use Gemini to generate the drawing
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Create drawing commands for: ${prompt}` }
    ]);
    
    const response = result.response;
    const text = response.text();
    
    // Try to extract valid JSON from the response
    try {
      // First attempt: Direct parsing
      let drawingCommands = JSON.parse(text);
      
      // Normalize: If not array, look for array property
      if (!Array.isArray(drawingCommands)) {
        drawingCommands = drawingCommands.commands || 
                          drawingCommands.shapes || 
                          drawingCommands.drawings || 
                          drawingCommands.result;
                          
        if (!Array.isArray(drawingCommands)) {
          throw new Error("Response is not in expected format");
        }
      }
      
      // Validate each command
      const validatedCommands = drawingCommands.filter(cmd => {
        if (!cmd || !cmd.type) return false;
        
        switch (cmd.type.toLowerCase()) {
          case "circle":
            return (
              typeof cmd.centerX === 'number' && 
              typeof cmd.centerY === 'number' && 
              typeof cmd.radius === 'number' && 
              cmd.radius > 0
            );
          case "rect":
          case "rectangle":
            cmd.type = "rect"; // Normalize type
            return (
              typeof cmd.x === 'number' && 
              typeof cmd.y === 'number' && 
              typeof cmd.width === 'number' && 
              typeof cmd.height === 'number' && 
              cmd.width > 0 && 
              cmd.height > 0
            );
          case "line":
            return (
              typeof cmd.startX === 'number' && 
              typeof cmd.startY === 'number' && 
              typeof cmd.endX === 'number' && 
              typeof cmd.endY === 'number'
            );
          default:
            return false;
        }
      });
      
      if (validatedCommands.length === 0) {
        throw new Error("No valid drawing commands found");
      }
      
      return validatedCommands;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response:", text);
      
      // Try regex extraction if direct parsing fails
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
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

// Fallback function for when AI generation fails
function fallbackDrawing(prompt: string, canvasWidth: number, canvasHeight: number): any[] {
  console.log("Using fallback drawing for:", prompt);
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("circle")) {
    return [
      {
        type: "circle",
        centerX: canvasWidth / 2,
        centerY: canvasHeight / 2,
        radius: 100
      }
    ];
  } else if (lowerPrompt.includes("square") || lowerPrompt.includes("rectangle")) {
    return [
      {
        type: "rect",
        x: canvasWidth / 2 - 100,
        y: canvasHeight / 2 - 100,
        width: 200,
        height: 200
      }
    ];
  } else if (lowerPrompt.includes("face") || lowerPrompt.includes("smiley")) {
    // Create a simple face
    return [
      // Face
      {
        type: "circle",
        centerX: canvasWidth / 2,
        centerY: canvasHeight / 2,
        radius: 100
      },
      // Left eye
      {
        type: "circle",
        centerX: canvasWidth / 2 - 40,
        centerY: canvasHeight / 2 - 30,
        radius: 15
      },
      // Right eye
      {
        type: "circle",
        centerX: canvasWidth / 2 + 40,
        centerY: canvasHeight / 2 - 30,
        radius: 15
      },
      // Smile
      {
        type: "line",
        startX: canvasWidth / 2 - 40,
        startY: canvasHeight / 2 + 30,
        endX: canvasWidth / 2 + 40,
        endY: canvasHeight / 2 + 30
      }
    ];
  } else if (lowerPrompt.includes("house") || lowerPrompt.includes("home")) {
    return [
      // House base
      {
        type: "rect",
        x: canvasWidth / 2 - 100,
        y: canvasHeight / 2 - 80,
        width: 200,
        height: 150
      },
      // Roof
      {
        type: "line",
        startX: canvasWidth / 2 - 120,
        startY: canvasHeight / 2 - 80,
        endX: canvasWidth / 2,
        endY: canvasHeight / 2 - 150
      },
      {
        type: "line",
        startX: canvasWidth / 2,
        startY: canvasHeight / 2 - 150,
        endX: canvasWidth / 2 + 120,
        endY: canvasHeight / 2 - 80
      },
      // Door
      {
        type: "rect",
        x: canvasWidth / 2 - 30,
        y: canvasHeight / 2 + 20,
        width: 60,
        height: 50
      }
    ];
  }
  
  // Default fallback with multiple shapes
  return [
    {
      type: "circle",
      centerX: canvasWidth / 3,
      centerY: canvasHeight / 3,
      radius: 50
    },
    {
      type: "rect",
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      width: 150,
      height: 100
    },
    {
      type: "line",
      startX: 100,
      startY: 100,
      endX: 300,
      endY: 300
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