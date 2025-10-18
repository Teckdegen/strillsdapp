"use client"

import { useState } from "react"
import { useWalletClient, usePublicClient } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { parseUnits } from "ethers"
import { Zap, Loader2 } from "lucide-react"
import { useApiCache } from "@/lib/utils/cache"
import { calculateTotalWithFee, calculateFeeAmount } from "@/lib/data/hardcoded-data"

interface ElectricityDisco {
  id: string
  name: string
  code?: string
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

export default function ElectricitySection() {
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [disco, setDisco] = useState("")
  const [meterType, setMeterType] = useState("")
  const [meterNumber, setMeterNumber] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [customerName, setCustomerName] = useState("")

  const { data: discoData, loading: loadingPlans } = useApiCache(
    "electricity-plans",
    async () => {
      const res = await fetch("/api/get/electricity-plans", { method: "POST" })
      if (!res.ok) throw new Error("Failed to fetch plans")
      return res.json()
    },
    {
      pollInterval: 60000, // Changed to 1 minute polling
      fallbackData: {
        success: false,
        providers: [
          { id: "eko-electric", name: "Eko (EKEDC)", code: "eko-electric" },
          { id: "ikeja-electric", name: "Ikeja (IKEDC)", code: "ikeja-electric" },
          { id: "abuja-electric", name: "Abuja (AEDC)", code: "abuja-electric" },
          { id: "enugu-electric", name: "Enugu (EEDC)", code: "enugu-electric" },
        ],
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

  const discos = discoData?.providers || []
  const rate = rateData?.rate || 1

  const handleVerifyMeter = async () => {
    if (!disco || !meterNumber || !meterType) {
      setError("Please select DISCO, meter type and enter meter number")
      return
    }

    setVerifying(true)
    setError("")

    try {
      const verifyRes = await fetch("/api/verify/meter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meterNumber,
          providerCode: disco,
          providerPlanCode: meterType,
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
    if (!disco || !meterType || !meterNumber || !customAmount || !phone || !walletClient) {
      setError("Please fill all fields and connect wallet")
      return
    }

    if (!customerName) {
      setError("Please verify meter first")
      return
    }

    const amount = Number.parseFloat(customAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const ngnAmount = amount
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
          category: "electricity",
          txHash: hash,
          userInputs: {
            disco,
            meterType,
            meterNumber,
            phoneNumber: phone,
            amount: ngnAmount,
          },
          ngnAmount: ngnAmount,
          feeAmount: feeAmount,
          totalAmount: totalNgnAmount,
        }),
      })

      const paymentData = await paymentRes.json()
      if (!paymentRes.ok) throw new Error(paymentData.error)

      setSuccess(`Electricity bill paid successfully! Token: ${paymentData.token}`)
      setDisco("")
      setMeterType("")
      setMeterNumber("")
      setCustomAmount("")
      setPhone("")
      setCustomerName("")
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
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-xl text-white">Pay Electricity Bill</CardTitle>
            <CardDescription className="text-purple-300/70">Pay your electricity bill instantly</CardDescription>
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
              <Label htmlFor="disco" className="text-purple-300">
                DISCO
              </Label>
              <Select value={disco} onValueChange={setDisco}>
                <SelectTrigger
                  id="disco"
                  className="bg-purple-950/30 border-purple-500/30 text-white hover:border-purple-500/50 transition-colors"
                >
                  <SelectValue placeholder="Select DISCO" />
                </SelectTrigger>
                <SelectContent className="bg-purple-950 border-purple-500/30">
                  {discos.map((d: ElectricityDisco) => (
                    <SelectItem key={d.id} value={d.code || d.id} className="text-white hover:bg-purple-500/20">
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meterType" className="text-purple-300">
                Meter Type
              </Label>
              <Select value={meterType} onValueChange={setMeterType}>
                <SelectTrigger
                  id="meterType"
                  className="bg-purple-950/30 border-purple-500/30 text-white hover:border-purple-500/50 transition-colors"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-purple-950 border-purple-500/30">
                  <SelectItem value="prepaid" className="text-white hover:bg-purple-500/20">
                    Prepaid
                  </SelectItem>
                  <SelectItem value="postpaid" className="text-white hover:bg-purple-500/20">
                    Postpaid
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meterNumber" className="text-purple-300">
                Meter Number
              </Label>
              <div className="flex gap-2">
                <Input
                  id="meterNumber"
                  placeholder="Enter meter number"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value)}
                  className="bg-purple-950/30 border-purple-500/30 text-white placeholder:text-gray-500 hover:border-purple-500/50 transition-colors"
                />
                <Button
                  onClick={handleVerifyMeter}
                  disabled={verifying || !disco || !meterNumber || !meterType}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4"
                >
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                </Button>
              </div>
              {customerName && <p className="text-sm text-green-400">✓ Customer: {customerName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-purple-300">
                Amount (NGN)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount in NGN"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="bg-purple-950/30 border-purple-500/30 text-white placeholder:text-gray-500 hover:border-purple-500/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
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
