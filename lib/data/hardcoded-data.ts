export const HARDCODED_DATA = {
  data: {
    success: true,
    data: [
      {
        code: "NG",
        name: "Nigeria",
        providers: [],
      },
    ],
  },
  electricity: {
    success: true,
    data: [
      {
        code: "NG",
        name: "Nigeria",
        providers: [],
      },
    ],
  },
  cable: {
    success: true,
    data: [
      {
        code: "NG",
        name: "Nigeria",
        providers: [],
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
