import { ThermometerSnowflake, TicketSlash } from "lucide-react";
import { getExistingShapes } from "./api";

export type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      isAI?:boolean;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      isAI?:boolean;
    }
  | {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      isAI?:boolean;
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
      isAI?:boolean;
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
  }

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

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
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
        if (message.type === "shape_update") {
          const shape = JSON.parse(message.message);
          this.existingShapes.push(shape);
          this.redraw();
        }
      } catch (err) {
        console.log("Error handling WebSocket message:", err);
      }
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
    this.startX = (e.clientX - this.offsetX) / this.scale;
    this.startY = (e.clientY - this.offsetY) / this.scale;

    if (this.selectedTool === "pencil") {
      this.pencilPoints = [{ x: this.startX, y: this.startY }];
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.strokeStyle = "white";
      this.ctx.lineCap = "round";
    }
  };

  //   CANVAS MOVES NOT THE SHAPES

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

    const endX = (e.clientX - this.offsetX) / this.scale;
    const endY = (e.clientY - this.offsetY) / this.scale;

    if (this.selectedTool === "pencil") {
      const shape: Shape = {
        type: "pencil",
        points: this.pencilPoints,
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
    } else {
      const width = endX - this.startX;
      const height = endY - this.startY;

      let shape: Shape | null = null;

      if (this.selectedTool === "rect") {
        shape = {
          type: "rect",
          x: this.startX,
          y: this.startY,
          width,
          height,
        };
      } else if (this.selectedTool === "circle") {
        const radius = Math.max(width, height) / 2;
        const centerX = this.startX + radius;
        const centerY = this.startY + radius;
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
        this.existingShapes.push(shape);
        this.socket.send(
          JSON.stringify({
            type: "shape_update",
            message: JSON.stringify(shape),
            roomId: Number(this.roomId),
          })
        );
      }
    }
  };

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
        this.ctx.lineWidth = this.LINE_WIDTH;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
      } else {
        this.redraw();
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = this.LINE_WIDTH;

        const width = x - this.startX;
        const height = y - this.startY;

        if (this.selectedTool === "rect") {
          this.ctx.strokeRect(this.startX, this.startY, width, height);
        } else if (this.selectedTool === "circle") {
          const radius = Math.max(width, height) / 2;
          const centerX = this.startX + radius;
          const centerY = this.startY + radius;

          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
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
  }

  clearAIShapes() {
    // Filter out shapes that were added by AI
    this.existingShapes = this.existingShapes.filter(shape => !shape.isAI);
    this.redraw();
  }

  // Method to draw AI-generated rectangle
  drawAIRect(x: number, y: number, width: number, height: number) {
    // Draw on the canvas
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = this.LINE_WIDTH;
    this.ctx.strokeRect(x, y, width, height);

    // Send to socket for collaborative drawing
    this.socket.send(
      JSON.stringify({
        type: "rect",
        x,
        y,
        width,
        height,
        isAI:true
      })
    );

    // Add to existing shapes
    this.existingShapes.push({
      type: "rect",
      x,
      y,
      width,
      height,
      isAI:true
    });

    // Redraw everything
    this.drawExistingShapes();
  }

  // Method to draw AI-generated circle
  drawAICircle(centerX: number, centerY: number, radius: number) {
    // Draw on the canvas
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = this.LINE_WIDTH;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Send to socket for collaborative drawing
    this.socket.send(
      JSON.stringify({
        type: "circle",
        centerX,
        centerY,
        radius,
        isAI:true
      })
    );

    // Add to existing shapes
    this.existingShapes.push({
      type: "circle",
      centerX,
      centerY,
      radius,
      isAI:true
    });

    // Redraw everything
    this.drawExistingShapes();
  }

  // Method to draw AI-generated line
  drawAILine(startX: number, startY: number, endX: number, endY: number) {
    // Draw on the canvas
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = this.LINE_WIDTH;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // Send to socket for collaborative drawing
    this.socket.send(
      JSON.stringify({
        type: "line",
        startX,
        startY,
        endX,
        endY,
        isAI:true
      })
    );

    // Add to existing shapes
    this.existingShapes.push({
      type: "line",
      startX,
      startY,
      endX,
      endY,
      isAI:true
    });

    // Redraw everything
    this.drawExistingShapes();
  }

  // Method to draw AI-generated pencil strokes
  drawAIPencil(points: { x: number; y: number }[]) {
    if (points.length < 2) return;

    // Draw on the canvas
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = this.LINE_WIDTH;
    this.ctx.beginPath();

    points.forEach((point, index) => {
      if (index === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });

    this.ctx.stroke();

    // Send to socket for collaborative drawing
    this.socket.send(
      JSON.stringify({
        type: "pencil",
        points,
        isAI:true
      })
    );

    // Add to existing shapes
    this.existingShapes.push({
      type: "pencil",
      points,
      isAI:true
    });

    // Redraw everything
    this.drawExistingShapes();
  }
}
