import { Tool } from "@/app/draw/Canvas";
import { Button } from "@repo/ui/components/button";
import { Circle, Hand, Minus, Pencil, RotateCcw, Square, Undo, Redo, Eraser } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/components/tooltip";

export default function ActionBar({
  tool,
  setSelectedTool,
  onResetView,
  scale,
}: {
  tool: Tool;
  setSelectedTool: (tool: Tool) => void;
  onResetView: () => void;
  scale: number;
}) {
  const activeClass = `bg-primary text-primary-foreground shadow-inner scale-[0.98] font-medium`;
  const inactiveClass = `hover:bg-accent/70 text-foreground/80 hover:text-foreground transition-all`;

  // Group our tools for better organization
  const toolGroups = [
    {
      title: "Navigation",
      tools: [
        { id: "pan" as Tool, icon: <Hand className="h-4 w-4" />, label: "Hand Tool", shortcut: "H" }
      ]
    },
    {
      title: "Drawing",
      tools: [
        { id: "pencil" as Tool, icon: <Pencil className="h-4 w-4" />, label: "Pencil", shortcut: "P" },
        { id: "rect" as Tool, icon: <Square className="h-4 w-4" />, label: "Rectangle", shortcut: "R" },
        { id: "circle" as Tool, icon: <Circle className="h-4 w-4" />, label: "Circle", shortcut: "C" },
        { id: "line" as Tool, icon: <Minus className="h-4 w-4" />, label: "Line", shortcut: "L" },
        { id: "eraser" as Tool, icon: <Eraser className="h-4 w-4" />, label: "Eraser", shortcut: "E" }
      ]
    }
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 p-1.5 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 rounded-xl border border-border/40 shadow-lg">
          {toolGroups.map((group, groupIndex) => (
            <div key={group.title} className="flex items-center">
              {groupIndex > 0 && <div className="w-px h-7 bg-border/60 mx-1.5" />}
              
              {group.tools.map((toolItem) => (
                <Tooltip key={toolItem.id}>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 w-8 rounded-lg transition-all duration-200 ${tool === toolItem.id ? activeClass : inactiveClass}`}
                      onClick={() => setSelectedTool(toolItem.id)}
                    >
                      {toolItem.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="flex items-center gap-1.5">
                    <span>{toolItem.label}</span>
                    <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {toolItem.shortcut}
                    </kbd>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
          
          <div className="w-px h-7 bg-border/60 mx-1.5" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 rounded-lg text-xs font-mono bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  {Math.round(scale * 100)}%
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Zoom Level</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg transition-colors hover:bg-accent/70"
                  onClick={onResetView}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Reset View</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="w-px h-7 bg-border/60 mx-1.5" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg transition-colors hover:bg-accent/70"
                  disabled
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="flex items-center gap-1.5">
                <span>Undo</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  Ctrl+Z
                </kbd>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg transition-colors hover:bg-accent/70"
                  disabled
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="flex items-center gap-1.5">
                <span>Redo</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  Ctrl+Y
                </kbd>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}