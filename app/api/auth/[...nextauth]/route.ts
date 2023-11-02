import prisma from "@/database/prisma";
import ProcessEnv from "@/shared/ProcessEnv";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
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
    jwt({ token /*, account*/ }) {
      // Persist the OAuth access_token to the token right after signin
      /*if (account) {
                console.log('jwt callback', account.access_token);
                token.accessToken = account.access_token
            }*/
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
        }
        // If session is pulled from JWT
        else if (token && token.sub) {
          session.user.id = token.sub;
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
});

export { handler as GET, handler as POST };
