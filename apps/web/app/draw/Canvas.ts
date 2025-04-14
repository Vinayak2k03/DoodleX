import { getExistingShapes } from "./api";

export type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      isAI?: boolean;
      source?: string; 
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      isAI?: boolean;
      source?: string; 

    }
  | {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      isAI?: boolean;
      source?: string; 

    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
      isAI?: boolean;
      source?: string; 

    };

export type Tool =
  | "rect"
  | "circle"
  | "eraser"
  | "pencil"
  | "line"
  | "text"
  | "color"
  | "pan";

export class Canvas {
  private canvas: HTMLCanvasElement;
  private roomId: string;
  private socket: WebSocket;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private selectedTool: Tool;
  private clicked: boolean;
  private startX: number;
  private startY: number;
  private offsetX: number;
  private offsetY: number;
  private scale: number;

  private pencilPoints: { x: number; y: number }[] = [];
  private isPanning: boolean = false;
  private readonly LINE_WIDTH = 2;
  private lastPanPoint: { x: number; y: number } | null = null;

  onScaleChange?: (scale: number) => void;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.roomId = roomId;
    this.socket = socket;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.ctx.lineWidth = this.LINE_WIDTH;
    this.selectedTool = "rect";
    this.isPanning = false;
    this.lastPanPoint = null;
    this.clicked = false;
    this.startX = 0;
    this.startY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  async init() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.existingShapes = await getExistingShapes(this.roomId);
    this.drawExistingShapes();

