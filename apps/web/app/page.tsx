import { Button } from "@repo/ui/components/button"
import Link from "next/link"
import { ArrowRight, Pencil, Share2, Users, Sparkles, ChevronRight } from "lucide-react"
import Image from "next/image"

export default function Home(){
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background elements - enhanced with more subtle gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-secondary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-primary/5 rounded-full filter blur-2xl"></div>
      </div>
      
      {/* Main content */}
      <div className='relative z-10 min-h-screen flex flex-col items-center justify-center p-6 md:p-8'>
        <div className='max-w-4xl text-center space-y-12'>
          {/* Hero section - refined typography */}
          <div className="space-y-5 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-sm text-primary font-medium mb-2">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>The future of collaborative drawing is here</span>
            </div>
            <h1 className='text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight'>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                DoodleX
              </span>
            </h1>
            <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
              Create, collaborate, and share your drawings in real-time with anyone around the world.
            </p>
            
            <div className='flex flex-col sm:flex-row gap-5 justify-center mt-6'>
              <Link href="/signin">
                <Button size="lg" variant="default" className="h-12 px-7 text-base font-medium rounded-xl hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-lg">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href='/signup'>
                <Button size="lg" variant="outline" className="h-12 px-7 text-base font-medium rounded-xl hover:bg-primary/5 transition-all duration-300">
                  Sign Up <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Feature section - improved spacing and visual balance */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent h-[1px] -z-10"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 pb-8">
              <div className="group bg-card hover:bg-card/80 rounded-xl p-5 space-y-3 shadow-md hover:shadow-lg transition-all duration-300 border border-border/40">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Pencil className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Draw Anything</h3>
                <p className="text-sm text-muted-foreground">Express your creativity with our intuitive drawing tools designed for both beginners and professionals.</p>
                <div className="pt-1">
                  <Link href="/features">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 -ml-2">
                      Learn more <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="group bg-card hover:bg-card/80 rounded-xl p-5 space-y-3 shadow-md hover:shadow-lg transition-all duration-300 border border-border/40">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Collaborate</h3>
                <p className="text-sm text-muted-foreground">Work with others in real-time to create amazing art with seamless sharing and editing capabilities.</p>
                <div className="pt-1">
                  <Link href="/features">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 -ml-2">
                      Learn more <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="group bg-card hover:bg-card/80 rounded-xl p-5 space-y-3 shadow-md hover:shadow-lg transition-all duration-300 border border-border/40">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Share Instantly</h3>
                <p className="text-sm text-muted-foreground">Share your creations with friends and colleagues with just one click to any platform.</p>
                <div className="pt-1">
                  <Link href="/features">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 -ml-2">
                      Learn more <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA section - more subtle and refined */}
          <div className="bg-gradient-to-br from-primary/15 via-primary/10 to-transparent p-7 rounded-xl shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold mb-3">Ready to unleash your creativity?</h2>
            <p className="text-base text-muted-foreground mb-5">Join thousands of creators and start drawing today.</p>
            <Link href="/signin">
              <Button size="lg" className="h-11 px-6 text-base font-medium rounded-lg">
                Start Creating Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}