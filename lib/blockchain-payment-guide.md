# Strills Blockchain Payment System - Complete Guide

## Overview
Strills uses USDT (Tether) on the Flare blockchain for all bill payments. The system ensures secure, transparent, and verifiable transactions.

## Payment Flow

### 1. User Initiates Payment
- User selects a bill service (Data, Airtime, Electricity, Cable TV)
- User enters required details (phone number, meter number, etc.)
- User enters custom amount (for Airtime/Electricity) or selects a plan
- User clicks "Pay with USDT"

### 2. Wallet Connection & Verification
- RainbowKit prompts user to connect their wallet (MetaMask, WalletConnect, etc.)
- User approves the connection
- System verifies wallet is connected to Flare network

### 3. USDT Transfer (Blockchain Transaction)
\`\`\`
Transaction Details:
- Token: USDT (0x1D80c49BbBCd1C0911346356b529d0b91cb5d4a9)
- Network: Flare Mainnet
- Function: transfer()
- Recipient: Treasury Address (NEXT_PUBLIC_TREASURY_ADDRESS)
- Amount: NGN Amount ÷ Current Exchange Rate = USD Amount (converted to USDT with 6 decimals)

Example:
- User wants to buy ₦5,000 worth of data
- Current rate: 1 USD = ₦1,500
- USD Amount: 5,000 ÷ 1,500 = 3.33 USD
- USDT Amount: 3.33 × 10^6 = 3,330,000 (in smallest unit)
\`\`\`

### 4. Transaction Confirmation
- User approves the transaction in their wallet
- Transaction is broadcast to Flare network
- System polls Flare RPC to confirm transaction receipt
- Once confirmed (transaction hash received), system proceeds to step 5

### 5. Backend Payment Processing
After blockchain confirmation, the system calls the Peyflex bill API with:
\`\`\`json
{
  "category": "data|airtime|electricity|cable",
  "txHash": "0x...",
  "userInputs": {
    "network": "MTN",
    "phoneNumber": "08012345678",
    "planId": "plan_123",
    "amount": 5000
  },
  "ngnAmount": 5000
}
\`\`\`

### 6. Bill Execution
- Your backend receives the payment confirmation
- Your backend executes the bill purchase through Peyflex API (sends data, airtime, etc.)
- Your backend returns confirmation with token/reference

### 7. User Confirmation
- User sees success message with token/reference
- User can use this token to verify their purchase

## Blockchain Verification

### How It Works
1. **Transaction Hash**: Every USDT transfer generates a unique transaction hash (txHash)
2. **RPC Polling**: System polls Flare RPC endpoint to verify transaction receipt
3. **Confirmation**: Once receipt is found, transaction is confirmed on-chain
4. **Immutability**: Transaction is permanently recorded on Flare blockchain

### Verification Process
\`\`\`typescript
// System polls Flare RPC with:
const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

// Receipt contains:
{
  transactionHash: "0x...",
  blockNumber: 12345,
  blockHash: "0x...",
  from: "0x...",
  to: "0x...",
  status: "success" | "reverted",
  gasUsed: 50000,
  cumulativeGasUsed: 1000000,
  contractAddress: null,
  logs: [...],
  logsBloom: "0x...",
  type: 2,
  transactionIndex: 5,
  confirmations: 10
}
\`\`\`

### Why Blockchain Verification Matters
- **Immutable Record**: Transaction cannot be reversed or modified
- **Transparent**: Anyone can verify the transaction on Flare blockchain
- **Secure**: Cryptographically signed by user's private key
- **Auditable**: Complete transaction history available on-chain

## Caching System

### 1-Minute Polling with Fallback
The system implements intelligent caching to handle API failures:

\`\`\`typescript
// Each API call is cached with 1-minute polling
useApiCache(
  "data-plans",
  async () => {
    const res = await fetch("/api/get/data-plans", { method: "POST" })
    return res.json()
  },
  { pollInterval: 60000, fallbackData: {...} }
)
\`\`\`

### Fallback Behavior
1. **First Call**: Fetches fresh data from Peyflex API
2. **Success**: Stores data in cache, displays to user
3. **Failure**: Uses previously cached data (if available)
4. **No Cache**: Uses fallback data (empty structures)
5. **Retry**: Automatically retries every 1 minute

### Benefits
- **Resilience**: App works even if API is temporarily down
- **Performance**: Cached data loads instantly
- **User Experience**: No blank screens or loading states
- **Automatic Recovery**: Retries every 1 minute until API recovers

## Security Considerations

### Private Keys
- User's private key never leaves their wallet
- Strills never has access to user's private key
- All transactions are signed by user's wallet

### USDT Approval
- User must approve USDT transfer in their wallet
- User can see exact amount before confirming
- Transaction can be rejected at any time

### Treasury Address
- All USDT transfers go to configured treasury address
- Treasury address is controlled by Strills team
- Address is immutable once set in environment variables

### Rate Conversion
- Exchange rates are fetched from CoinGecko API
- Rates are cached and updated every 5 seconds
- User sees exact NGN to USD conversion before payment

## Error Handling

### Common Errors & Solutions

**"Treasury address not configured"**
- Solution: Set NEXT_PUBLIC_TREASURY_ADDRESS in environment variables

**"Wallet not connected"**
- Solution: Click "Connect Wallet" button and approve connection

**"Insufficient USDT balance"**
- Solution: User needs to have enough USDT in their wallet

**"Network mismatch"**
- Solution: Ensure wallet is connected to Flare network

**"API call failed"**
- Solution: System uses cached data; API will retry every 1 minute

## Testing

### Test Transactions
1. Connect wallet with test USDT
2. Select any bill service
3. Enter test details
4. Approve transaction in wallet
5. Wait for blockchain confirmation
6. Verify transaction on Flare Explorer: https://flare-explorer.flare.network/

### Monitoring
- Check browser console for [v0] debug logs
- Monitor Flare RPC calls in Network tab
- Verify transaction hash on Flare Explorer

## Environment Variables Required

\`\`\`
NEXT_PUBLIC_TREASURY_ADDRESS=0x...
NEXT_PUBLIC_FLARE_RPC_URL=https://flare-api.flare.network/ext/C/rpc
NEXT_PUBLIC_COINGECKO_API_URL=https://api.coingecko.com/api/v3
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
PEYFLEX_API_KEY=your_peyflex_api_key
\`\`\`

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify all environment variables are set
3. Ensure wallet is connected to Flare network
4. Check Flare Explorer for transaction status
5. Contact support with transaction hash for investigation