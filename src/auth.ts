import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    idToken?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.idToken = account.id_token;
      }

      return token;
    },
    async session({ session, token }) {
      if (typeof token.idToken === 'string') {
        session.idToken = token.idToken;
      }
      return session;
    },
  },
});
