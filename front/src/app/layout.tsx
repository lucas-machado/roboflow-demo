import type { Metadata } from "next";
import "./globals.css";
import { DetectionProvider } from "@/context/DetectionContext";

export const metadata: Metadata = {
  title: "Roboflow Training Lab",
  description: "Next.js frontend for Roboflow Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DetectionProvider>
          {children}
        </DetectionProvider>
      </body>
    </html>
  );
}
