"use client";

import { SessionProvider } from "next-auth/react";

type Props = {
  children?: React.ReactNode;
};

export const NextAuthProvider = ({ children }: Props) => {
  return (
    <SessionProvider
      // Re-fetch session every 60 minutes
      refetchInterval={60 * 60}
      // Re-fetches session when window is focused
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
};
