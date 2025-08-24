import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "@/providers/nextauth-provider";

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
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
