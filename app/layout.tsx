import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "NewsForge",
  description: "AI-assisted news aggregation from trusted APIs and RSS feeds."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <Nav />
          <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
