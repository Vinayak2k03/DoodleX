import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";

export const getChat=async(req:Request,res:Response)=>{
    try{
        const roomId=Number(req.params.roomId);
        if(!roomId){
            res.status(400).json({
                message:"Invalid request! Room Id is required"
            })
            return;
        }

        const chats=await prismaClient.chat.findMany({
            where:{
                roomId:roomId
            },
            take:100,
            orderBy:{
                id:"desc"
            }
        })

        // res status 200 -> retrieving existing data
        // res status 201 -> creating new data 
        res.status(200).json({
            message:"Chats retrieved successfully",
            chats
        })
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
        console.log(err)
    }
}