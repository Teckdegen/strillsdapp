"use client"

import type { ReactNode } from "react"
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { flare } from "wagmi/chains"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import "@rainbow-me/rainbowkit/styles.css"

const config = getDefaultConfig({
  appName: "Strills",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_WALLET_CONNECT_PROJECT_ID",
  chains: [flare],
  ssr: true,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}