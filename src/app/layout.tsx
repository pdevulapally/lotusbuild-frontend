import type { Metadata } from "next";
import "@fontsource/libre-caslon-condensed/latin-500.css";
import "@fontsource-variable/public-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "LotusBuild — Your ideas. Real software.",
  description:
    "A cloud workspace for agencies, first-time builders, and developers. Build software with AI, code, and a desktop in one place.",
  robots: { index: false, follow: false },
  icons: { icon: "/brand/lotusbuild-icon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
