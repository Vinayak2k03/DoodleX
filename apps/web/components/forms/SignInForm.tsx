"use client";

import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInSchema } from "@repo/common/types";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Loader2, Mail, Lock } from "lucide-react"
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useToast } from "@repo/ui/hooks/use-toast";
import { setTokenCookie } from "@/lib/cookie";

type SignInFormData = z.infer<typeof SignInSchema>;

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post(`${BACKEND_URL}/auth/signin`, data);
      const token = response.data.token;
      await setTokenCookie(token);
      router.push("/dashboard");
    } catch (err: unknown) {
      let errorMessage = "An error occurred";
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      {error && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <Mail className="h-4 w-4" />
          </div>
          <Input 
            id="email" 
            {...register("email")} 
            className="pl-10 bg-background/50 focus:bg-background transition-colors"
            placeholder="you@example.com"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <Lock className="h-4 w-4" />
          </div>
          <Input 
            type="password" 
            id="password" 
            {...register("password")} 
            className="pl-10 bg-background/50 focus:bg-background transition-colors"
            placeholder="••••••••"
          />
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="pt-2">
        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full h-11 font-medium transition-all duration-300 hover:shadow-md"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </div>
    </form>
  );
}