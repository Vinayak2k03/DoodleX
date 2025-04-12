"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { ArrowLeft, Users, Share2, Download } from "lucide-react";
import CanvasWrapper from "@/components/CanvasWrapper";
import { useState, useEffect, useMemo } from "react";

export default function CanvasLanding() {
  const params = useParams();
  const { slug } = params;
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [roomId,roomName]=useMemo(()=>{
    const slugStr=slug as string;
    const dashIndex=slugStr.indexOf('-');

    if(dashIndex>0){
      const id=slugStr.substring(0,dashIndex);
      const name=slugStr.substring(dashIndex+1);
      return [id,name];
    }

    return [slugStr,''];
  },[slug]);

  // Hide toolbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsToolbarVisible(false);
      } else {
        setIsToolbarVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Top navigation bar with glass effect */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${isToolbarVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-background/80 backdrop-blur-md border-b border-border/30 px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="relative hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="ml-2">
              <h1 className="text-lg font-medium">{roomName?`${roomName}`:`Canvas-${roomId}`}</h1>
              <p className="text-xs text-muted-foreground">Last saved just now</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Invite</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Canvas with subtle padding to account for the header */}
      <div className="pt-14">
        <CanvasWrapper roomId={roomId} />
      </div>
    </div>
  );
}