import { Geist, Geist_Mono } from "next/font/google";
import "@repo/ui/globals.css"
import {Toaster} from "@repo/ui/components/toaster"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster/>
      </body>
    </html>
  );
}
