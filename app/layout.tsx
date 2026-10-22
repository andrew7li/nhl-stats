import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SportsHub",
    template: "%s · SportsHub",
  },
  description: "Aggregated sports stats for the NHL, NBA and NFL.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-muted sm:px-6">
            SportsHub aggregates public data from the NHL API and
            hockeystats.com. Not affiliated with any league.
          </div>
        </footer>
      </body>
    </html>
  );
}
