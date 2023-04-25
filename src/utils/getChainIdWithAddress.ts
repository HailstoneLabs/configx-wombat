import { ChainIdWithAddress, SupportedChainId } from '../types/common'

export default function getChainIdWithAddress(
  chainId: SupportedChainId,
  address: string,
): ChainIdWithAddress {
  return `${chainId}_${address}`
}
