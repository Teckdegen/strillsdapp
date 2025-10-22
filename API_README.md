# API Documentation

This document outlines all the API endpoints used in the Strills DApp, including their purposes, usage locations, and functionality.

## Base Configuration

### Bill Payment API
- **Base URL**: `https://client.peyflex.com.ng`
- **HTTP Client**: Node.js native `fetch` API (no external dependencies)
- **Authentication**: Token-based using `PEYFLEX_API_KEY` environment variable
- **Content-Type**: `application/json`
- **Method**: POST for most requests, GET for some verification endpoints

## Implementation Details

### HTTP Client Choice
The application uses Node.js native `fetch` API for all HTTP requests:
- ✅ **No axios dependency** - Uses built-in fetch (Node.js 18+)
### Files Using Node's Native Fetch

#### Backend API Routes (Next.js API Routes)
- `lib/utils/api-client.ts` - Main bill payment API client
- `lib/utils/coingecko.ts` - External exchange rate API
- `lib/utils/flare-rpc.ts` - Blockchain RPC calls

#### Frontend Components (React)
- `components/sections/data-section.tsx` - Data purchase flow
- `components/sections/airtime-section.tsx` - Airtime purchase flow
- `components/sections/cable-section.tsx` - Cable TV purchase flow
- `components/sections/electricity-section.tsx` - Electricity bill payment flow

All fetch calls follow consistent patterns:
- ✅ Proper error handling with try/catch
- ✅ JSON request/response handling
- ✅ Appropriate headers (Content-Type, Authorization)
- ✅ Promise-based async/await syntax

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

### 1. Get Airtime Networks
- **Endpoint**: `/api/airtime/networks/`
- **Method**: GET
- **Purpose**: Fetch available mobile network providers for airtime
- **Usage Location**: `app/api/get/airtime-networks/route.ts`
- **Implementation**: Cached with 60-second TTL
- **Authentication**: Token in Authorization header
- **Response**: Network providers for airtime top-up

#### Call Flow:
1. **Frontend Request**: User opens Airtime section → Component mounts
2. **API Route**: `/api/get/airtime-networks` (POST) called by frontend
3. **Backend Processing**: 
   - Check cache for recent data (within 60 seconds)
   - If no recent cache, call Peyflex: `GET /api/airtime/networks/`
   - Add Authorization header: `Token {PEYFLEX_API_KEY}`
   - Process response and cache result
4. **Response**: JSON with network list

#### Example Request:
```bash
GET https://client.peyflex.com.ng/api/airtime/networks/
Headers: {
  "Authorization": "Token your_peyflex_api_key",
  "Content-Type": "application/json"
}
```

#### Example Response:
```json
{
  "networks": [
    {"id": "mtn", "name": "MTN", "code": "mtn"},
    {"id": "airtel", "name": "Airtel", "code": "airtel"},
    {"id": "glo", "name": "Glo", "code": "glo"},
    {"id": "9mobile", "name": "9mobile", "code": "9mobile"}
  ]
}
```

### 2. Airtime Top-up
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

#### Call Flow:
1. **Frontend Request**: User fills airtime form and clicks "Pay with USDT"
2. **Blockchain Transaction**: USDT transferred to treasury address
3. **API Route**: `/api/pay` (POST) called with transaction details
4. **Backend Processing**: 
   - Verify blockchain transaction confirmation
   - Call Peyflex: `POST /api/airtime/topup/`
   - Add Authorization header: `Token {PEYFLEX_API_KEY}`
   - Include request body with network, amount, mobile_number
5. **Response**: JSON with transaction result

#### Example Request:
```bash
POST https://client.peyflex.com.ng/api/airtime/topup/
Headers: {
  "Authorization": "Token your_peyflex_api_key",
  "Content-Type": "application/json"
}
Body: {
  "network": "mtn",
  "amount": 1000,
  "mobile_number": "08012345678"
}
```

#### Example Response:
```json
{
  "success": true,
  "reference": "AIRTIME_1234567890",
  "message": "Airtime recharge successful",
  "transactionId": "AIRTIME_1234567890"
}
```

### 3. Get Data Networks
- **Endpoint**: `/api/data/networks/`
- **Method**: GET
- **Purpose**: Fetch mobile network providers for data
- **Usage Location**: `app/api/get/data-plans/route.ts`
- **Implementation**: Cached with 60-second TTL
- **Authentication**: Token in Authorization header
- **Response**: Network providers for data plans

