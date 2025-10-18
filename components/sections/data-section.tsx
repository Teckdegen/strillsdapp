"use client"

import { useState, useEffect } from "react"
import { useWalletClient, usePublicClient } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { parseUnits } from "ethers"
import { Wifi, Loader2 } from "lucide-react"
import { useApiCache } from "@/lib/utils/cache"
import { calculateTotalWithFee, calculateFeeAmount } from "@/lib/data/hardcoded-data"

interface DataPlan {
  id: string
  name: string
  amount: number
  ngnPrice: number
}

const USDT_ADDRESS = "0xD1B77E5BE43d705549E38a23b59CF5365f17E227"
const USDT_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
]

export default function DataSection() {
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [network, setNetwork] = useState("")
  const [plan, setPlan] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [rate, setRate] = useState<number>(1650)

  const {
    data: plansData,
    loading: loadingPlans,
    error: cacheError,
  } = useApiCache(
    "data-plans",
    async () => {
      const res = await fetch("/api/get/data-plans", { method: "POST" })
      if (!res.ok) throw new Error("Failed to fetch data plans")
      return res.json()
    },
    {
      pollInterval: 60000, // Changed to 1 minute polling
      fallbackData: {
        success: true,
        networks: ["MTN NG", "AIRTEL NG", "GLO NG", "9MOBILE"],
        plansByNetwork: {},
        allPlans: [],
      },
    },
  )

  const { data: rateData } = useApiCache(
    "rates",
    async () => {
      const res = await fetch("/api/rates")
      if (!res.ok) throw new Error("Failed to fetch rates")
      return res.json()
    },
    { pollInterval: 5000, fallbackData: { rate: 1650, success: true } },
  )

  useEffect(() => {
    if (rateData?.rate && rateData.rate > 0) {
      setRate(rateData.rate)
    }
  }, [rateData])

  const plans = network && plansData?.plansByNetwork?.[network] ? plansData.plansByNetwork[network] : []
  const networks = plansData?.networks || []

  const handlePay = async () => {
    if (!network) {
      setError("Please select a network")
      return
    }
    if (!plan) {
      setError("Please select a plan")
      return
    }
    if (!phone) {
      setError("Please enter your phone number")
      return
    }
    if (!walletClient) {
      setError("Please connect your wallet")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const selectedPlan = plans.find((p: DataPlan) => p.id === plan)
      if (!selectedPlan) throw new Error("Plan not found")

      const ngnAmount = selectedPlan.ngnPrice
      const feeAmount = calculateFeeAmount(ngnAmount)
      const totalNgnAmount = calculateTotalWithFee(ngnAmount)
      const usdAmount = totalNgnAmount / rate
      const usdtAmount = parseUnits(usdAmount.toFixed(6), 6)

      const treasuryAddress = (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "0xD1B77e5BE43D705549e38A23b59cf5365F17e227") as `0x${string}`

      if (!treasuryAddress) throw new Error("Treasury address not configured")

      const hash = await walletClient.writeContract({
        address: USDT_ADDRESS as `0x${string}`,
        abi: USDT_ABI,
        functionName: "transfer",
        args: [treasuryAddress, usdtAmount],
      })

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash })
      }

      const paymentRes = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "data",
          txHash: hash,
          userInputs: {
            network,
            planId: plan,
            phoneNumber: phone,
          },
          ngnAmount: ngnAmount,
          feeAmount: feeAmount,
          totalAmount: totalNgnAmount,
        }),
      })

      const paymentData = await paymentRes.json()
      if (!paymentRes.ok) throw new Error(paymentData.error)

      setSuccess(`Data purchased successfully! Token: ${paymentData.token}`)
      setNetwork("")
      setPlan("")
      setPhone("")
    } catch (err: any) {
      setError(err.message || "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-black/40 to-purple-950/40 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
      <CardHeader className="border-b border-purple-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Wifi className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-xl text-white">Buy Data</CardTitle>
            <CardDescription className="text-purple-300/70">Purchase data bundles for your phone</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-500/20 border border-green-500/50 text-green-300 rounded-lg backdrop-blur-sm">
            {success}
          </div>
        )}
        {cacheError && (
          <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 rounded-lg backdrop-blur-sm text-sm">
            {cacheError}
          </div>
        )}

        {loadingPlans ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="network" className="text-purple-300">
                Network
              </Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger
                  id="network"
                  className="bg-purple-950/30 border-purple-500/30 text-white hover:border-purple-500/50 transition-colors"
                >
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent className="bg-purple-950 border-purple-500/30">
                  {networks.length > 0 ? (
                    networks.map((net: string) => (
                      <SelectItem key={net} value={net} className="text-white hover:bg-purple-500/20">
                        {net}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled className="text-gray-400">
                      No networks available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan" className="text-purple-300">
                Plan
              </Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger
                  id="plan"
                  className="bg-purple-950/30 border-purple-500/30 text-white hover:border-purple-500/50 transition-colors"
                >
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent className="bg-purple-950 border-purple-500/30">
                  {plans.length > 0 ? (
                    plans.map((p: DataPlan) => (
                      <SelectItem key={p.id} value={p.id} className="text-white hover:bg-purple-500/20">
                        <div className="flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className="text-purple-300">₦{p.ngnPrice}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled className="text-gray-400">
                      No plans available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone" className="text-purple-300">
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-purple-950/30 border-purple-500/30 text-white placeholder:text-gray-500 hover:border-purple-500/50 transition-colors"
              />
            </div>
          </div>
        )}

        <Button
          onClick={handlePay}
          disabled={loading || !walletClient || loadingPlans}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </div>
          ) : (
            "Pay with USDT"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
