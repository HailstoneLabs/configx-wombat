import { BigNumber } from 'ethers'
import masterWombatAbi from './abis/masterWombatAbi.json'
import assetAbi from './abis/assetAbi.json'
import erc20Abi from './abis/erc20Abi.json'
import voterAbi from './abis/voterAbi.json'
import bribeAbi from './abis/bribeAbi.json'
import * as ethcall from 'ethcall'
import path from 'path'
import { executeCallBacks } from './utils/executeCallbacks'
import { readJSON } from 'fs-extra'
import { ConfigxConfig } from './types/configxConfig'
import { RPC_URLS } from './constant/chainInfo'
import {
  AssetData,
  ChainIdWithAddress,
  SupportedChainId,
  TokenData,
} from './types/common'
import { getEthcallProvider } from './utils/getEthcallProvider'
import saveToFiles from './utils/saveToFiles'
import {
  CONFIG_FILE_NAME,
  CWD,
  OVERRIDEN_TOKEN_SYMBOL,
} from './constant/common'
import init from './utils/init'
import getChainIdWithAddress from './utils/getChainIdWithAddress'
import getEmptyCallAndCallbackList from './utils/getEmptyCallAndCallbackList'

const project = init()

export default async function main() {
  const config = (await readJSON(
    path.resolve(CWD, CONFIG_FILE_NAME),
  )) as ConfigxConfig

  const chainIds = Object.keys(
    config.abis.masterWombat.address,
  ) as unknown as SupportedChainId[]

  let assetData: { [id: ChainIdWithAddress]: AssetData } = {}
  let tokenData: { [id: ChainIdWithAddress]: TokenData } = {}
  for (const chainId of chainIds) {
    let assetDataOfThisChain: { [id: ChainIdWithAddress]: AssetData } = {}
    let tokenDataOfThisChain: { [id: ChainIdWithAddress]: TokenData } = {}
    const rpcUrls = RPC_URLS[chainId]
    let rpcUrlCounter = 0
    // run 3 times at max if any errors occur
    while (rpcUrlCounter <= 2) {
      // set them to empty object for each loop
      assetDataOfThisChain = {}
      tokenDataOfThisChain = {}
      console.info(`chainId ${chainId}: run ${rpcUrlCounter + 1} time(s)`)
      try {
        const masterWombatAddress = config.abis.masterWombat.address[chainId]
        if (!masterWombatAddress)
          throw new Error(
            `chainId ${chainId}: MasterWombat contract's address not found.`,
          )
        if (rpcUrls.length === 0)
          throw new Error(`chainId ${chainId}: No rpc urls provided.`)

        const ethcallProvider = getEthcallProvider(rpcUrls[rpcUrlCounter])

        const masterwombatContract = new ethcall.Contract(
          masterWombatAddress,
          masterWombatAbi,
        )

        const poolLengthData = await ethcallProvider.tryAll([
          masterwombatContract['poolLength'](),
          masterwombatContract['voter'](),
        ])

        const poolLength = poolLengthData[0] as number
        const voterAddress = poolLengthData[1] as string
        if (!poolLength) {
          throw new Error(`chainId ${chainId}: Invaild pool length`)
        }

        const assetAddressesWithPidAndPoolRewarderAddress: {
          assetAddress: string
          pid: number
          poolRewarderAddress: string | null
        }[] = []
        const [contractCalls, callbacks] = getEmptyCallAndCallbackList()
        for (let pid = 0; pid < poolLength; pid++) {
          contractCalls.push(masterwombatContract['poolInfoV3'](pid))
          callbacks.push((value) => {
            const result = value as [string, string]
            assetAddressesWithPidAndPoolRewarderAddress.push({
              assetAddress: result[0],
              pid,
              poolRewarderAddress: parseInt(result[1]) === 0 ? null : result[1],
            })
          })
        }
        const result = await ethcallProvider.tryAll(contractCalls)
        executeCallBacks(result, callbacks)

        /**
         * Assets
         */
        const [contractCalls2, callbacks2] = getEmptyCallAndCallbackList()

        const bribeRewarderAddresses: { [id: ChainIdWithAddress]: string } = {}
        for (const {
          assetAddress,
          pid,
          poolRewarderAddress,
        } of assetAddressesWithPidAndPoolRewarderAddress) {
          const key = getChainIdWithAddress(chainId, assetAddress)
          const assetContract = new ethcall.Contract(assetAddress, assetAbi)
          // general asset info
          contractCalls2.push(assetContract['decimals']())
          callbacks2.push((value) => {
            assetDataOfThisChain = {
              ...assetDataOfThisChain,
              [key]: {
                ...assetDataOfThisChain[key],
                pid,
                decimals: value as number,
                address: assetAddress,
                chainId: chainId,
              },
            }
          })
          // pool rewarder
          if (poolRewarderAddress) {
            contractCalls2.push(
              masterwombatContract['rewarderBonusTokenInfo'](pid),
            )
            callbacks2.push((value) => {
              const result = value as [string[], string[]]
              assetDataOfThisChain = {
                ...assetDataOfThisChain,
                [key]: {
                  ...assetDataOfThisChain[key],
                  poolRewarder: {
                    rewardTokenAddresses: result[0],
                    rewardTokenSymbols: result[1],
                    rewarderAddress: poolRewarderAddress,
                  },
                },
              }
            })
          }
          contractCalls2.push(assetContract['pool']())
          callbacks2.push((value) => {
            assetDataOfThisChain = {
              ...assetDataOfThisChain,
              [key]: {
                ...assetDataOfThisChain[key],
                poolAddress: value as string,
              },
            }
          })
          contractCalls2.push(assetContract['underlyingToken']())
          callbacks2.push((value) => {
            assetDataOfThisChain = {
              ...assetDataOfThisChain,
              [key]: {
                ...assetDataOfThisChain[key],
                underlyingTokenAddress: value as string,
              },
            }
          })

          /**
           * Voter => bribe address
           */
          const voterContract = new ethcall.Contract(voterAddress, voterAbi)
          contractCalls2.push(voterContract['infos'](assetAddress))
          callbacks2.push((value: { bribe: string }) => {
            if (!BigNumber.from(value.bribe).eq('0')) {
              bribeRewarderAddresses[key] = value.bribe
              assetDataOfThisChain = {
                ...assetDataOfThisChain,
                [key]: {
                  ...assetDataOfThisChain[key],
                  bribeRewarder: {
                    rewarderAddress: value.bribe,
                    rewardTokenSymbolAddresses: [],
                  },
                },
              }
            }
          })
        }
        const result2 = await ethcallProvider.tryAll(contractCalls2)
        executeCallBacks(result2, callbacks2)

        /** Token address */
        const [contractCalls3, callbacks3] = getEmptyCallAndCallbackList()
        const tokenAddresses = new Set([
          ...Object.values(assetDataOfThisChain).map(
            (a) => a.underlyingTokenAddress,
          ),
        ])
        /** add bribe reward tokens to tokenAddresses */
        for (const [chainIdWithAddress, bribeRewarderAddress] of Object.entries(
          bribeRewarderAddresses,
        )) {
          const bribeContract = new ethcall.Contract(
            bribeRewarderAddress,
            bribeAbi,
          )
          contractCalls3.push(bribeContract['rewardTokens']())
          callbacks3.push((value: string[]) => {
            const asset =
              assetDataOfThisChain[chainIdWithAddress as ChainIdWithAddress]
            if (asset.bribeRewarder) {
              asset.bribeRewarder.rewardTokenSymbolAddresses = value
            }
            for (const rewardTokenAddress of value) {
              if (tokenAddresses.has(rewardTokenAddress)) continue
              tokenAddresses.add(rewardTokenAddress)
            }
          })
        }

        /** add pool reward tokens to tokenAddresses */
        for (const asset of Object.values(assetDataOfThisChain)) {
          if (asset.poolRewarder) {
            for (const rewardTokenAddress of asset.poolRewarder
              ?.rewardTokenAddresses || []) {
              if (tokenAddresses.has(rewardTokenAddress)) continue
              tokenAddresses.add(rewardTokenAddress)
            }
          }
        }

        const result3 = await ethcallProvider.tryAll(contractCalls3)
        executeCallBacks(result3, callbacks3)

        /**
         * Get symbols of all tokens
         */
        const [contractCalls4, callbacks4] = getEmptyCallAndCallbackList()
        for (const tokenAddress of tokenAddresses) {
          const key = getChainIdWithAddress(chainId, tokenAddress)
          const tokenContract = new ethcall.Contract(tokenAddress, erc20Abi)
          contractCalls4.push(tokenContract['decimals']())
          callbacks4.push((value: number) => {
            tokenDataOfThisChain = {
              ...tokenDataOfThisChain,
              [key]: {
                ...tokenDataOfThisChain[key],
                decimals: value,
                address: tokenAddress,
                chainId: chainId,
              },
            }
          })
          contractCalls4.push(tokenContract['symbol']())
          callbacks4.push((value: string) => {
            const overridenTokenSymbol =
              OVERRIDEN_TOKEN_SYMBOL[chainId]?.[tokenAddress]
            tokenDataOfThisChain = {
              ...tokenDataOfThisChain,
              [key]: {
                ...tokenDataOfThisChain[key],
                tokenSymbol: overridenTokenSymbol || value,
              },
            }
          })
          contractCalls4.push(tokenContract['name']())
          callbacks4.push((value: string) => {
            tokenDataOfThisChain = {
              ...tokenDataOfThisChain,
              [key]: {
                ...tokenDataOfThisChain[key],
                name: value,
              },
            }
          })
        }

        const result4 = await ethcallProvider.tryAll(contractCalls4)
        executeCallBacks(result4, callbacks4)

        // break the while-loop if everything is fine.
        break
      } catch (err) {
        rpcUrlCounter += 1
        console.error(err)
      }
    }
    // Concatenate all data
    assetData = {
      ...assetData,
      ...assetDataOfThisChain,
    }
    tokenData = {
      ...tokenData,
      ...tokenDataOfThisChain,
    }
    console.info(`chainId ${chainId}: end`)
  }

  saveToFiles(project, { assets: assetData, tokens: tokenData })
  console.info('finished')
}

// uncomment it for testing purpose
// main()
