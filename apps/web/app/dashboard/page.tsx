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
  CardFooter,
} from "@repo/ui/components/card";
import { useToast } from "@repo/ui/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { 
  ArrowRight, 
  Plus, 
  Loader2, 
  Layout, 
  Calendar, 
  PenTool,
  Search,
  Grid2x2,
  List 
} from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);
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
    toast({
      title: "Success",
      description: `Room "${newRoom.slug}" created successfully`,
      variant: "default",
    });
  };

  const initiateDeleteRoom = (roomId: number) => {
    setRoomToDelete(roomId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (roomToDelete === null) return;
    
    try {
      const token = await getVerifiedToken();
      await axios.delete(`${BACKEND_URL}/rooms/${roomToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setRooms((prevRooms) => prevRooms.filter(room => room.id !== roomToDelete));
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setRoomToDelete(null);
    }
  };

  const cancelDeleteRoom = () => {
    setIsDeleteModalOpen(false);
    setRoomToDelete(null);
  };

  const filteredRooms = rooms.filter(room => 
    room.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/3 left-1/5 w-96 h-96 bg-muted/30 rounded-full filter blur-3xl opacity-70"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto py-12 px-6">
        <header className="mb-12">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center shadow-sm">
              <PenTool className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Your Drawing Rooms
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 pl-14 text-lg">Create and manage your collaborative drawing spaces</p>
        </header>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-10 bg-card/50 p-6 rounded-xl border border-border/30 shadow-sm backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-2 bg-primary rounded-full"></div>
            <h2 className="text-2xl font-semibold">Your Spaces</h2>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-md border border-border/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
            
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground"}`}
                aria-label="Grid view"
              >
                <Grid2x2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground"}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            <CreateRoomForm onRoomCreated={handleRoomCreated} />
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border border-border/40 shadow-sm overflow-hidden">
                <div className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-primary/10 rounded-md w-3/4"></div>
                    <div className="h-4 bg-muted rounded-md w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 bg-muted rounded-md w-full"></div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredRooms.length > 0 ? (
              <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}`}>
                {filteredRooms.map((room) => (
                  viewMode === "grid" ? (
                    <Card 
                      key={room.id} 
                      className="border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden bg-card/90 backdrop-blur-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center text-card-foreground">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mr-3 shadow-sm group-hover:bg-primary/20 transition-colors">
                              <Layout className="h-5 w-5 text-primary/80" />
                            </div>
                            <span className="truncate font-medium text-lg">{room.slug}</span>
                          </div>
                          <button 
                            onClick={() => initiateDeleteRoom(room.id)} 
                            className="outline-none focus:outline-none hover:opacity-80 transition-opacity p-1 hover:bg-red-50 rounded-full"
                            aria-label="Delete room"
                          >
                            <DeleteIcon1 />
                          </button>
                        </CardTitle>
                        <CardDescription className="flex items-center text-sm ml-13 pl-0 mt-1">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          Created {new Date(room.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardFooter className="pt-0 pb-5">
                        <Button
                          variant="default"
                          size="default"
                          className="w-full transition-all hover:shadow-lg group-hover:bg-primary group-hover:scale-[1.02]"
                          onClick={() => router.push(`/canvas/${room.id}-${encodeURIComponent(room.slug)}`)}
                        >
                          <span className="flex items-center justify-center gap-2 py-1">
                            Join Room
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card
                      key={room.id}
                      className="border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center shadow-sm group-hover:bg-primary/20 transition-colors">
                            <Layout className="h-6 w-6 text-primary/80" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{room.slug}</h3>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1.5" />
                              Created {new Date(room.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => initiateDeleteRoom(room.id)} 
                            className="outline-none focus:outline-none hover:opacity-80 transition-opacity p-1 hover:bg-red-50 rounded-full"
                            aria-label="Delete room"
                          >
                            <DeleteIcon1 />
                          </button>
                          <Button
                            variant="default"
                            onClick={() => router.push(`/canvas/${room.id}-${encodeURIComponent(room.slug)}`)}
                            className="transition-all hover:shadow-md group-hover:bg-primary"
                          >
                            <span className="flex items-center gap-2">
                              Join Room
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                ))}
              </div>
            ) : (
              /* Empty state with search */
              <Card className="col-span-1 md:col-span-2 lg:col-span-3 border border-dashed border-border bg-background/50 shadow-sm">
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 shadow-inner">
                    {searchQuery ? (
                      <Search className="h-10 w-10 text-primary/60" />
                    ) : (
                      <Plus className="h-10 w-10 text-primary/60" />
                    )}
                  </div>
                  <CardTitle className="text-2xl">
                    {searchQuery ? "No Matching Rooms" : "No Rooms Yet"}
                  </CardTitle>
                  <CardDescription className="max-w-md mx-auto mt-3 text-base">
                    {searchQuery 
                      ? `No rooms matching "${searchQuery}" found. Try a different search or create a new room.`
                      : "Create your first drawing room to start collaborating with others in real-time"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-10">
                  <CreateRoomForm onRoomCreated={handleRoomCreated} />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this room? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelDeleteRoom}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteRoom}>
                Delete Room
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}