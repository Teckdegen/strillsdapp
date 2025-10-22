# Strills dApp API Integration

This document provides detailed information about the API endpoints used in the Strills dApp for bill payments and cryptocurrency transactions.

## Environment Variables

The application requires the following environment variables to be set in the `.env` file:

```
PEYFLEX_API_KEY=your_peyflex_api_key
NEXT_PUBLIC_TREASURY_ADDRESS=0xD1B77e5BE43D705549e38A23b59cf5365F17e227
NEXT_PUBLIC_FLARE_RPC_URL=https://flare-api.flare.network/ext/C/rpc
NEXT_PUBLIC_COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

## Public Endpoints (No Authentication Required)

These endpoints are used to fetch available plans and providers without requiring API authentication.

### Airtime Networks

**Endpoint**: `GET /api/airtime/networks/`

**Usage**: Fetches available airtime networks.

**Response**:
```json
{
  "success": true,
  "networks": [
    {
      "id": "mtn",
      "name": "MTN",
      "code": "mtn"
    },
    {
      "id": "glo",
      "name": "GLO",
      "code": "glo"
    },
    {
      "id": "airtel",
      "name": "Airtel",
      "code": "airtel"
    },
    {
      "id": "9mobile",
      "name": "9mobile",
      "code": "9mobile"
    }
  ]
}
```

### Data Networks and Plans

**Endpoint**: `GET /api/data/networks/`

**Usage**: Fetches available data networks.

**Response**:
```json
{
  "success": true,
  "networks": [
    {
      "id": "mtn_sme_data",
      "name": "MTN SME Data",
      "code": "mtn_sme_data"
    },
    {
      "id": "mtn_gifting_data",
      "name": "MTN Gifting Data",
      "code": "mtn_gifting_data"
    },
    {
      "id": "glo_data",
      "name": "GLO Data",
      "code": "glo_data"
    },
    {
      "id": "airtel_data",
      "name": "Airtel Data",
      "code": "airtel_data"
    },
    {
      "id": "9mobile_data",
      "name": "9mobile Data",
      "code": "9mobile_data"
    }
  ]
}
```

**Endpoint**: `GET /api/data/plans/?network={network_code}`

**Usage**: Fetches available data plans for a specific network.

**Example**: `GET /api/data/plans/?network=mtn_gifting_data`

**Response**:
```json
{
  "success": true,
  "plans": [
    {
      "id": "M500MBS",
      "code": "M500MBS",
      "name": "500MB Special Data Bundle",
      "amount": 250,
      "validity": "1 Day"
    },
    {
      "id": "M1GBS",
      "code": "M1GBS",
      "name": "1GB Special Data Bundle",
      "amount": 450,
      "validity": "1 Day"
    }
  ]
}
```

### Cable Providers and Plans

**Endpoint**: `GET /api/cable/providers/`

**Usage**: Fetches available cable TV providers.

**Response**:
```json
{
  "success": true,
  "providers": [
    {
      "id": "dstv",
      "name": "DStv",
      "code": "dstv"
    },
    {
      "id": "gotv",
      "name": "GOtv",
      "code": "gotv"
    },
    {
      "id": "startimes",
      "name": "StarTimes",
      "code": "startimes"
    }
  ]
}
```

**Endpoint**: `GET /api/cable/plans/{provider_code}/`

**Usage**: Fetches available plans for a specific cable provider.

**Example**: `GET /api/cable/plans/startimes/`

**Response**:
```json
{
  "success": true,
  "plans": [
    {
      "id": "nova",
      "code": "nova",
      "name": "Nova - 900 Naira - 1 Month",
      "amount": 900
    },
    {
      "id": "basic",
      "code": "basic",
      "name": "Basic - 1,700 Naira - 1 Month",
      "amount": 1700
    }
  ]
}
```

### Electricity Plans

**Endpoint**: `GET /api/electricity/plans/?identifier=electricity`

**Usage**: Fetches available electricity plans.

**Response**:
```json
{
  "success": true,
  "plans": [
    {
      "id": "aedc",
      "name": "Abuja Electricity Distribution Company",
      "code": "aedc"
    },
    {
      "id": "bedc",
      "name": "Benin Electricity Distribution Company",
      "code": "bedc"
    }
  ]
}
```

## Authenticated Endpoints (API Key Required)

These endpoints require the `Authorization: Token {PEYFLEX_API_KEY}` header for authentication.

### Airtime Topup

**Endpoint**: `POST /api/airtime/topup/`

**Usage**: Purchase airtime for a mobile number.

**Request Body**:
```json
{
  "network": "mtn",
  "amount": 100,
  "mobile_number": "08144216361"
}
```

### Data Purchase

**Endpoint**: `POST /api/data/purchase/`

**Usage**: Purchase data for a mobile number.

**Request Body**:
```json
{
  "network": "mtn_sme_data",
  "mobile_number": "08144216361",
  "plan_code": "M500MBS"
}
```

### Cable Subscription

**Endpoint**: `POST /api/cable/verify/`

**Usage**: Verify cable smart card details.

**Request Body**:
```json
{
  "iuc": "1234567890",
  "identifier": "startimes"
}
```

**Endpoint**: `POST /api/cable/subscribe/`

**Usage**: Subscribe to a cable TV plan.

**Request Body**:
```json
{
  "identifier": "startimes",
  "plan": "nova",
  "iuc": "1234567890",
  "phone": "081234567891",
  "amount": "900"
}
```

### Electricity Bill Payment

**Endpoint**: `GET /api/electricity/verify/?identifier=electricity&meter=45145984782&plan=kaduna-electric&type=prepaid`

**Usage**: Verify electricity meter details.

**Endpoint**: `POST /api/electricity/subscribe/`

**Usage**: Pay electricity bill.

**Request Body**:
```json
{
  "identifier": "electricity",
  "meter": "1234567890111",
  "plan": "benin-electric",
  "amount": "10",
  "type": "prepaid",
  "phone": "08012345678"
}
```

## Error Handling

All API responses follow a consistent format:

**Success Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Rate Limiting

The Peyflex API implements rate limiting to ensure fair usage. If you exceed the rate limits, you will receive a 429 status code with a retry-after header indicating when you can make your next request.

## Caching

To optimize performance and reduce API calls, the application implements caching with a 1-minute refresh interval for all plan data. This ensures that users see relatively up-to-date information while minimizing the number of API calls to Peyflex.