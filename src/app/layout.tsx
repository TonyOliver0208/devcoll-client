import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "@/providers/nextauth-provider";
import QueryProvider from "@/providers/query-provider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AuthStatusDebug } from "@/components/auth/SessionInitializer";

export const metadata: Metadata = {
  title: "DevColl - Forum For Dev Platform",
  description:
    "Find answers to your technical questions and help others answer theirs.",
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
              {children}
              <AuthStatusDebug />
            </QueryProvider>
          </NextAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
