import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "@repo/backend-common/config";

const authMiddleware=(req:Request,res:Response,next:NextFunction):any=>{
    try{
        const authHeader=req.headers.authorization;
        
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                message:"Unauthorized: No token provided"
            })
        }
        
        const token=authHeader.split(" ")[1];

        if(!token){
            return res.status(401).json({
                message:"Unauthorized: No token provided"
            })
        }

        const decodedToken=jwt.verify(token,JWT_SECRET) as {
            userId:string;
        };

        if(!decodedToken || !decodedToken.userId){
            return res.status(401).send("Unauthorized");
        }

        req.user=decodedToken.userId;
        next();
    }catch(err){
        console.log(err);
        res.status(401).send("Unauthorized");
    }
}

export default authMiddleware;