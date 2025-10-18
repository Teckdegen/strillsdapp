"use client"

import { useState } from "react"
import { useWalletClient, usePublicClient } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { parseUnits } from "ethers"
import { Tv, Loader2 } from "lucide-react"
import { useApiCache } from "@/lib/utils/cache"
import { calculateTotalWithFee, calculateFeeAmount } from "@/lib/data/hardcoded-data"

interface CableProvider {
  id: string
  name: string
  code?: string
}

interface CablePlan {
  id: string
  name: string
  ngnPrice: number
  amount?: number
  provider?: string
}

const USDT_ADDRESS = "0x1D80c49BbBCd1C0911346356b529d0b91cb5d4a9"
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

export default function CableSection() {
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [provider, setProvider] = useState("")
  const [plan, setPlan] = useState("")
  const [smartcard, setSmartcard] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [customerName, setCustomerName] = useState("")

  const { data: cableData, loading: loadingPlans } = useApiCache(
    "cable-plans",
    async () => {
      const res = await fetch("/api/get/cable-plans", { method: "POST" })
      if (!res.ok) throw new Error("Failed to fetch plans")
      return res.json()
    },
    {
      pollInterval: 60000, // Changed to 1 minute polling
      fallbackData: {
        success: false,
        providers: [
          { id: "dstv", name: "DStv", code: "dstv" },
          { id: "startimes", name: "Startimes", code: "Startimes" },
        ],
        plans: [],
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
    { pollInterval: 5000, fallbackData: { rate: 1 } },
  )

  const providers = cableData?.providers || []
  const plans = cableData?.plans || []
  const rate = rateData?.rate || 1

  const handleVerifySmartcard = async () => {
    if (!provider || !smartcard) {
      setError("Please select provider and enter smartcard number")
      return
    }

    setVerifying(true)
    setError("")

    try {
      const verifyRes = await fetch("/api/verify/smartcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smartCardNumber: smartcard,
          providerCode: provider,
        }),
      })

      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error)

      setCustomerName(verifyData.customerName)
    } catch (err: any) {
      setError(err.message || "Verification failed")
    } finally {
      setVerifying(false)
    }
  }

  const handlePay = async () => {
    if (!provider || !plan || !smartcard || !walletClient) {
      setError("Please fill all fields and connect wallet")
      return
    }

    if (!customerName) {
      setError("Please verify smartcard first")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const selectedPlan = plans.find((p: CablePlan) => p.id === plan)
      if (!selectedPlan) throw new Error("Plan not found")

      const ngnAmount = selectedPlan.ngnPrice || selectedPlan.amount || 0
      const feeAmount = calculateFeeAmount(ngnAmount)
      const totalNgnAmount = calculateTotalWithFee(ngnAmount)
      const usdAmount = totalNgnAmount / rate
      const usdtAmount = parseUnits(usdAmount.toFixed(6), 6)

      const treasuryAddress = (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "0xD1B77E5BE43d705549E38a23b59CF5365f17E227") as `0x${string}`

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
          category: "cable",
          txHash: hash,
          userInputs: {
            provider,
            planId: plan,
            smartCardNumber: smartcard,
          },
          ngnAmount: ngnAmount,
          feeAmount: feeAmount,
          totalAmount: totalNgnAmount,
        }),
      })

      const paymentData = await paymentRes.json()
      if (!paymentRes.ok) throw new Error(paymentData.error)

      setSuccess(`Cable subscription renewed! Reference: ${paymentData.reference}`)
      setProvider("")
      setPlan("")
      setSmartcard("")
      setCustomerName("")
    } catch (err: any) {
      setError(err.message || "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  const filteredPlans = plans.filter((p: CablePlan) => !p.provider || p.provider === provider)

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-black/40 to-purple-950/40 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
      <CardHeader className="border-b border-purple-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Tv className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-xl text-white">Pay Cable TV</CardTitle>
            <CardDescription className="text-purple-300/70">Renew your cable TV subscription</CardDescription>
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

        {loadingPlans ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider" className="text-purple-300">
                Provider
              </Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger
                  id="provider"
                  className="bg-purple-950/30 border-purple-500/30 text-white hover:border-purple-500/50 transition-colors"
                >
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent className="bg-purple-950 border-purple-500/30">
                  {providers.length > 0 ? (
                    providers.map((prov: CableProvider) => (
                      <SelectItem key={prov.id} value={prov.id} className="text-white hover:bg-purple-500/20">
                        {prov.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled className="text-gray-400">
                      No providers available
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
                  {filteredPlans.length > 0 ? (
                    filteredPlans.map((p: CablePlan) => (
                      <SelectItem key={p.id} value={p.id} className="text-white hover:bg-purple-500/20">
                        <div className="flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className="text-purple-300">₦{p.ngnPrice || p.amount}</span>
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
              <Label htmlFor="smartcard" className="text-purple-300">
                SmartCard Number
              </Label>
              <div className="flex gap-2">
                <Input
                  id="smartcard"
                  placeholder="Enter smartcard number"
                  value={smartcard}
                  onChange={(e) => setSmartcard(e.target.value)}
                  className="bg-purple-950/30 border-purple-500/30 text-white placeholder:text-gray-500 hover:border-purple-500/50 transition-colors"
                />
                <Button
                  onClick={handleVerifySmartcard}
                  disabled={verifying || !provider || !smartcard}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4"
                >
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                </Button>
              </div>
              {customerName && <p className="text-sm text-green-400">✓ Customer: {customerName}</p>}
            </div>
          </div>
        )}

        <Button
          onClick={handlePay}
          disabled={loading || !walletClient || !customerName || loadingPlans}
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
