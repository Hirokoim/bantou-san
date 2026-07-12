import type { Metadata } from "next";
import { BIZ_UDPGothic, Shippori_Mincho_B1 } from "next/font/google";
import "./globals.css";

const bizUdpGothic = BIZ_UDPGothic({
  variable: "--font-biz-udpgothic",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const shipporiMincho = Shippori_Mincho_B1({
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  weight: ["600", "800"],
});

export const metadata: Metadata = {
  title: "番頭さん",
  description: "マンション管理組合のお知らせを、番頭さんにお任せ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${bizUdpGothic.variable} ${shipporiMincho.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
