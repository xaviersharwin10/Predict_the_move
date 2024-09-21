"use client";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig , http} from "wagmi";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import {
  mainnet,
  optimism,
  arbitrum,
  sepolia,
  optimismSepolia,
  arbitrumSepolia,
  
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();



// const config = getDefaultConfig({
//   appName: "Trend Sage",
//   projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "",
//   chains: [
//     mainnet,
//     optimism,
//     arbitrum,
//     sepolia,
//     optimismSepolia,
//     arbitrumSepolia,
//   ],
//   ssr: true, // If your dApp uses server side rendering (SSR)
// });

// export const config = createConfig({
//   chains: [mainnet, sepolia, ],
//  transports: {
//     [mainnet.id]: http(),
//     [sepolia.id]: http(),
//   },
// });

export const config = createConfig({
  chains: [{
    id: 22040, // AirDAO chain ID
    name: "airdao",
    rpcUrls: {
      default: {
        http: ["https://network.ambrosus-test.io"], // Array of RPC URLs
      },
      public: {
        http: ["https://network.ambrosus-test.io"], // Same for public RPC
      },
    },
    nativeCurrency: {
      name: "AMB",
      symbol: "AMB",
      decimals: 18,
    },
  }],
  transports: {
    22040: http(),
  },
});


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#111111",
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
