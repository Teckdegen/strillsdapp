export const HARDCODED_DATA = {
  data: {
    success: true,
    data: [
      {
        code: "NG",
        name: "Nigeria",
        providers: [
          {
            code: "9mobile",
            network: "9mobile",
            name: "9MOBILE",
            providerPlans: [
              { code: "PSPLAN_495", name: "1GB 30 Days (NGN 320.00)", currency: "NGN", amount: 320 },
              { code: "PSPLAN_496", name: "2GB 30 Days (NGN 640.00)", currency: "NGN", amount: 640 },
              { code: "PSPLAN_497", name: "3GB 30 Days (NGN 960.00)", currency: "NGN", amount: 960 },
              { code: "PSPLAN_498", name: "5GB 30 Days (NGN 1600.00)", currency: "NGN", amount: 1600 },
              { code: "PSPLAN_499", name: "10GB 30 Days (NGN 3200.00)", currency: "NGN", amount: 3200 },
              { code: "PSPLAN_500", name: "15GB 30 Days (NGN 4800.00)", currency: "NGN", amount: 4800 },
            ],
          },
          {
            code: "airtel",
            network: "airtel",
            name: "AIRTEL NG",
            providerPlans: [
              { code: "PSPLAN_1300", name: "1GB - 7 Days (NGN 320.00)", currency: "NGN", amount: 320 },
              { code: "PSPLAN_1302", name: "1.5GB - 7 Days (NGN 450.00)", currency: "NGN", amount: 450 },
              { code: "PSPLAN_1301", name: "2GB - 14 Days (NGN 600.00)", currency: "NGN", amount: 600 },
              { code: "PSPLAN_1432", name: "2GB - 1 Day (NGN 750.00)", currency: "NGN", amount: 750 },
              { code: "PSPLAN_1433", name: "2GB - 30 Days (NGN 1500.00)", currency: "NGN", amount: 1500 },
              { code: "PSPLAN_1434", name: "3GB - 30 Days (NGN 2000.00)", currency: "NGN", amount: 2000 },
              { code: "PSPLAN_1436", name: "4GB - 30 Days (NGN 2500.00)", currency: "NGN", amount: 2500 },
              { code: "PSPLAN_1437", name: "8GB - 30 Days (NGN 3000.00)", currency: "NGN", amount: 3000 },
              { code: "PSPLAN_1438", name: "10GB - 30 Days (NGN 4000.00)", currency: "NGN", amount: 4000 },
              { code: "PSPLAN_1440", name: "18GB - 30 Days (NGN 6000.00)", currency: "NGN", amount: 6000 },
            ],
          },
          {
            code: "glo",
            network: "glo",
            name: "GLO NG",
            providerPlans: [
              { code: "PSPLAN_318", name: "1GB - 5 days (NGN 100.00)", currency: "NGN", amount: 100 },
              { code: "PSPLAN_317", name: "350MB - 2 days (NGN 200.00)", currency: "NGN", amount: 200 },
              { code: "PSPLAN_315", name: "1.8GB - 14 days (NGN 500.00)", currency: "NGN", amount: 500 },
              { code: "PSPLAN_314", name: "3.9GB - 30 days (NGN 1000.00)", currency: "NGN", amount: 1000 },
              { code: "PSPLAN_313", name: "7.5GB - 30 days (NGN 1500.00)", currency: "NGN", amount: 1500 },
              { code: "PSPLAN_311", name: "9.2GB - 30 days (NGN 2000.00)", currency: "NGN", amount: 2000 },
              { code: "PSPLAN_310", name: "10.8GB - 30 days (NGN 2500.00)", currency: "NGN", amount: 2500 },
              { code: "PSPLAN_309", name: "14GB - 30 days (NGN 3000.00)", currency: "NGN", amount: 3000 },
              { code: "PSPLAN_308", name: "18GB - 30 days (NGN 4500.00)", currency: "NGN", amount: 4500 },
            ],
          },
          {
            code: "mtn",
            network: "mtn",
            name: "MTN NG",
            providerPlans: [
              { code: "PSPLAN_1385", name: "200MB 3Day (NGN 200.00)", currency: "NGN", amount: 200 },
              { code: "PSPLAN_1384", name: "250MB Daily (NGN 250.00)", currency: "NGN", amount: 250 },
              { code: "PSPLAN_1386", name: "1GB Daily (NGN 350.00)", currency: "NGN", amount: 350 },
              { code: "PSPLAN_177", name: "1GB - 30days (NGN 520.00)", currency: "NGN", amount: 520 },
              { code: "PSPLAN_178", name: "2GB - 30days (NGN 1040.00)", currency: "NGN", amount: 1040 },
              { code: "PSPLAN_179", name: "3GB - 30days (NGN 1560.00)", currency: "NGN", amount: 1560 },
              { code: "PSPLAN_180", name: "5GB - 30days (NGN 2600.00)", currency: "NGN", amount: 2600 },
              { code: "PSPLAN_181", name: "10GB - 30days (NGN 5200.00)", currency: "NGN", amount: 5200 },
              { code: "PSPLAN_1405", name: "20GB Monthly (NGN 7500.00)", currency: "NGN", amount: 7500 },
              { code: "PSPLAN_1410", name: "75GB Monthly (NGN 20000.00)", currency: "NGN", amount: 20000 },
            ],
          },
        ],
      },
    ],
  },
  electricity: {
    success: true,
    data: [
      {
        code: "NG",
        name: "Nigeria",
        providers: [
          { code: "abuja-electric", name: "Abuja (AEDC)", plans: [{ code: "prepaid", name: "prepaid" }] },
          { code: "eko-electric", name: "Eko (EKEDC)", plans: [{ code: "prepaid", name: "prepaid" }] },
          { code: "enugu-electric", name: "Enugu (EEDC)", plans: [{ code: "prepaid", name: "prepaid" }] },
          { code: "ibadan-electric", name: "Ibadan (IBEDC)", plans: [{ code: "prepaid", name: "prepaid" }] },
          { code: "ikeja-electric", name: "Ikeja (IKEDC)", plans: [{ code: "prepaid", name: "prepaid" }] },
          { code: "jos-electric", name: "Jos (JED)", plans: [{ code: "prepaid", name: "prepaid" }] },
          { code: "kaduna-electric", name: "Kaduna (KAEDCO)", plans: [{ code: "prepaid", name: "prepaid" }] },
          { code: "kano-electric", name: "Kano (KEDCO)", plans: [{ code: "prepaid", name: "prepaid" }] },
          { code: "portharcourt-electric", name: "Portharcourt (PHED)", plans: [{ code: "prepaid", name: "prepaid" }] },
        ],
      },
    ],
  },
  cable: {
    success: true,
    data: [
      {
        code: "NG",
        name: "Nigeria",
        providers: [
          {
            code: "dstv",
            name: "DStv ✅",
            serviceId: "dstv",
            providerPlans: [
              { code: "cwpadi", name: "Padi (NGN 4400.00)", amount: 4400, currency: "NGN" },
              { code: "cwyanga", name: "Yanga (NGN 6000.00)", amount: 6000, currency: "NGN" },
              { code: "cwpadiextraview", name: "Padi + ExtraView (NGN 10400.00)", amount: 10400, currency: "NGN" },
              { code: "cwconfam", name: "Confam (NGN 11000.00)", amount: 11000, currency: "NGN" },
              { code: "cwyangaextraview", name: "Yanga + ExtraView (NGN 12000.00)", amount: 12000, currency: "NGN" },
              { code: "cwconfamextraview", name: "Confam + ExtraView (NGN 17000.00)", amount: 17000, currency: "NGN" },
              { code: "cwcompact", name: "Compact (NGN 19000.00)", amount: 19000, currency: "NGN" },
              { code: "cwcompactextraview", name: "Compact ExtraView (NGN 25000.00)", amount: 25000, currency: "NGN" },
              { code: "cwcompactplus", name: "Compact Plus (NGN 30000.00)", amount: 30000, currency: "NGN" },
              {
                code: "cwcompactplusextraview",
                name: "Compact Plus ExtraView (NGN 36000.00)",
                amount: 36000,
                currency: "NGN",
              },
              { code: "cwpremium", name: "Premium (NGN 44500.00)", amount: 44500, currency: "NGN" },
              {
                code: "cwpremiumextraview",
                name: "Premium – ExtraView (NGN 50500.00)",
                amount: 50500,
                currency: "NGN",
              },
            ],
          },
          {
            code: "Startimes",
            name: "Startimes ✅",
            serviceId: "Startimes",
            providerPlans: [
              { code: "cwnovaantennamonthly", name: "Nova (Antenna) (NGN 1900.00)", amount: 1900, currency: "NGN" },
              { code: "cwbasicantennamonthly", name: "Basic (Antenna) (NGN 3700.00)", amount: 3700, currency: "NGN" },
              {
                code: "cwclassicantennamonthly",
                name: "Classic (Antenna) (NGN 5500.00)",
                amount: 5500,
                currency: "NGN",
              },
              { code: "cwsuperdishmonthly", name: "Super (Dish) (NGN 9000.00)", amount: 9000, currency: "NGN" },
            ],
          },
        ],
      },
    ],
  },
}

export function calculateFeeAmount(amount: number): number {
  return amount * 0.02
}

export function calculateTotalWithFee(amount: number): number {
  return amount + calculateFeeAmount(amount)
}
