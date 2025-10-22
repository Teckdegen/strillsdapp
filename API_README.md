# API Documentation

This document outlines all the API endpoints used in the Strills DApp, including their purposes, usage locations, and functionality.

## Base Configuration

### Bill Payment API
- **Base URL**: `https://client.peyflex.com.ng`
- **HTTP Client**: Axios HTTP client
- **Authentication**: Token-based using `PEYFLEX_API_KEY` environment variable
- **Content-Type**: `application/json`

## Implementation Details

### HTTP Client Choice
The application uses Axios for all HTTP requests:
- ✅ **Consistent client** - Uses Axios for both authenticated and public endpoints
- ✅ **Interceptors** - Automatic header injection for authenticated endpoints
- ✅ **Error handling** - Consistent error handling with try/catch
- ✅ **Promise-based** - Async/await syntax throughout

### Files Using Axios

#### Backend API Routes (Next.js API Routes)
- `lib/utils/api-client.ts` - Main bill payment API client
- `lib/utils/coingecko.ts` - External exchange rate API
- `lib/utils/flare-rpc.ts` - Blockchain RPC calls

#### Frontend Components (React)
- `components/sections/data-section.tsx` - Data purchase flow
- `components/sections/airtime-section.tsx` - Airtime purchase flow
- `components/sections/cable-section.tsx` - Cable TV purchase flow
- `components/sections/electricity-section.tsx` - Electricity bill payment flow

## Environment Variables

### Required Environment Variables

```
# Peyflex API Key for authenticating with the bill payment service
PEYFLEX_API_KEY=your_actual_peyflex_api_key_here

# Wallet Connect Project ID for RainbowKit wallet integration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# Treasury address where USDT payments are sent
NEXT_PUBLIC_TREASURY_ADDRESS=0xD1B77e5BE43D705549e38A23b59cf5365F17e227

# Flare RPC endpoint for blockchain transaction verification
NEXT_PUBLIC_FLARE_RPC_URL=https://flare-api.flare.network/ext/C/rpc

# CoinGecko API for exchange rate information
NEXT_PUBLIC_COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

### Variable Sources

1. **PEYFLEX_API_KEY**: Obtain from your Peyflex dashboard at https://client.peyflex.com.ng/dashboard
2. **NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID**: Create at https://cloud.walletconnect.com/
3. **NEXT_PUBLIC_TREASURY_ADDRESS**: Your wallet address that will receive USDT payments
4. **NEXT_PUBLIC_FLARE_RPC_URL**: Public Flare network RPC endpoint (default provided)
5. **NEXT_PUBLIC_COINGECKO_API_URL**: Public CoinGecko API endpoint (default provided)

## Peyflex API Endpoints - Detailed Usage

### Public Endpoints (No Authentication Required)

These endpoints do not require API key authentication and can be accessed directly:

#### 1. Get Airtime Networks
- **Endpoint**: `/api/airtime/networks/`
- **Method**: GET
- **Purpose**: Fetch available mobile network providers for airtime
- **Usage Location**: `app/api/get/airtime-networks/route.ts`
- **Implementation**: Cached with 60-second TTL
- **Response**: Network providers for airtime top-up

#### 2. Get Data Networks
- **Endpoint**: `/api/data/networks/`
- **Method**: GET
- **Purpose**: Fetch mobile network providers for data
- **Usage Location**: `app/api/get/data-plans/route.ts`
- **Implementation**: Cached with 60-second TTL
- **Response**: Network providers for data plans

#### 3. Get Data Plans by Network
- **Endpoint**: `/api/data/plans/?network={network_code}`
- **Method**: GET
- **Purpose**: Fetch data plans for a specific network
- **Usage Location**: `app/api/get/data-plans/route.ts`
- **Required Parameters**:
  - `network`: Network code
- **Response**: Data plans for the specified network

#### 4. Get Cable TV Providers
- **Endpoint**: `/api/cable/providers/`
- **Method**: GET
- **Purpose**: Fetch cable TV providers
- **Usage Location**: `app/api/get/cable-plans/route.ts`
- **Implementation**: Cached with 60-second TTL
- **Response**: Cable TV providers

#### 5. Get Cable TV Plans by Provider
- **Endpoint**: `/api/cable/plans/{provider_code}/`
- **Method**: GET
- **Purpose**: Fetch cable TV subscription plans for a specific provider
- **Usage Location**: `app/api/get/cable-plans/route.ts`
- **Required Parameters**:
  - `provider_code`: Cable TV provider code in the URL path
- **Response**: Subscription plans and pricing for the provider

#### 6. Verify Cable TV Customer
- **Endpoint**: `/api/cable/verify/`
- **Method**: POST
- **Purpose**: Verify cable TV smart card details and customer information
- **Usage Location**: `app/api/verify/smartcard/route.ts`
- **Required Parameters**:
  - `iuc`: Decoder smart card number
  - `identifier`: Cable TV provider code
- **Response**: Customer verification with name confirmation

#### 7. Get Electricity Plans
- **Endpoint**: `/api/electricity/plans/?identifier=electricity`
- **Method**: GET
- **Purpose**: Fetch available electricity distribution companies and meter types
- **Usage Location**: `app/api/get/electricity-plans/route.ts`
- **Implementation**: Cached with 60-second TTL
- **Response**: Electricity providers with available plans

#### 8. Verify Electricity Meter Number
- **Endpoint**: `/api/electricity/verify/?identifier=electricity&meter={meter}&plan={plan}&type={type}`
- **Method**: GET
- **Purpose**: Verify electricity meter details and customer information
- **Usage Location**: `app/api/verify/meter/route.ts`
- **Required Parameters**:
  - `identifier`: Must be "electricity"
  - `meter`: Customer meter number
  - `plan`: Electricity distribution company code
  - `type`: Meter type (prepaid or postpaid)
- **Response**: Customer verification with name confirmation

### Authenticated Endpoints (API Key Required)

These endpoints require API key authentication in the Authorization header:

#### 9. Airtime Top-up
- **Endpoint**: `/api/airtime/topup/`
- **Method**: POST
- **Purpose**: Execute airtime top-up transactions
- **Usage Location**: `app/api/pay/route.ts` (category: "airtime")
- **Required Parameters**:
  - `network`: Mobile network provider
  - `amount`: Airtime amount
  - `mobile_number`: Recipient phone number
- **Authentication**: Token in Authorization header
- **Response**: Transaction confirmation with reference number

#### 10. Purchase Data
- **Endpoint**: `/api/data/purchase/`
- **Method**: POST
- **Purpose**: Execute mobile data top-up transactions
- **Usage Location**: `app/api/pay/route.ts` (category: "data")
- **Required Parameters**:
  - `network`: Mobile network provider
  - `mobile_number`: Recipient phone number
  - `plan_code`: Selected data plan ID
- **Authentication**: Token in Authorization header
- **Response**: Transaction confirmation with reference number

#### 11. Pay Cable TV Bill
- **Endpoint**: `/api/cable/subscribe/`
- **Method**: POST
- **Purpose**: Execute cable TV subscription payments
- **Usage Location**: `app/api/pay/route.ts` (category: "cable")
- **Required Parameters**:
  - `identifier`: Cable TV provider code
  - `plan`: Subscription plan ID
  - `iuc`: Decoder smart card number
  - `phone`: Customer phone number
  - `amount`: Payment amount
- **Authentication**: Token in Authorization header
- **Response**: Transaction confirmation with reference number

#### 12. Electricity Meter Recharge
- **Endpoint**: `/api/electricity/subscribe/`
- **Method**: POST
- **Purpose**: Execute electricity bill payments
- **Usage Location**: `app/api/pay/route.ts` (category: "electricity")
- **Required Parameters**:
  - `identifier`: Must be "electricity"
  - `meter`: Customer meter number
  - `plan`: Electricity distribution company code
  - `amount`: Payment amount
  - `type`: Meter type (prepaid or postpaid)
  - `phone`: Customer phone number
- **Authentication**: Token in Authorization header
- **Response**: Transaction confirmation with reference number

## External API Endpoints

### 1. CoinGecko API
- **Base URL**: `https://api.coingecko.com/api/v3`
- **Endpoint**: `/simple/price?ids=tether&vs_currencies=ngn`
- **Method**: GET
- **Purpose**: Get current NGN to USD exchange rate for cryptocurrency conversions
- **Usage Location**: `lib/utils/coingecko.ts`, `app/api/rates/route.ts`
- **Fallback Rate**: 1650 NGN per USD (hardcoded fallback)
- **Response**: Real-time exchange rate for conversion calculations

