export enum SupportedChainId {
  BSC_MAINNET = 56,
  BSC_TESTNET = 97,
  ARBITRUM_ONE = 42161,
}

export type AssetData = {
  tokenSymbol: string
  address: string
  poolAddress: string
  underlyingTokenAddress: string
  decimals: number
  chainId: number
  pid: number
  bribeRewarder?: {
    rewardTokenSymbolAddresses: string[]
    rewardTokenSymbols: string[]
    rewarderAddress: string
  }
}

export type TokenData = {
  address: string
  tokenSymbol: string
  name: string
  decimals: number
  chainId: number
}

export type ChainIdWithAddress = `${SupportedChainId}_${string}`
