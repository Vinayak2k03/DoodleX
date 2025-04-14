"use client";

import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { ArrowRight, Share2, Users, Sparkles, ChevronRight, PenTool } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  // To handle initial animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-b from-background via-background to-background/90">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/5 mix-blend-multiply blur-3xl animate-pulse"></div>
        <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] rounded-full bg-primary/10 mix-blend-multiply blur-3xl opacity-80"></div>
        <div className="absolute bottom-0 left-[30%] w-[500px] h-[500px] rounded-full bg-secondary/5 mix-blend-multiply blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-primary/5 mix-blend-multiply blur-2xl opacity-70"></div>
        
        {/* Decorative floating elements */}
        {mounted && (
          <>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.7, scale: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="absolute top-[15%] left-[15%] w-5 h-5 bg-primary/30 rounded-full"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ duration: 3, delay: 1, repeat: Infinity, repeatType: "reverse" }}
              className="absolute top-[60%] right-[25%] w-3 h-3 bg-secondary/40 rounded-full"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.6, y: -10 }}
              transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="absolute bottom-[30%] left-[20%] w-4 h-4 bg-primary/20 rounded-full"
            />
          </>
        )}
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16 md:py-24">
        {mounted ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl text-center space-y-16 w-full"
          >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="space-y-6">
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center px-5 py-2.5 bg-primary/10 rounded-full text-sm font-medium shadow-inner backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-4 w-4 mr-2 text-primary animate-pulse" />
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Introducing the future of collaborative drawing
                </span>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/60">
                  Doodle<span className="text-foreground">X</span>
                </span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-xl md:text-2xl text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed"
              >
                Create, collaborate, and share stunning drawings in real-time with anyone around the world.
              </motion.p>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-5 justify-center mt-8"
              >
                <Link href="/signin">
                  <Button 
                    size="lg" 
                    variant="default" 
                    className="h-14 px-8 text-base font-medium rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90"
                  >
                    <motion.div 
                      className="flex items-center" 
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.div>
                  </Button>
                </Link>
                <Link href='/signup'>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-14 px-8 text-base font-medium rounded-xl hover:bg-primary/5 border-primary/20 transition-all duration-300"
                  >
                    <motion.div 
                      className="flex items-center" 
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      Sign Up <ChevronRight className="ml-1 h-5 w-5" />
                    </motion.div>
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Feature Section */}
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent h-[1px] -z-10"></div>
              
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 pb-8"
              >
                {/* First Feature Card */}
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
                  className="group bg-gradient-to-b from-card/70 to-card/90 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xl hover:shadow-2xl transition-all duration-500 border border-border/30"
                >
                  <div className="bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-2 shadow-inner group-hover:shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <PenTool className="h-8 w-8 text-primary/90" />
                  </div>
                  <h3 className="font-semibold text-xl text-foreground/90">Draw Anything</h3>
                  <p className="text-muted-foreground leading-relaxed">Express your creativity with our intuitive drawing tools designed for both beginners and professionals.</p>
                  <div className="pt-1">
                    <Link href="/features">
                      <Button variant="ghost" size="sm" className="group/button text-primary hover:text-primary hover:bg-primary/10 -ml-2">
                        <motion.span 
                          className="flex items-center"
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          Learn more <ChevronRight className="ml-1 h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
                        </motion.span>
                      </Button>
                    </Link>
                  </div>
                </motion.div>

                {/* Second Feature Card */}
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
                  className="group bg-gradient-to-b from-card/70 to-card/90 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xl hover:shadow-2xl transition-all duration-500 border border-border/30"
                >
                  <div className="bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-2 shadow-inner group-hover:shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-primary/90" />
                  </div>
                  <h3 className="font-semibold text-xl text-foreground/90">Collaborate</h3>
                  <p className="text-muted-foreground leading-relaxed">Work with others in real-time to create amazing art with seamless sharing and editing capabilities.</p>
                  <div className="pt-1">
                    <Link href="/features">
                      <Button variant="ghost" size="sm" className="group/button text-primary hover:text-primary hover:bg-primary/10 -ml-2">
                        <motion.span 
                          className="flex items-center"
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          Learn more <ChevronRight className="ml-1 h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
                        </motion.span>
                      </Button>
                    </Link>
                  </div>
                </motion.div>

                {/* Third Feature Card */}
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
                  className="group bg-gradient-to-b from-card/70 to-card/90 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xl hover:shadow-2xl transition-all duration-500 border border-border/30"
                >
                  <div className="bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-2 shadow-inner group-hover:shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <Share2 className="h-8 w-8 text-primary/90" />
                  </div>
                  <h3 className="font-semibold text-xl text-foreground/90">Share Instantly</h3>
                  <p className="text-muted-foreground leading-relaxed">Share your creations with friends and colleagues with just one click to any platform.</p>
                  <div className="pt-1">
                    <Link href="/features">
                      <Button variant="ghost" size="sm" className="group/button text-primary hover:text-primary hover:bg-primary/10 -ml-2">
                        <motion.span 
                          className="flex items-center"
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          Learn more <ChevronRight className="ml-1 h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
                        </motion.span>
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* CTA Section */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="bg-gradient-to-br from-primary/15 via-primary/10 to-transparent p-10 rounded-2xl shadow-2xl border border-primary/10 backdrop-blur-sm"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-2xl sm:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
              >
                Ready to unleash your creativity?
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-lg text-muted-foreground/90 max-w-2xl mx-auto mb-8"
              >
                Join thousands of creators and start drawing today. No special skills required.
              </motion.p>
              <motion.div variants={itemVariants}>
                <Link href="/signin">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-base font-medium rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
                  >
                    <motion.div 
                      className="flex items-center" 
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      Start Creating Now <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.div>
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-screen w-full">
            <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {/* Footer Accent */}
      {mounted && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      )}
    </div>
  );
}