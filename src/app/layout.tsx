import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import ThemeProvider from "@/components/theme-provider";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";
import { Button } from "@/components/ui/button";
import { dark } from "@clerk/themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NeuCode",
  description: "An Ai-powered web code editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
    appearance={{
      theme: dark,
    }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${ibmPlexMono.variable} antialiased`}
        >
          <ThemeProvider
            enableSystem={true}
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <Button>Sign Up</Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>

            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
