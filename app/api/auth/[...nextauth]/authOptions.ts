/**
 * This was made it's own file so that it can be imported into server actions for authentication
 */

import { getAccount } from "@/backend/accountService";
import prisma from "@/database/prisma";
import ProcessEnv from "@/shared/ProcessEnv";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

const authOptions = {
  // x@ts-expect-errorx - https://github.com/nextauthjs/next-auth/issues/9493
  adapter: PrismaAdapter(prisma) as Adapter, // Force cast due to small type mismatch
  providers: [
    GoogleProvider({
      clientId: ProcessEnv.GOOGLE_CLIENT_ID,
      clientSecret: ProcessEnv.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // Using jwt for sessions prevents many calls to the database per request
  session: { strategy: "jwt" },
  secret: ProcessEnv.NEXTAUTH_SECRET,
  debug: ProcessEnv.NODE_ENV !== "production",
  callbacks: {
    async jwt({ token, trigger }) {
      // Triggered from the client side useSession().update()
      if (trigger == "update" && token.sub) {
        const account = await getAccount(token.sub);

        if (account?.username) {
          token.username = account?.username;
        }
      }

      return token;
    },
    session({ session, user, token }) {
      // Make user id available from useSession
      if (session.user) {
        // Avoid sendng personal info to the client unless we have to
        session.user.email = undefined;
        session.user.name = undefined;
        session.user.image = undefined;

        // If session is pulled from database
        if (user) {
          session.user.id = user.id;
          console.log("SESSION PULLED FROM DATABASE", user);
        }
        // If session is pulled from JWT
        else if (token && token.sub) {
          session.user.id = token.sub;
          session.user.username = token.username as string;
        }
      }
      return session;
    },
    /*async redirect({ url, baseUrl }) {
              console.log('redirect url', url);
              console.log('redirect baseUrl', baseUrl);
              return url.startsWith(baseUrl) ? url : baseUrl
          }*/
  },
} satisfies AuthOptions;

export default authOptions;
