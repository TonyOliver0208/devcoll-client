import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "@/providers/nextauth-provider";
import QueryProvider from "@/providers/query-provider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AuthStatusDebug } from "@/components/auth/SessionInitializer";
import { LayoutController } from "@/components/layout/LayoutController";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "DevColl - Forum & Design Platform",
  description:
    "Find answers to your technical questions, help others, and create amazing designs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-stack">
        <ErrorBoundary>
          <NextAuthProvider>
            <QueryProvider>
              <LayoutController>
                {children}
              </LayoutController>
              <Toaster position="top-center" richColors />
              <AuthStatusDebug />
            </QueryProvider>
          </NextAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
