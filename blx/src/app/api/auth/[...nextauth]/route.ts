import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { DefaultSession } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "login-by-username-credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username) {
          return null;
        }

        // TODO: Add your authentication logic here
        // This is a placeholder that accepts any username
        return {
          id: credentials.username,
          name: credentials.username,
          email: `${credentials.username}@example.com`
        };
      }
    })
  ],
  pages: {
    signIn: "/admin-login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-this-in-production",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

declare module "next-auth" {
  interface User {
    id?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
