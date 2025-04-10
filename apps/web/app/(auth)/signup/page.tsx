import { SignUpForm } from "@/components/forms/SignUpForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-secondary/10 rounded-full filter blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md border border-border/40 shadow-lg relative z-10">
        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-lg -z-10"></div>
        
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign up to start creating and collaborating
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <SignUpForm />
        </CardContent>
        
        <div className="p-4 text-center border-t border-border/20">
          <p className="text-sm text-muted-foreground">
            Already have an account? <a href="/signin" className="text-primary hover:underline font-medium">Sign in</a>
          </p>
        </div>
      </Card>
    </div>
  );
}