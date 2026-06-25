import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDB from "./mongodb";
import User from "../models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null | undefined;
      email?: string | null | undefined;
      image?: string | null | undefined;
    } & DefaultSession["user"];
  }
  interface User {
    _id: string;
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
  }
}

// @ts-ignore: next-auth/jwt module declaration
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDB();
        console.log("Authorize called with credentials:", { email: credentials?.email });
        const user = await User.findOne({ email: credentials?.email });
        console.log("Authorize user search result:", user ? { _id: user._id, email: user.email } : "null");
        if (!user) {
          console.log("Authorize: User not found");
          return null;
        }
        const passwordMatch = await bcrypt.compare(
          credentials?.password as string,
          user.password,
        );
        console.log("Authorize: Password match result:", passwordMatch);
        if (passwordMatch) {
          return {
            id: user._id.toString(),
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
          };
        }
        console.log("Authorize: Password mismatch");
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = (user as any).image;
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id as string;
        (session.user as any).name = token.name;
        (session.user as any).email = token.email;
        (session.user as any).image = token.image;
      }
      return session;
    },
  },
});
