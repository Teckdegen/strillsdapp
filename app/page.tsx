"use client"

import { useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import DataSection from "@/components/sections/data-section"
import AirtimeSection from "@/components/sections/airtime-section"
import ElectricitySection from "@/components/sections/electricity-section"
import CableSection from "@/components/sections/cable-section"

type BillCategory = "data" | "airtime" | "electricity" | "cable"

export default function Home() {
  const { isConnected } = useAccount()
  const [activeCategory, setActiveCategory] = useState<BillCategory>("data")

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-transparent backdrop-blur-0 bg-transparent">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">S</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Strills</h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {!isConnected ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to Strills</CardTitle>
              <CardDescription>Pay your bills with USDT on the Flare blockchain</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-foreground/70 text-center max-w-md">
                Connect your wallet to get started with paying your utility bills securely and instantly.
              </p>
              <ConnectButton />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Category Selector */}
            <div className="flex gap-2 flex-wrap">
              {(["data", "airtime", "electricity", "cable"] as const).map((category) => (
                <Button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  variant={activeCategory === category ? "default" : "outline"}
                  className={`capitalize ${
                    activeCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "border-border/50 hover:bg-card/50"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Content Sections */}
            <div className="min-h-96">
              {activeCategory === "data" && <DataSection />}
              {activeCategory === "airtime" && <AirtimeSection />}
              {activeCategory === "electricity" && <ElectricitySection />}
              {activeCategory === "cable" && <CableSection />}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 backdrop-blur-sm bg-background/50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-foreground/50">
          <p>© 2025 Strills. Pay bills on-chain with confidence.</p>
        </div>
      </footer>
    </div>
  )
}
