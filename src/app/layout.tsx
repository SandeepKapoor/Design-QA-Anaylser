import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

export const metadata: Metadata = {
  title: "Design QA Analyser | See exactly what changed",
  description: "Visual screenshot comparison and diff tool for design and QA teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${fraunces.variable} ${ibmPlexSans.variable} font-sans antialiased bg-background text-foreground selection:bg-accent-cyan/20`}
      >
        {children}
      </body>
    </html>
  );
}
