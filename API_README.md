# API Documentation

This document outlines all the API endpoints used in the Strills DApp, including their purposes, usage locations, and functionality.

## Base Configuration

### Bill Payment API
- **Base URL**: `https://businessapi.cashwyre.com/api/v1.0`
- **HTTP Client**: Node.js native `fetch` API (no external dependencies)
- **Authentication**: Bearer token using `SECRET_KEY` environment variable
- **Content-Type**: `application/json`
- **Method**: All requests use POST method
- **Additional Headers**:
  - `appId`: From `APP_ID` environment variable
  - `businessCode`: From `BUSINESS_CODE` environment variable

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

## Bill Payment API Endpoints

### 1. Get Airtime Network Information
- **Endpoint**: `/Airtime/getAirtimeInfo`
- **Method**: POST
- **Purpose**: Fetch available mobile network providers and their airtime plans
- **Usage Location**: `app/api/get/airtime-networks/route.ts`
- **Implementation**: Cached with 60-second TTL, falls back to hardcoded data
- **Response**: Network providers with available airtime amounts

### 2. Get Cable TV Information
- **Endpoint**: `/CableTV/getCableTVInfo`
- **Method**: POST
- **Purpose**: Fetch cable TV providers and subscription plans
- **Usage Location**: `app/api/get/cable-plans/route.ts`
- **Implementation**: Cached with 60-second TTL, falls back to hardcoded data
- **Response**: Cable providers (DStv, Startimes) with subscription plans and pricing

### 3. Get Data Plan Information
- **Endpoint**: `/DataPurchase/getDataInfo`
- **Method**: POST
- **Purpose**: Fetch mobile data plans from all network providers
- **Usage Location**: `app/api/get/data-plans/route.ts`
- **Implementation**: Cached with 60-second TTL, falls back to hardcoded data
- **Response**: Data plans organized by network (MTN, Airtel, Glo, 9mobile) with pricing

### 4. Get Electricity Provider Information
- **Endpoint**: `/Electricity/getElectricityInfo`
- **Method**: POST
- **Purpose**: Fetch electricity distribution companies and meter types
- **Usage Location**: `app/api/get/electricity-plans/route.ts`
- **Implementation**: Cached with 60-second TTL, falls back to hardcoded data
- **Response**: Electricity providers (AEDC, EKEDC, etc.) with prepaid meter support

### 5. Purchase Data
- **Endpoint**: `/DataPurchase/buyData`
- **Method**: POST
- **Purpose**: Execute mobile data top-up transactions
- **Usage Location**: `app/api/pay/route.ts` (category: "data")
- **Required Parameters**:
  - `network`: Mobile network provider
  - `providerPlanCode`: Selected data plan ID
  - `phoneNumber`: Recipient phone number
  - `reference`: Unique transaction reference
- **Response**: Transaction confirmation with reference number

### 6. Purchase Airtime
- **Endpoint**: `/Airtime/buyAirtime`
- **Method**: POST
- **Purpose**: Execute airtime top-up transactions
- **Usage Location**: `app/api/pay/route.ts` (category: "airtime")
- **Required Parameters**:
  - `network`: Mobile network provider
  - `phoneNumber`: Recipient phone number
  - `amount`: Airtime amount in NGN
  - `reference`: Unique transaction reference
- **Response**: Transaction confirmation with reference number

### 7. Pay Electricity Bill
- **Endpoint**: `/Electricity/buyElectricity`
- **Method**: POST
- **Purpose**: Execute electricity bill payments
- **Usage Location**: `app/api/pay/route.ts` (category: "electricity")
- **Required Parameters**:
  - `providerCode`: Electricity distribution company code
  - `providerPlanCode`: Meter type (typically "prepaid")
  - `meterNumber`: Customer meter number
  - `customerName`: Customer name
  - `phoneNumber`: Customer phone number
  - `amount`: Payment amount in NGN
  - `reference`: Unique transaction reference
- **Response**: Transaction confirmation with reference number

### 8. Pay Cable TV Bill
- **Endpoint**: `/CableTV/buyCableTV`
- **Method**: POST
- **Purpose**: Execute cable TV subscription payments
- **Usage Location**: `app/api/pay/route.ts` (category: "cable")
- **Required Parameters**:
  - `providerCode`: Cable TV provider (dstv, Startimes)
  - `providerPlanCode`: Subscription plan ID
  - `phoneNumber`: Customer phone number
  - `smartCardNumber`: Decoder smart card number
  - `customerName`: Customer name
  - `reference`: Unique transaction reference
- **Response**: Transaction confirmation with reference number

### 9. Verify Electricity Customer
- **Endpoint**: `/Electricity/verifyCustomer`
- **Method**: POST
- **Purpose**: Verify electricity meter details and customer information
- **Usage Location**: `app/api/verify/meter/route.ts`
- **Required Parameters**:
  - `meterNumber`: Customer meter number
  - `providerCode`: Electricity distribution company code
  - `providerPlanCode`: Meter type (default: "prepaid")
  - `reference`: Unique transaction reference
- **Response**: Customer verification with name confirmation

### 10. Verify Cable TV Customer
- **Endpoint**: `/CableTV/verifyCustomer`
- **Method**: POST
- **Purpose**: Verify cable TV smart card details and customer information
- **Usage Location**: `app/api/verify/smartcard/route.ts`
- **Required Parameters**:
  - `smartCardNumber`: Decoder smart card number
  - `providerCode`: Cable TV provider code
  - `providerPlanCode`: Subscription plan ID
  - `reference`: Unique request identifier
- **Response**: Customer verification with name confirmation

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
- **Endpoints**: All `/buy*` endpoints (buyData, buyAirtime, buyElectricity, buyCableTV)
- **Response**: Returns transaction reference for confirmation

#### Verification Endpoints (Customer Check)
- **Parameter Name**: `reference`
- **Purpose**: Track verification requests
- **Endpoints**: `/verifyCustomer` for electricity and cable TV
- **Response**: Verification confirmation (no transaction created)

### Reference ID Flow
1. **Generation**: `generateRequestId()` creates unique ID
2. **API Request**: ID sent as `reference` parameter
3. **API Response**: ID returned in response for tracking
4. **Client Response**: ID provided to user for transaction confirmation

### Example Usage
```typescript
const requestId = generateRequestId() // "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6"

// Payment request
const result = await callBillApi("/DataPurchase/buyData", {
  network: "mtn",
  providerPlanCode: "PSPLAN_177",
  phoneNumber: "08031234567",
  reference: requestId, // 30-char unique ID
})
```

### Bill Payment Flow
1. **Data Fetching**: GET endpoints cache responses for 60 seconds
2. **User Selection**: Frontend displays cached/hardcoded options
3. **Verification**: Customer details verified before payment
4. **Payment Execution**: Blockchain transaction confirmed first
5. **Bill Payment**: API call executed after blockchain confirmation
6. **Response**: Transaction reference returned to user

### Authentication
All bill payment API calls require:
- `SECRET_KEY`: Bearer token for authorization
- `APP_ID`: Application identifier
- `BUSINESS_CODE`: Business account identifier

### Error Handling
- **Network failures**: Graceful fallback to hardcoded data
- **API failures**: Silent failures with cached data usage
- **Transaction failures**: Error responses with specific error messages
- **Blockchain failures**: Transaction timeout after 60 seconds

## Environment Variables Required

```
SECRET_KEY=your_secret_key_here
APP_ID=your_app_id_here
BUSINESS_CODE=your_business_code_here
BASE_URL=https://businessapi.cashwyre.com/api/v1.0
```

## Response Format

All bill payment API responses follow this structure:
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
