"use client";

import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { set, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInSchema } from "@repo/common/types";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {Loader2} from "lucide-react"
import Link from "next/link";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import {useToast} from "@repo/ui/hooks/use-toast";
import { setTokenCookie } from "@/lib/cookie";

type SignInFormData = z.infer<typeof SignInSchema>;

export function SignInForm() {
    const router=useRouter();
  const [error, setError] = useState("");
  const [loading,setLoading]=useState(false);
  const {toast}=useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit=async(data:SignInFormData)=>{
    try{
        setLoading(true);
        setError("");
        const response=await axios.post(`${BACKEND_URL}/auth/signin`,data);
        const token=response.data.token;
        await setTokenCookie(token);
        router.push("/dashboard");
    }catch(err:unknown){
        let errorMessage="An error occurred";
        if(err instanceof AxiosError){
            errorMessage=err.response?.data?.message || err.message;
            setError(errorMessage);
        }else{
            setError(errorMessage);
        }
        toast({
            title:"Error",
            description:errorMessage,
            variant:"destructive"
        })
    }finally{
        setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" {...register("email")}></Input>
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input type="password" id="password" {...register("password")}></Input>
        {errors.password && (
          <span className="text-red-500 text-sm">
            {errors.password.message}
          </span>
        )}
      </div>

    <Button type="submit" disabled={loading} className='w-full mt-4'>
        {loading ? (
            <>
                <Loader2 className='animate-spin'/>Signing in...
            </>
        ):(
            "Sign In"
        )}
    </Button>

    <div className='text-center text-sm mt-2'>
        Don&apos;t have an account? {" "}
        <Link href="/signup" className='text-blue-500 hover:underline'>Sign Up</Link>
    </div>
    </form>
  );
}
