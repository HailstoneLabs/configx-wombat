import { ethers } from 'ethers'
import * as ethcall from 'ethcall'
export function getEthcallProvider(rpcUrl: string) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const ethcallProvider = new ethcall.Provider()
  ethcallProvider.init(provider)
  return ethcallProvider
}
