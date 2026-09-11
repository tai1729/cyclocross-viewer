import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FeedbackEntry } from "@/components/feedback/FeedbackEntry";
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
  title: "AJOCCラップタイムビューア",
  description: "AJOCCシクロクロス ラップタイム比較ビューア",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          <header>
            <FeedbackEntry />
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
