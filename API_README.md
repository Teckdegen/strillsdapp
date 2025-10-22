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

## Peyflex API Endpoints

### 1. Get Electricity Plans
- **Endpoint**: `/api/electricity/plans/?identifier=electricity`
- **Method**: GET
- **Purpose**: Fetch available electricity distribution companies and meter types
- **Usage Location**: `app/api/get/electricity-plans/route.ts`
- **Implementation**: Cached with 60-second TTL, falls back to hardcoded data
- **Response**: Electricity providers with available plans

### 2. Verify Electricity Meter Number
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

### 3. Electricity Meter Recharge
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

## Reference ID System

### Overview
All API requests use unique reference IDs to track transactions and ensure idempotency. The system generates 30-character alphanumeric strings for each request.

### Reference ID Generation
- **Function**: `generateRequestId()` in `lib/utils/request-id.ts`
- **Format**: 30-character random string using A-Z, a-z, 0-9
- **Usage**: Every API call includes a unique reference ID

### Reference ID Usage by Endpoint Type

#### Payment Endpoints (Purchase)
- **Parameter Name**: `reference`
- **Purpose**: Track payment transactions
- **Endpoints**: All payment endpoints
- **Response**: Returns transaction reference for confirmation

#### Verification Endpoints (Customer Check)
- **Parameter Name**: Included in query parameters
- **Purpose**: Track verification requests
- **Endpoints**: Verification endpoints
- **Response**: Verification confirmation (no transaction created)

### Reference ID Flow
1. **Generation**: `generateRequestId()` creates unique ID
2. **API Request**: ID sent as part of request parameters
3. **API Response**: ID returned in response for tracking
4. **Client Response**: ID provided to user for transaction confirmation

### Bill Payment Flow
1. **Data Fetching**: GET endpoints cache responses for 60 seconds
2. **User Selection**: Frontend displays cached/hardcoded options
3. **Verification**: Customer details verified before payment
4. **Payment Execution**: Blockchain transaction confirmed first
5. **Bill Payment**: API call executed after blockchain confirmation
6. **Response**: Transaction reference returned to user

### Authentication
All bill payment API calls require:
- `PEYFLEX_API_KEY`: Token for authorization in the format `Token {api_key}`

### Error Handling
- **Network failures**: Graceful fallback to hardcoded data
- **API failures**: Silent failures with cached data usage
- **Transaction failures**: Error responses with specific error messages
- **Blockchain failures**: Transaction timeout after 60 seconds

## Environment Variables Required

```
PEYFLEX_API_KEY=your_peyflex_api_key_here
```

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