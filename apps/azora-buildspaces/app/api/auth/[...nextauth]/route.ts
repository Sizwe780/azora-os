import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // GitHubProvider would go here for production
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "azora" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Dev-only mock auth for "No Mock Protocol" transition
        // In production, this would verify against the database
        if (credentials?.username === "azora" && credentials?.password === "admin") {
          return {
            id: "user_1",
            name: "Azora Admin",
            email: "admin@azora.world",
            image: "/avatars/elara.png"
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // Inject Organization ID (Mock for now, would fetch from DB)
        // This enables multi-tenant workspace logic
        (session.user as any).organizationId = "org_default";
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/login',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
