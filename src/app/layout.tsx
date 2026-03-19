import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "龙虾解吐槽",
  description: "AI 吐槽大会 - 你的吐槽，是别人的商机",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