#### Call Flow:
1. **Frontend Request**: User opens Data section → Component mounts
2. **API Route**: `/api/get/data-plans` (POST) called by frontend
3. **Backend Processing**: 
   - Call Peyflex: `GET /api/data/networks/`
   - Add Authorization header: `Token {PEYFLEX_API_KEY}`
   - For each network, fetch plans (see endpoint #4)
   - Process and cache combined result
4. **Response**: JSON with networks and their plans

#### Example Request:
```bash
GET https://client.peyflex.com.ng/api/data/networks/
Headers: {
  "Authorization": "Token your_peyflex_api_key",
  "Content-Type": "application/json"
}
```

#### Example Response:
```json
{
  "networks": [
    {"id": "mtn_sme_data", "name": "MTN SME Data", "code": "mtn_sme_data"},
    {"id": "mtn_gifting_data", "name": "MTN Gifting Data", "code": "mtn_gifting_data"},
    {"id": "airtel_data", "name": "Airtel Data", "code": "airtel_data"},
    {"id": "glo_data", "name": "Glo Data", "code": "glo_data"}
  ]
}
```

### 4. Get Data Plans by Network
- **Endpoint**: `/api/data/plans/?network={network_code}`
- **Method**: GET
- **Purpose**: Fetch data plans for a specific network
- **Usage Location**: `app/api/get/data-plans/route.ts`
- **Required Parameters**:
  - `network`: Network code
- **Authentication**: Token in Authorization header
- **Response**: Data plans for the specified network

#### Call Flow:
1. **Backend Processing**: Called as part of endpoint #3 processing
2. **API Call**: For each network from endpoint #3, call this endpoint
3. **Request**: `GET /api/data/plans/?network={network_code}`
4. **Response**: JSON with plans for that network

#### Example Request:
```bash
GET https://client.peyflex.com.ng/api/data/plans/?network=mtn_sme_data
Headers: {
  "Authorization": "Token your_peyflex_api_key",
  "Content-Type": "application/json"
}
```

#### Example Response:
```json
{
  "plans": [
    {"id": "M500MBS", "name": "500MB SME", "code": "M500MBS", "amount": 150},
    {"id": "M1GBS", "name": "1GB SME", "code": "M1GBS", "amount": 250},
    {"id": "M2GBS", "name": "2GB SME", "code": "M2GBS", "amount": 450}
  ]
}
```

### 5. Purchase Data
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

#### Call Flow:
1. **Frontend Request**: User selects data plan and clicks "Pay with USDT"
2. **Blockchain Transaction**: USDT transferred to treasury address
3. **API Route**: `/api/pay` (POST) called with transaction details
4. **Backend Processing**: 
   - Verify blockchain transaction confirmation
   - Call Peyflex: `POST /api/data/purchase/`
   - Add Authorization header: `Token {PEYFLEX_API_KEY}`
   - Include request body with network, mobile_number, plan_code
5. **Response**: JSON with transaction result

#### Example Request:
```bash
POST https://client.peyflex.com.ng/api/data/purchase/
Headers: {
  "Authorization": "Token your_peyflex_api_key",
  "Content-Type": "application/json"
}
Body: {
  "network": "mtn_sme_data",
  "mobile_number": "08012345678",
  "plan_code": "M1GBS"
}
```

#### Example Response:
```json
{
  "success": true,
  "reference": "DATA_1234567890",
  "message": "Data purchase successful",
  "transactionId": "DATA_1234567890"
}
```

### 6. Get Cable TV Providers
- **Endpoint**: `/api/cable/providers/`
- **Method**: GET
- **Purpose**: Fetch cable TV providers
- **Usage Location**: `app/api/get/cable-plans/route.ts`
- **Implementation**: Cached with 60-second TTL
- **Authentication**: Token in Authorization header
- **Response**: Cable TV providers

#### Call Flow:
1. **Frontend Request**: User opens Cable TV section → Component mounts
2. **API Route**: `/api/get/cable-plans` (POST) called by frontend
3. **Backend Processing**: 
   - Call Peyflex: `GET /api/cable/providers/`
   - Add Authorization header: `Token {PEYFLEX_API_KEY}`
   - For each provider, fetch plans (see endpoint #7)
   - Process and cache combined result
4. **Response**: JSON with providers and their plans

#### Example Request:
```bash
GET https://client.peyflex.com.ng/api/cable/providers/
Headers: {
  "Authorization": "Token your_peyflex_api_key",
  "Content-Type": "application/json"
}
```

#### Example Response:
```json
{
  "providers": [
    {"id": "dstv", "name": "DStv", "code": "dstv"},
    {"id": "startimes", "name": "Startimes", "code": "startimes"}
  ]
}
```

### 7. Get Cable TV Plans by Provider
- **Endpoint**: `/api/cable/plans/{provider_code}/`
- **Method**: GET
- **Purpose**: Fetch cable TV subscription plans for a specific provider
- **Usage Location**: `app/api/get/cable-plans/route.ts`
- **Required Parameters**:
  - `provider_code`: Cable TV provider code in the URL path
- **Authentication**: Token in Authorization header
- **Response**: Subscription plans and pricing for the provider

#### Call Flow:
1. **Backend Processing**: Called as part of endpoint #6 processing
2. **API Call**: For each provider from endpoint #6, call this endpoint
3. **Request**: `GET /api/cable/plans/{provider_code}/`
4. **Response**: JSON with plans for that provider

#### Example Request:
```bash
GET https://client.peyflex.com.ng/api/cable/plans/startimes/
Headers: {
  "Authorization": "Token your_peyflex_api_key",
  "Content-Type": "application/json"
}
```

#### Example Response:
```json
{
  "plans": [
    {"id": "nova", "name": "Nova", "code": "nova", "amount": 1900},
    {"id": "basic", "name": "Basic", "code": "basic", "amount": 3700},
    {"id": "classic", "name": "Classic", "code": "classic", "amount": 5500}
  ]
}
```

### 8. Verify Cable TV Customer
- **Endpoint**: `/api/cable/verify/`
- **Method**: POST
- **Purpose**: Verify cable TV smart card details and customer information
- **Usage Location**: `app/api/verify/smartcard/route.ts`
- **Required Parameters**:
  - `iuc`: Decoder smart card number
  - `identifier`: Cable TV provider code
- **Authentication**: Token in Authorization header
- **Response**: Customer verification with name confirmation

#### Call Flow:
1. **Frontend Request**: User enters smart card number and clicks "Verify"
2. **API Route**: `/api/verify/smartcard` (POST) called by frontend
3. **Backend Processing**: 
   - Call Peyflex: `POST /api/cable/verify/`
   - Add Authorization header: `Token {PEYFLEX_API_KEY}`
   - Include request body with iuc and identifier
4. **Response**: JSON with customer verification

#### Example Request:
```bash
POST https://client.peyflex.com.ng/api/cable/verify/
Headers: {
  "Authorization": "Token your_peyflex_api_key",
  "Content-Type": "application/json"
}
Body: {
  "iuc": "12345678901",
  "identifier": "startimes"
}
```

#### Example Response:
```json
{
  "success": true,
  "customerName": "John Doe",
  "iuc": "12345678901"
}
```

### 9. Pay Cable TV Bill
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

#### Call Flow:
1. **Frontend Request**: User fills cable TV form, verifies smart card, and clicks "Pay with USDT"
2. **Blockchain Transaction**: USDT transferred to treasury address
3. **API Route**: `/api/pay` (POST) called with transaction details
4. **Backend Processing**: 
   - Verify blockchain transaction confirmation
   - Call Peyflex: `POST /api/cable/subscribe/`
   - Add Authorization header: `Token {PEYFLEX_API_KEY}`
   - Include request body with identifier, plan, iuc, phone, amount
5. **Response**: JSON with transaction result

#### Example Request:
```bash
POST https://client.peyflex.com.ng/api/cable/subscribe/
Headers: {
  "Authorization": "Token your_peyflex_api_key",
  "Content-Type": "application/json"
}
Body: {
  "identifier": "startimes",
  "plan": "nova",
  "iuc": "12345678901",
  "phone": "08012345678",
  "amount": "1900"
}
```

#### Example Response:
```json
{
  "success": true,
  "reference": "CABLE_1234567890",
  "message": "Cable TV subscription successful",
  "transactionId": "CABLE_1234567890"
}
```

### 10. Get Electricity Plans
- **Endpoint**: `/api/electricity/plans/?identifier=electricity`
- **Method**: GET
- **Purpose**: Fetch available electricity distribution companies and meter types
- **Usage Location**: `app/api/get/electricity-plans/route.ts`
- **Implementation**: Cached with 60-second TTL
- **Authentication**: Token in Authorization header
- **Response**: Electricity providers with available plans

#### Call Flow:
1. **Frontend Request**: User opens Electricity section → Component mounts
2. **API Route**: `/api/get/electricity-plans` (POST) called by frontend
3. **Backend Processing**: 
   - Call Peyflex: `GET /api/electricity/plans/?identifier=electricity`
   - Add Authorization header: `Token {PEYFLEX_API_KEY}`
   - Process and cache result
4. **Response**: JSON with electricity providers

#### Example Request:
```bash
GET https://client.peyflex.com.ng/api/electricity/plans/?identifier=electricity
Headers: {
  "Authorization": "Token your_peyflex_api_key",
  "Content-Type": "application/json"
}
```

#### Example Response:
```json
{
  "plans": [
    {"id": "eko-electric", "name": "Eko Electric (EKEDC)", "code": "eko-electric"},
    {"id": "ikeja-electric", "name": "Ikeja Electric (IKEDC)", "code": "ikeja-electric"},
    {"id": "kaduna-electric", "name": "Kaduna Electric (KAEDCO)", "code": "kaduna-electric"}
  ]
}
```

### 11. Verify Electricity Meter Number
- **Endpoint**: `/api/electricity/verify/?identifier=electricity&meter={meter}&plan={plan}&type={type}`
- **Method**: GET
- **Purpose**: Verify electricity meter details and customer information
- **Usage Location**: `app/api/verify/meter/route.ts`
- **Required Parameters**:
  - `identifier`: Must be "electricity"
  - `meter`: Customer meter number
  - `plan`: Electricity distribution company code
  - `type`: Meter type (prepaid or postpaid)
- **Authentication**: Token in Authorization header
- **Response**: Customer verification with name confirmation

#### Call Flow:
1. **Frontend Request**: User enters meter number, selects DISCO and meter type, then clicks "Verify"
2. **API Route**: `/api/verify/meter` (POST) called by frontend
3. **Backend Processing**: 
   - Call Peyflex: `GET /api/electricity/verify/?identifier=electricity&meter={meter}&plan={plan}&type={type}`
   - Add Authorization header: `Token {PEYFLEX_API_KEY}`
4. **Response**: JSON with customer verification

#### Example Request:
```bash
GET https://client.peyflex.com.ng/api/electricity/verify/?identifier=electricity&meter=12345678901&plan=eko-electric&type=prepaid
Headers: {
  "Authorization": "Token your_peyflex_api_key",
  "Content-Type": "application/json"
}
```

#### Example Response:
```json
{
  "success": true,
  "customerName": "Jane Smith",
  "meter": "12345678901"
}
```

### 12. Electricity Meter Recharge
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

#### Call Flow:
1. **Frontend Request**: User fills electricity form, verifies meter, and clicks "Pay with USDT"
2. **Blockchain Transaction**: USDT transferred to treasury address
3. **API Route**: `/api/pay` (POST) called with transaction details
4. **Backend Processing**: 
   - Verify blockchain transaction confirmation
   - Call Peyflex: `POST /api/electricity/subscribe/`
   - Add Authorization header: `Token {PEYFLEX_API_KEY}`
   - Include request body with identifier, meter, plan, amount, type, phone
5. **Response**: JSON with transaction result

#### Example Request:
```bash
POST https://client.peyflex.com.ng/api/electricity/subscribe/
Headers: {
  "Authorization": "Token your_peyflex_api_key",
  "Content-Type": "application/json"
}
Body: {
  "identifier": "electricity",
  "meter": "12345678901",
  "plan": "eko-electric",
  "amount": "5000",
  "type": "prepaid",
  "phone": "08012345678"
}
```

#### Example Response:
```json
{
  "success": true,
  "reference": "ELECTRIC_1234567890",
  "message": "Electricity bill payment successful",
  "transactionId": "ELECTRIC_1234567890"
}
```

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
All bill payment API calls require:
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
```