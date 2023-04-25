import { SupportedChainId } from '../types/common'

export const RPC_URLS: {
  [id in SupportedChainId]: string[]
} = {
  [SupportedChainId.ARBITRUM_ONE]: [
    'https://arb1.arbitrum.io/rpc',
    'https://rpc.ankr.com/arbitrum',
    'https://endpoints.omniatech.io/v1/arbitrum/one/public',
  ],
  [SupportedChainId.BSC_MAINNET]: [
    'https://rpc.ankr.com/bsc',
    'https://bscrpc.com/',
    'https://bsc-dataseed1.binance.org/',
    'https://bsc-dataseed2.binance.org/',
    'https://bsc-dataseed3.binance.org/',
    'https://bsc-dataseed4.binance.org/',
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc-dataseed2.defibit.io/',
    'https://bsc-dataseed3.defibit.io/',
    'https://bsc-dataseed4.defibit.io/',
    'https://bsc-dataseed1.ninicoin.io/',
    'https://bsc-dataseed2.ninicoin.io/',
    'https://bsc-dataseed3.ninicoin.io/',
    'https://bsc-dataseed4.ninicoin.io/',
  ],
  [SupportedChainId.BSC_TESTNET]: [
    'https://rpc.ankr.com/bsc_testnet_chapel',
    'https://data-seed-prebsc-1-s1.binance.org:8545/',
    'https://data-seed-prebsc-1-s2.binance.org:8545',
    'https://data-seed-prebsc-1-s3.binance.org:8545/',
    'https://data-seed-prebsc-2-s2.binance.org:8545/',
    'https://data-seed-prebsc-2-s3.binance.org:8545/',
  ],
}
