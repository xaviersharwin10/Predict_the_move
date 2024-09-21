import Providers from "@/components/Providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Londrina_Solid } from '@next/font/google';
import { PT_Sans} from 'next/font/google'; // Import PT Root UI

const inter = Inter({ subsets: ["latin"] });

const londrinaSolid = Londrina_Solid({
  weight: ['100', '300', '400', '900'],
  subsets: ['latin'],
  display: 'swap',
});

// Importing PT Root UI font
const ptsans = PT_Sans({
  weight: ['400', '700'], // Specify the available weights
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Trend Sage",
  description: "This app does some prediction",
  icons: ["/logo.gif"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` ${ptsans.className} ${inter.className} dark:bg-black -z-50 bg-gray-50 `}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
