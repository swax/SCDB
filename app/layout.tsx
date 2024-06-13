import { Container } from "@mui/material";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import ResponsiveAppBar from "./header/ResponsiveAppBar";
import { NextAuthProvider } from "./providers/NextAuthProvider";
import ThemeRegistry from "./providers/ThemeRegistry";

export const metadata: Metadata = {
  title: "SketchTV.lol",
  description: "The Sketch Comedy Database",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDevelopment = process.env.NODE_ENV === "development";
  return (
    <html lang="en">
      <head>
        {!isDevelopment && (
          <>
            <Script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-ZPKZL2PP9B"
            />
            <Script
              id="gtag"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag() {
                      dataLayer.push(arguments);
                  }
                  gtag("js", new Date());

                  gtag("config", "G-ZPKZL2PP9B");
                  `,
              }}
            />
          </>
        )}
      </head>
      <body className="bodyColor">
        <NextAuthProvider>
          <ThemeRegistry options={{ key: "mui" }}>
            <ResponsiveAppBar />
            <Container sx={{ marginTop: 1, paddingBottom: 4 }} maxWidth="md">
              {children}
            </Container>
          </ThemeRegistry>
        </NextAuthProvider>
      </body>
    </html>
  );
}
