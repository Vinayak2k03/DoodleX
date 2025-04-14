"use client";

import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserSchema } from "@repo/common/types";
import { z } from "zod";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "@/config";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Mail, User, Lock, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";

type SignUpFormData = z.infer<typeof CreateUserSchema>;

export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(CreateUserSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/auth/signup`, data);
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      router.push("/signin");
    } catch (err) {
      if (err instanceof AxiosError) {
        toast({
          title: "Error",
          description:
            err.response?.data?.message || "Failed to create account",
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium">
          Name
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          <Input
            id="name"
            type="text"
            className="pl-10 bg-background/50 focus:bg-background transition-colors"
            {...register("name")}
            placeholder="John Doe"
            required
          />
        </div>
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

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
            type="email"
            className="pl-10 bg-background/50 focus:bg-background transition-colors"
            {...register("email")}
            placeholder="johndoe@example.com"
            required
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
            id="password"
            type="password"
            className="pl-10 bg-background/50 focus:bg-background transition-colors"
            {...register("password")}
            placeholder="••••••••"
            required
          />
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full h-11 font-medium transition-all duration-300 hover:shadow-md"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign Up
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}