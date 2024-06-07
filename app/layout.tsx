import { Container } from "@mui/material";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import ResponsiveAppBar from "./header/ResponsiveAppBar";
import { NextAuthProvider } from "./providers/NextAuthProvider";
import ThemeRegistry from "./providers/ThemeRegistry";

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
