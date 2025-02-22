"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { ArrowLeft } from "lucide-react";
import CanvasWrapper from "@/components/CanvasWrapper";

export default function CanvasLanding() {
  const params = useParams();
  const { slug } = params;

  return (
    <div>
      <Link href="/dashboard">
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
      <CanvasWrapper roomId={slug as string}></CanvasWrapper>
    </div>
  );
}
