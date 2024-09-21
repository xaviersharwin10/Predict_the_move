"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ModeToggle } from "@/components/ui/mode-toggle";
import Image from "next/image";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-start p-10">
      <div className="absolute top-5 right-12 mr-5">
        <ConnectButton />
      </div>
      <div className="absolute top-5 right-5">
        <ModeToggle />
      </div>
      <div className="absolute top-5 left-5 flex flex-row items-center rounded-md p-2">
        <Image
          className="relative rounded-md"
          src="/logo.gif"
          alt="Logo"
          width={40}
          height={40}
          priority
        />
        <div className="px-5 mb-1">
          <div className="text-2xl font-londrina font-bold">Trend Sage</div>
          {/* <div className="text-lg ">this app does something</div> */}
        </div>
      </div>

      <section className="lg:w-full min-h-[400px] flex flex-col items-start py-24">
        <div className="flex flex-col w-full">
          <div className="w-full">{children}</div>
        </div>
      </section>

      <section className="mt-10  bottom-12">
        <h3 className="text-md ml-5 text-zinc-600 mb-1">Trend Sage - 2024</h3>
      </section>
    </main>
  );
}
