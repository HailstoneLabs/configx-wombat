import { SupportedChainId } from '../types/common'
import { assetData } from './generatedConfig/assetData'
import { TokenSymbols } from './generatedConfig/tokenSymbols'
export class Asset {
  address: string
  symbol: TokenSymbols
  chainId: SupportedChainId
  decimals: number
  poolLabel: PoolLabels
  name: string
  color: string
  constructor({
    address,
    symbol,
    chainId,
    decimals,
    poolLabel,
    name,
    color,
  }: {
    address: string
    symbol: TokenSymbols
    chainId: SupportedChainId
    decimals: number
    poolLabel: PoolLabels
    name: string
    color: string
  }) {
    this.address = address
    this.symbol = symbol
    this.chainId = chainId
    this.decimals = decimals
    this.poolLabel = poolLabel
    this.name = name
    this.color = color
  }
}

export enum PoolLabels {
  MAIN = 'MAIN',
  SIDE = 'SIDE',
  BNB = 'BNB',
  qWOM = 'qWOM',
  mWOM = 'mWOM',
  wmxWOM = 'wmxWOM',
  FACTORY_STABLES = 'INNOVATION',
  BNBx = 'BNBx',
  stkBNB = 'stkBNB',
  axlUSDC = 'axlUSDC',
  CUSD = 'CUSD',
  iUSD = 'iUSD',
  USDD = 'USDD',
  BOB = 'BOB',
  frxETH = 'frxETH',
  MIM = 'MIM',
  Overnight = 'Overnight',
  FRAX_MAI_USDplus = 'FRAX-MAI-USD+',
  ankrBNB = 'ankrBNB',
}

export enum MasterWombatId {
  MW2 = 'MW2',
  MW3 = 'MW3',
}

export type PoolAssetMap = {
  [label in PoolLabels]: {
    [id in TokenSymbols]?: Asset
  }
}

const poolAddressToPoolLabel: { [id: string]: PoolLabels } = {
  ['0x312Bc7eAAF93f1C60Dc5AfC115FcCDE161055fb0'.toLowerCase()]: PoolLabels.MAIN,
}

const ASSET_CONFIG: {
  [chainId in SupportedChainId]: {
    [label in PoolLabels]?: {
      [id in TokenSymbols]?: {
        color?: string
        name?: string
      }
    }
  }
} = {
  [SupportedChainId.BSC_MAINNET]: {
    [PoolLabels.MAIN]: {
      [TokenSymbols.BUSD]: {
        name: 'Binance USD',
        color: '#F8B900',
      },
      [TokenSymbols.USDC]: {
        name: 'USD Coin',
        color: '#1D72B9',
      },
      [TokenSymbols.USDT]: {
        name: 'Tether USD',
        color: '#22B093',
      },
      [TokenSymbols.DAI]: {
        name: 'Dai Stablecoin',
        color: '#FFB118',
      },
    },
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    [PoolLabels.MAIN]: {
      [TokenSymbols.BUSD]: {
        name: 'Binance USD',
        color: '#F8B900',
      },
      [TokenSymbols.USDC]: {
        name: 'USD Coin',
        color: '#1D72B9',
      },
      [TokenSymbols.USDT]: {
        name: 'Tether USD',
        color: '#22B093',
      },
      [TokenSymbols.DAI]: {
        name: 'Dai Stablecoin',
        color: '#FFB118',
      },
    },
  },
  [SupportedChainId.BSC_TESTNET]: {
    [PoolLabels.MAIN]: {
      [TokenSymbols.BUSD]: {
        name: 'Binance USD',
        color: '#F8B900',
      },
      [TokenSymbols.USDC]: {
        name: 'USD Coin',
        color: '#1D72B9',
      },
      [TokenSymbols.USDT]: {
        name: 'Tether USD',
        color: '#22B093',
      },
      [TokenSymbols.DAI]: {
        name: 'Dai Stablecoin',
        color: '#FFB118',
      },
    },
  },
}
export const ASSETS: {
  [chainId in SupportedChainId]: PoolAssetMap
} = { [SupportedChainId.BSC_MAINNET]: {} } as {
  [chainId in SupportedChainId]: PoolAssetMap
}

for (const data of assetData) {
  const {
    address,
    chainId: chainIdStr,
    decimals,
    poolAddress,
    tokenSymbol,
  } = data

  const poolLabel = poolAddressToPoolLabel[poolAddress.toLowerCase()]
  const chainId = chainIdStr as unknown as SupportedChainId
  const asset = new Asset({
    address,
    chainId,
    decimals,
    poolLabel,
    symbol: tokenSymbol as TokenSymbols,
    name:
      ASSET_CONFIG[chainId]?.[poolLabel]?.[tokenSymbol as TokenSymbols]?.name ||
      '',
    color:
      ASSET_CONFIG[chainId]?.[poolLabel]?.[tokenSymbol as TokenSymbols]
        ?.color || '',
  })
  ASSETS[asset.chainId] = {
    ...ASSETS[asset.chainId],
    [asset.poolLabel]: {
      ...ASSETS[asset.chainId][asset.poolLabel],
      [asset.symbol]: asset,
    },
  }
}

// console.log(ASSETS)
