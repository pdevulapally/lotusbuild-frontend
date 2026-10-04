import type { Metadata } from "next";
import localFont from "next/font/local";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const libreCaslon = localFont({
  variable: "--font-libre-caslon",
  src: [
    { path: "./fonts/LibreCaslonCondensed-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/LibreCaslonCondensed-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/LibreCaslonCondensed-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LotusBuild",
  description:
    "Describe a project, give an AI agent a task, and follow its progress in an isolated sandbox.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${libreCaslon.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
