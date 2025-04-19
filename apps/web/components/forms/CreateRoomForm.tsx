"use client";

import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getVerifiedToken } from "@/lib/cookie";
import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "@/config";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";

type Room = {
  id: number;
  slug: string;
  createdAt: string;
};

type CreateRoomFormProps = {
  onRoomCreated: (room: Room) => void;
};

export function CreateRoomForm({ onRoomCreated }: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = await getVerifiedToken();
      const response = await axios.post(
        `${BACKEND_URL}/rooms/create-room`,
        { name: roomName },
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );

      const newRoom = response.data.room;
      onRoomCreated(newRoom);

      toast({
        title: "Success",
        description: "Room created successfully!",
      });

      router.push(`/canvas/${newRoom.id}`);
    } catch (err) {
      if (err instanceof AxiosError) {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to create room",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      console.log("setting false")
    }
  };
  return (
    <div className="flex items-center gap-3">
      <Input
        id="roomName"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Room Name"
        className="min-w-0 w-full sm:w-auto sm:min-w-[200px] px-3 py-2 rounded-md border border-border/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
        disabled={loading}
      />
      <Button
        onClick={handleSubmit}
        type="button"
        size="sm"
        className="whitespace-nowrap"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">Creating...</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Room</span>
          </>
        )}
      </Button>
    </div>
  );
}
