import * as dotenv from 'dotenv'
import { SupportedChainId } from '../types/common'
dotenv.config()
export const CWD = process.cwd()
export const CONFIG_FILE_NAME = 'configx.json'
const DEVELOPMENT_DIR = 'src/example/generatedConfig'
export const OUTPUT_DIR =
  process.env.ENVIRONMENT === 'STAGING' ? DEVELOPMENT_DIR : 'configx'

// Some symbols on ERC20 contracts are not correct. We can override the symbols here.
export const OVERRIDEN_TOKEN_SYMBOL: {
  [chainId in SupportedChainId]?: { [address: string]: string }
} = {
  [SupportedChainId.ARBITRUM_ONE]: {
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8': 'USDC.e',
  },
}