### 2. Flare Blockchain RPC
- **Base URL**: `https://flare-api.flare.network/ext/C/rpc`
- **Method**: POST
- **Purpose**: Verify blockchain transaction confirmations
- **Usage Location**: `lib/utils/flare-rpc.ts`, `app/api/pay/route.ts`
- **Functionality**:
  - `eth_getTransactionReceipt`: Check transaction status
  - Polling mechanism with timeout (30 attempts, 2-second intervals)
- **Response**: Transaction receipt with status confirmation

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

## Reference ID System

### Overview
All API requests use unique reference IDs to track transactions and ensure idempotency. The system generates 30-character alphanumeric strings for each request.

### Reference ID Generation
- **Function**: `generateRequestId()` in `lib/utils/request-id.ts`
- **Format**: 30-character random string using A-Z, a-z, 0-9
- **Usage**: Every API call includes a unique reference ID

### Reference ID Usage by Endpoint Type

#### Payment Endpoints (Purchase)
- **Parameter Name**: Included in request body
- **Purpose**: Track payment transactions
- **Endpoints**: All payment endpoints
- **Response**: Returns transaction reference for confirmation

#### Verification Endpoints (Customer Check)
- **Parameter Name**: Included in query parameters or request body
- **Purpose**: Track verification requests
- **Endpoints**: Verification endpoints
- **Response**: Verification confirmation (no transaction created)

### Reference ID Flow
1. **Generation**: `generateRequestId()` creates unique ID
2. **API Request**: ID sent as part of request parameters
3. **API Response**: ID returned in response for tracking
4. **Client Response**: ID provided to user for transaction confirmation

## Bill Payment Flow

### Complete Flow
1. **Data Fetching**: GET endpoints cache responses for 60 seconds
2. **User Selection**: Frontend displays data fetched from API
3. **Verification**: Customer details verified before payment (for electricity and cable TV)
4. **Payment Execution**: Blockchain transaction confirmed first
5. **Bill Payment**: API call executed after blockchain confirmation
6. **Response**: Transaction reference returned to user

### Authentication
All authenticated bill payment API calls require:
- `PEYFLEX_API_KEY`: Token for authorization in the format `Token {api_key}`

### Error Handling
- **Network failures**: Graceful fallback to cached data
- **API failures**: Error responses with specific error messages
- **Transaction failures**: Error responses with specific error messages
- **Blockchain failures**: Transaction timeout after 60 seconds

## Response Format

All Peyflex API responses follow this structure:
```json
{
  "success": true,
  "data": {
    // Response data varies by endpoint
  },
  "message": "Optional message",
  "reference": "Transaction reference if applicable"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description"
}