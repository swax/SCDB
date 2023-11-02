import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import ThemeRegistry from "./ThemeRegistry";
import ResponsiveAppBar from "./ResponsiveAppBar";
import { NextAuthProvider } from "./NextAuthProvider";
import { Container } from "@mui/material";

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
            <Container sx={{ marginTop: 1, paddingBottom: 4 }} maxWidth="lg">
              {children}
            </Container>
          </ThemeRegistry>
        </NextAuthProvider>
      </body>
    </html>
  );
}
