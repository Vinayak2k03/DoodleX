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
        className="min-w-[200px] pr-3 focus-visible:ring-primary"
        disabled={loading} // Add this line
      />
      <Button
        onClick={handleSubmit}
        type="button"
        size="sm"
        className="flex items-center gap-2 px-4 py-2 h-10"
        disabled={loading} // Add this line
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Creating...</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span>Create Room</span>
          </>
        )}
      </Button>
    </div>
  );
}
