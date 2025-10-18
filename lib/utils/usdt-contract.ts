import { Contract } from "ethers"

// USDT on Flare mainnet
export const USDT_ADDRESS = "0x1D80c49BbBCd1C0911346356B529d9BFF6AD1470"

export const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) returns (uint256)",
  "function decimals() returns (uint8)",
]

export function getUSDTContract(signer: any) {
  return new Contract(USDT_ADDRESS, USDT_ABI, signer)
}
