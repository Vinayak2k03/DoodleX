"use client"

import { Label } from "@repo/ui/components/label";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getVerifiedToken } from "@/lib/cookie";
import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "@/config";
import { useToast } from "@repo/ui/hooks/use-toast";

type Room = {
    id: number;
    slug: string;
    createdAt: string;
  };

type CreateRoomFormProps={
    onRoomCreated:(room:Room)=>void;
}


export function CreateRoomForm({onRoomCreated}:CreateRoomFormProps){
    const [roomName,setRoomName]=useState("");
    const [loading,setLoading]=useState(false);
    const router=useRouter();

    const {toast}=useToast();

    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault();
        try{
            setLoading(true);
            const token=await getVerifiedToken();
            const response=await axios.post(`${BACKEND_URL}/rooms/create-room`,{name:roomName},{
                headers:{authorization:`Bearer ${token}`}
            })
            
            const newRoom=response.data.room;
            onRoomCreated(newRoom);

            toast({
                title:"Success",
                description:"Room created successfully!"
            })

            router.push(`/canvas/${newRoom.id}`)
        }catch(err){
            if(err instanceof AxiosError){
                toast({
                    title:"Error",
                    description:err.response?.data?.message || "Failed to create room",
                    variant:"destructive"
                })
            }else{
                toast({
                    title:"Error",
                    description:"An unexpected error occurred",
                    variant:"destructive"
                })
            }
        }finally{
            setLoading(false);
        }
    }
    

    return(
        <form onSubmit={handleSubmit} className='flex gap-3 items-center justify-center'>
            <div className='flex gap-2 items-center justify-center'>
                <Label htmlFor="roomName" className='block whitespace-nowrap'>Room Name</Label>
                <Input id="roomName" value={roomName} onChange={(e)=>setRoomName(e.target.value)} required/>
            </div>
            <Button type="submit" onClick={handleSubmit} disabled={loading}>Create Room</Button>
        </form>
    )
}