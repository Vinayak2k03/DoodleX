import {CreateUserSchema, SignInSchema} from "@repo/common/types"
import {Request,Response } from "express";
import {prismaClient} from "@repo/db/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export const signup=async(req:Request,res:Response):Promise<any>=>{
    try{
        // Parsing the request body
        const data=CreateUserSchema.safeParse(req.body);
        if(!data.success){
            res.status(400).json({
                message:"Invalid request"
            })
            return;
        }
        const safeParsedData=data.data;
        
        // Checking if the user already exists
        const existingUser=await prismaClient.user.findFirst({
            where:{
                email:safeParsedData.email
            }
        });

        if(existingUser){
            res.status(400).json({
                message:"User already exists"
            })
            return;
        }

        // Creating the user
        await prismaClient.user.create({
            data:{
                email:safeParsedData.email,
                name:safeParsedData.name,
                password:bcrypt.hashSync(safeParsedData.password,10)
            }
        });

        return res.status(201).json({
            message:"User created successfully"
        });
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
        console.log(err);
    }
}

export const signin=async(req:Request,res:Response)=>{
    try{
        // Parsing the request body
        const data=SignInSchema.safeParse(req.body);
        if(!data.success){
            res.status(400).json({
                message:"Email or password is invalid"
            })
            return;
        }

        const safeParsedData=data.data;

        // Checking if the user exists
        const user=await prismaClient.user.findUnique({
            where:{
                email:safeParsedData.email
            }
        })

        if(!user){
            res.status(400).json({
                message:"Email or password is invalid"
            })
            return;
        }

        // Checking if the password is valid
        const isPasswordValid=bcrypt.compareSync(safeParsedData.password,
            user.password
        )

        if(!isPasswordValid){
            res.status(400).json({
                message:"Invalid password"
            })
            return;
        }

        // Generating the token
        const token=jwt.sign({
            userId:user.id
        },JWT_SECRET);
        
        res.status(201).json({
            message:"User signed in successfully",
            token
        })
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
        console.log(err);
    }
}

export const getUser=async(req:Request,res:Response)=>{
    try{
        // Checking if the user is authenticated
        const userId=req.user;
        if(!userId){
            res.status(400).json({
                message:"Unauthorized"  
            })
            return;
        }

        // Retrieving the user
        const user=await prismaClient.user.findUnique({
            where:{
                id:userId
            }
        })

        if(!user){
            res.status(401).json({
                message:"Unauthorized"
            })
            return;
        }

        res.status(200).json({
            message:"User retrieved successfully",
            user
        });
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
        console.log(err);
    }
}