    window.addEventListener("resize", this.handleResize);
  }

  // Handle window resize events
  handleResize = () => {
    const currentTransform = this.ctx.getTransform();

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx.fillStyle = "black";
    this.ctx.setTransform(currentTransform);
    this.redraw();
  };

  drawExistingShapes() {
    this.existingShapes.forEach((shape) => {
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = this.LINE_WIDTH;

      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
      } else if (shape.type === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.stroke();
      } else if (shape.type === "pencil") {
        this.ctx.beginPath();
        shape.points.forEach((point, index) => {
          if (index === 0) {
            this.ctx.moveTo(point.x, point.y);
          } else {
            this.ctx.lineTo(point.x, point.y);
          }
        });
        this.ctx.stroke();
      }
    });
  }

  clearCanvas() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  touchMoveHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length >= 1) {
      const touch = e.touches[0];
      // Now we're sure touch exists
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch?.clientX,
        clientY: touch?.clientY,
        button: this.selectedTool === "pan" ? 2 : 0,
      });
      this.mouseMoveHandler(mouseEvent);
    }
  };
  

  touchEndHandler = (e: TouchEvent) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent("mouseup", {
      clientX: e.changedTouches[0]?.clientX || 0,
      clientY: e.changedTouches[0]?.clientY || 0,
      button: this.selectedTool === "pan" ? 2 : 0,
    });
    this.mouseUpHandler(mouseEvent);
  };

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("touchstart", this.touchStartHandler);
    this.canvas.removeEventListener("touchmove", this.touchMoveHandler);
    this.canvas.removeEventListener("touchend", this.touchEndHandler);
    window.removeEventListener("resize", this.handleResize);
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
    if (tool === "pan") {
      this.canvas.style.cursor = "grab";
    } else {
      this.canvas.style.cursor = "crosshair";
    }
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received WebSocket message:", message.type);

        if (message.type === "shape_update") {
          const shape = JSON.parse(message.message);
          console.log("Received shape update:", shape.type);

          // Add source tracking to avoid duplicates
          if (!shape.source) {
            shape.source = message.userId || "unknown";
          }

          // Check if this shape is already in our shape collection
          const isDuplicate = this.existingShapes.some((existingShape) => {
            // For simple comparison, check exact string match
            return JSON.stringify(existingShape) === JSON.stringify(shape);
          });

          if (!isDuplicate) {
            console.log("Adding shape to canvas from:", shape.source);
            this.existingShapes.push(shape);
            this.redraw();
          } else {
            console.log("Ignoring duplicate shape");
          }
        }
      } catch (err) {
        console.log("Error handling WebSocket message:", err);
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const pointX = (mouseX - this.offsetX) / this.scale;
      const pointY = (mouseY - this.offsetY) / this.scale;
      this.scale *= delta;

      // Limit the scale to a minimum of 0.1 and a maximum of 10
      this.scale = Math.min(Math.max(0.1, this.scale), 10);
      this.onScaleChange?.(this.scale);

      this.offsetX = mouseX - pointX * this.scale;
      this.offsetY = mouseY - pointY * this.scale;

      this.redraw();
    });
  }

  redraw() {
    this.clearCanvas();

    this.ctx.setTransform(
      this.scale,
      0,
      0,
      this.scale,
      this.offsetX,
      this.offsetY
    );

    this.drawExistingShapes();
  }

  resetView() {
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.onScaleChange?.(this.scale);
    this.redraw();
  }

  mouseDownHandler = (e: MouseEvent) => {
    // e.buttons === 2: Checks if the right mouse button is being pressed while other buttons could also be pressed.
    // e.button === 2: Checks specifically if the right mouse button was the one that initiated the event.
    if (this.selectedTool === "pan" || e.buttons === 2 || e.button === 2) {
      e.preventDefault();
      this.isPanning = true;
      this.lastPanPoint = { x: e.clientX, y: e.clientY };

      if (this.selectedTool === "pan") {
        this.canvas.style.cursor = "grabbing";
      }
      return;
    }

    this.clicked = true;
    const point = this.screenToCanvas(e.clientX, e.clientY);
    this.startX = point.x;
    this.startY = point.y;

    if (this.selectedTool === "pencil") {
      this.pencilPoints = [{ x: this.startX, y: this.startY }];
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.strokeStyle = "white";
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (this.isPanning) {
      this.isPanning = false;
      this.lastPanPoint = null;

      if (this.selectedTool === "pan") {
        this.canvas.style.cursor = "grab";
      }
      return;
    }

    this.clicked = false;
    const point = this.screenToCanvas(e.clientX, e.clientY);
    const endX = point.x;
    const endY = point.y;

    if (this.selectedTool === "pencil") {
      if (this.pencilPoints.length > 1) {
        const shape: Shape = {
          type: "pencil",
          points: [...this.pencilPoints], // Create a new array to avoid reference issues
        };

        this.existingShapes.push(shape);
        this.socket.send(
          JSON.stringify({
            type: "shape_update",
            message: JSON.stringify(shape),
            roomId: Number(this.roomId),
          })
        );
        this.pencilPoints = [];
        this.redraw();
      }
    } else {
      let shape: Shape | null = null;

      if (this.selectedTool === "rect") {
        // Fix: Create rectangle with correct coordinates for any drag direction
        const x = Math.min(this.startX, endX);
        const y = Math.min(this.startY, endY);
        const width = Math.abs(endX - this.startX);
        const height = Math.abs(endY - this.startY);

        shape = {
          type: "rect",
          x,
          y,
          width,
          height,
        };
      } else if (this.selectedTool === "circle") {
        // Fix: Calculate circle properly from center
        const centerX = (this.startX + endX) / 2;
        const centerY = (this.startY + endY) / 2;
        const radius = Math.sqrt(
          Math.pow((endX - this.startX) / 2, 2) +
            Math.pow((endY - this.startY) / 2, 2)
        );

        shape = {
          type: "circle",
          centerX,
          centerY,
          radius,
        };
      } else if (this.selectedTool === "line") {
        shape = {
          type: "line",
          startX: this.startX,
          startY: this.startY,
          endX,
          endY,
        };
      }

      if (shape) {
        // Add a unique client identifier
        shape.source = "client-" + Math.random().toString(36).substring(2, 9);

        this.existingShapes.push(shape);
        this.socket.send(
          JSON.stringify({
            type: "shape_update",
            message: JSON.stringify(shape),
            roomId: Number(this.roomId),
          })
        );
        this.redraw();
      }
    }
  };

  touchStartHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch?.clientX,
        clientY: touch?.clientY,
        button: this.selectedTool === "pan" ? 2 : 0,
      });
      this.mouseDownHandler(mouseEvent);
    }
  };

  screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.offsetX) / this.scale,
      y: (screenY - this.offsetY) / this.scale,
    };
  }

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.isPanning && this.lastPanPoint) {
      const dx = e.clientX - this.lastPanPoint.x;
      const dy = e.clientY - this.lastPanPoint.y;

      this.offsetX += dx;
      this.offsetY += dy;

      this.lastPanPoint = { x: e.clientX, y: e.clientY };

      this.redraw();
      return;
    }

    if (this.clicked) {
      const x = (e.clientX - this.offsetX) / this.scale;
      const y = (e.clientY - this.offsetY) / this.scale;

      if (this.selectedTool === "pencil") {
        const point = { x, y };
        this.pencilPoints.push(point);

        // Redraw everything to ensure consistent appearance
        this.redraw();

        // Draw current stroke on top
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = this.LINE_WIDTH;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.beginPath();

        this.pencilPoints.forEach((point, index) => {
          if (index === 0) {
            this.ctx.moveTo(point.x, point.y);
          } else {
            this.ctx.lineTo(point.x, point.y);
          }
        });

        this.ctx.stroke();
      } else {
        this.redraw();
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = this.LINE_WIDTH;

        if (this.selectedTool === "rect") {
          // Fix: Handle rectangle drawing in any direction
          const rectX = Math.min(this.startX, x);
          const rectY = Math.min(this.startY, y);
          const width = Math.abs(x - this.startX);
          const height = Math.abs(y - this.startY);

          this.ctx.strokeRect(rectX, rectY, width, height);
        } else if (this.selectedTool === "circle") {
          // Fix: Calculate circle from center point
          const centerX = (this.startX + x) / 2;
          const centerY = (this.startY + y) / 2;
          const radius = Math.sqrt(
            Math.pow((x - this.startX) / 2, 2) +
              Math.pow((y - this.startY) / 2, 2)
          );

          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          this.ctx.stroke();
        } else if (this.selectedTool === "line") {
          this.ctx.beginPath();
          this.ctx.moveTo(this.startX, this.startY);
          this.ctx.lineTo(x, y);
          this.ctx.stroke();
        }
      }
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    // Add touch event handlers
    this.canvas.addEventListener("touchstart", this.touchStartHandler);
    this.canvas.addEventListener("touchmove", this.touchMoveHandler);
    this.canvas.addEventListener("touchend", this.touchEndHandler);
  }

  clearAIShapes() {
    // Filter out shapes that were added by AI
    this.existingShapes = this.existingShapes.filter((shape) => !shape.isAI);
    this.redraw();
  }

  // Method to draw AI-generated rectangle
  drawAIRect(x: number, y: number, width: number, height: number) {
    // Create shape object with source tracking
    const shape = {
      type: "rect" as const,
      x,
      y,
      width,
      height,
      isAI: true,
      source: "ai-" + Math.random().toString(36).substring(2, 9),
    };

    // Add to existing shapes
    this.existingShapes.push(shape);

    // Send to socket for collaborative drawing
    this.socket.send(
      JSON.stringify({
        type: "shape_update",
        message: JSON.stringify(shape),
        roomId: Number(this.roomId),
      })
    );

    // Redraw everything
    this.redraw();
  }

  // Method to draw AI-generated circle
  drawAICircle(centerX: number, centerY: number, radius: number) {
    // Create shape object with source tracking
    const shape = {
      type: "circle" as const,
      centerX,
      centerY,
      radius,
      isAI: true,
      source: "ai-" + Math.random().toString(36).substring(2, 9),
    };

    // Add to existing shapes
    this.existingShapes.push(shape);

    // Send to socket for collaborative drawing
    this.socket.send(
      JSON.stringify({
        type: "shape_update",
        message: JSON.stringify(shape),
        roomId: Number(this.roomId),
      })
    );

    // Redraw everything
    this.redraw();
  }

  // Method to draw AI-generated line
  drawAILine(startX: number, startY: number, endX: number, endY: number) {
    // Create shape object with source tracking
    const shape = {
      type: "line" as const,
      startX,
      startY,
      endX,
      endY,
      isAI: true,
      source: "ai-" + Math.random().toString(36).substring(2, 9),
    };

    // Add to existing shapes
    this.existingShapes.push(shape);

    // Send to socket for collaborative drawing
    this.socket.send(
      JSON.stringify({
        type: "shape_update",
        message: JSON.stringify(shape),
        roomId: Number(this.roomId),
      })
    );

    // Redraw everything
    this.redraw();
  }

  // Method to draw AI-generated pencil strokes
  drawAIPencil(points: { x: number; y: number }[]) {
    if (points.length < 2) return;

    // Create shape object with source tracking
    const shape = {
      type: "pencil" as const,
      points: [...points], // Clone the array to avoid reference issues
      isAI: true,
      source: "ai-" + Math.random().toString(36).substring(2, 9),
    };

    // Add to existing shapes
    this.existingShapes.push(shape);

    // Send to socket fo  r collaborative drawing
    this.socket.send(
      JSON.stringify({
        type: "shape_update",
        message: JSON.stringify(shape),
        roomId: Number(this.roomId),
      })
    );

    // Redraw everything
    this.redraw();
  }
}
