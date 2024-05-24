import { Container } from "@mui/material";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextAuthProvider } from "./NextAuthProvider";
import ResponsiveAppBar from "./header/ResponsiveAppBar";
import ThemeRegistry from "./ThemeRegistry";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SketchTV.lol",
  description: "Sketch Comedy Database",
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
  return (
    <html lang="en">
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
