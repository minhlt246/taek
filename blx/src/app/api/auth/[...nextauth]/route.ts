import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { authApi } from "@/services/api/auth";

const providers = [
  CredentialsProvider({
    id: "login-by-username-password",
    name: "Credentials",
    credentials: {
      username: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.username || !credentials?.password) return null;

      // Trim whitespace from email and password
      const email = credentials.username.trim();
      const password = credentials.password.trim();

      if (!email || !password) {
        console.error("[NextAuth] Empty email or password after trim");
        throw new Error("auth.invalidCredentials");
      }

      try {
        console.log("[NextAuth] Attempting login:", {
          email: email.substring(0, 10) + "...",
          passwordLength: password.length,
        });

        // Use authApi from services/api/auth.ts
        const data = await authApi.login({ email, password });

        if (!data?.success) {
          console.error("[NextAuth] Response missing success flag:", data);
          const message = data?.message || "auth.loginFailed";
          throw new Error(message);
        }

        if (!data?.data?.user) {
          console.error("[NextAuth] Response missing user data:", {
            hasData: !!data?.data,
            dataKeys: data?.data ? Object.keys(data.data) : [],
            fullData: data,
          });
          const message = data?.message || "auth.loginFailed";
          throw new Error(message);
        }

        const user = {
          ...data.data.user,
          accessToken: data.data.token || "",
        } as any;

        console.log("[NextAuth] User object created:", {
          id: user.id,
          email: user.email,
          hasAccessToken: !!user.accessToken,
        });

        return user;
      } catch (err: any) {
        // Handle axios errors
        if (err?.response) {
          const status = err.response.status;
          const backendMessage = err.response?.data?.message || "";

          if (status === 401) {
            if (
              backendMessage.toLowerCase().includes("invalid") ||
              backendMessage.toLowerCase().includes("email") ||
              backendMessage.toLowerCase().includes("password") ||
              backendMessage.toLowerCase().includes("unauthorized")
            ) {
              throw new Error("auth.invalidCredentials");
            }
            throw new Error("auth.invalidCredentials");
          }
          throw new Error("auth.loginFailed");
        }

        // Handle network errors
        if (
          err?.code === "ECONNREFUSED" ||
          err?.code === "ENOTFOUND" ||
          err?.code === "ETIMEDOUT" ||
          err?.message?.includes("Network Error") ||
          err?.message?.includes("ECONNREFUSED") ||
          err?.message?.includes("network")
        ) {
          console.error("[NextAuth] Network error:", err.message);
          throw new Error("auth.networkError");
        }

        // Handle auth errors
        if (err?.message?.startsWith("auth.")) {
          console.log("[NextAuth] Auth error:", err.message);
          throw err;
        }

        // Other errors
        console.error("[NextAuth] Unexpected error:", {
          name: err?.name,
          message: err?.message,
        });
        throw new Error("auth.loginFailed");
      }
    },
  }),
];

// Add Google provider only if env is set to prevent runtime errors
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      id: "google-oauth",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }) as any
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: providers as any,
  pages: {
    signIn: "/(auth)/login",
    error: "/api/auth/error", // NextAuth default; your UI handles res.error with redirect: false
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // From credentials or google, prefer user fields if present
      if (user) {
        token.user = user as any;
        token.accessToken = (user as any).accessToken || token.accessToken;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose in the shape your UI expects
      (session as any).user = token.user || session.user;
      (session as any).user.accessToken =
        token.accessToken || (session as any).user?.accessToken || "";
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
