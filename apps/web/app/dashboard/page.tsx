"use client";

import { CreateRoomForm } from "@/components/forms/CreateRoomForm";
import { BACKEND_URL } from "@/config";
import { getVerifiedToken } from "@/lib/cookie";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useToast } from "@repo/ui/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { Delete, DeleteIcon, LucideDelete } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DeleteIcon1 from "@repo/ui/icons/deleteIcon";

type Room = {
  id: number;
  slug: string;
  createdAt: string;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const token = await getVerifiedToken();
        const response = await axios.get(`${BACKEND_URL}/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRooms(response.data.rooms);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          toast({
            title: "Error",
            description: err.response?.data?.message || "Failed to fetch rooms",
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
      }
    };
    fetchRooms();
  }, []);

  const handleRoomCreated = (newRoom: Room) => {
    setRooms((prevRooms) => [...prevRooms, newRoom]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">
            Your Drawing Rooms
          </h1>
          <CreateRoomForm onRoomCreated={handleRoomCreated} />
        </div>

        {/*Showing loading ui*/}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-card-foreground">
                    {room.slug}
                    <DeleteIcon1 />
                  </CardTitle>
                  <CardDescription>
                    Created {new Date(room.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.push(`/canvas/${room.id}`)}
                  >
                    Join Room
                  </Button>
                </CardContent>
              </Card>
            ))}

            {!loading && rooms.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No Rooms Yet</CardTitle>
                  <CardDescription>
                    Create your first drawing room to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateRoomForm onRoomCreated={handleRoomCreated} />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
