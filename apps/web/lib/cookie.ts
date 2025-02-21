"use server";

import { BACKEND_URL } from "@/config";
import axios from "axios";
 import {cookies} from "next/headers";


 export const setTokenCookie=async(token:string)=>{
    const expireDate=new Date();
    expireDate.setDate(expireDate.getDate()+15);

    (await cookies()).set({
        name:"token",
        value:token,
        expires:expireDate,
        // VULNERABILITY: The following options should be set to true
        // IMPORTANT IMPORTANT IMPORTANT 
        httpOnly:false,
        sameSite:false
    })
 }

 export const getVerifiedToken=async():Promise<string|null>=>{
    try{
        const token=(await cookies()).get("token")?.value || null;

        if(!token) return null;

        await axios.get(`${BACKEND_URL}/auth/me`,{
            headers:{Authorization:`Bearer ${token}`}
        })

        console.log("Token verified successfully");
        return token;
    }catch(err){
        console.log("Error verifying token: ",err);
        await removeTokenCookie();
        return null;
    }
 }

 
 export const removeTokenCookie=async()=>{
    (await cookies()).delete("token");
 }



