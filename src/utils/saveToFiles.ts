import path from 'path'
import { Project, StructureKind, VariableDeclarationKind } from 'ts-morph'
import { CWD } from '../constant/common'
import { AssetData, ChainIdWithAddress, TokenData } from '../types/common'
import getChainIdWithAddress from './getChainIdWithAddress'

type Data = {
  assets: { [id: ChainIdWithAddress]: AssetData }
  tokens: { [id: ChainIdWithAddress]: TokenData }
}

const DEVELOPMENT_DIR = 'src/example/generatedConfig'
export default function saveToFiles(project: Project, data: Data) {
  const isStaging = process.env.ENVIRONMENT === 'STAGING'
  const dir = isStaging ? DEVELOPMENT_DIR : 'configx'
  /**
   * Assets
   * */
  const assetDataSource = Object.values(data.assets).map((asset) => {
    const keyOfUnderlyingToken = getChainIdWithAddress(
      asset.chainId,
      asset.underlyingTokenAddress,
    )
    asset.tokenSymbol = data.tokens[keyOfUnderlyingToken].tokenSymbol
    // Replace reward token address with reward token symbol
    if (asset.bribeRewarder) {
      asset.bribeRewarder.rewardTokenSymbols =
        asset.bribeRewarder.rewardTokenSymbolAddresses.map(
          (rewardTokenAddress) => {
            const keyOfRewardToken = getChainIdWithAddress(
              asset.chainId,
              rewardTokenAddress,
            )
            return data.tokens[keyOfRewardToken].tokenSymbol
          },
        )
    }
    return asset
  })
  project.createSourceFile(
    path.resolve(CWD, dir, 'assetData.ts'),
    {
      statements: [
        {
          kind: StructureKind.VariableStatement,
          isExported: true,
          declarationKind: VariableDeclarationKind.Const,
          declarations: [
            {
              name: 'assetData',
              initializer: JSON.stringify(assetDataSource),
            },
          ],
        },
      ],
    },
    { overwrite: true },
  )

  /**
   * Tokens
   */
  const uniqueTokenSymbols = [
    ...new Set(Object.values(data.tokens).map((t) => t.tokenSymbol)),
  ]
  project.createSourceFile(
    path.resolve(CWD, dir, 'tokenSymbols.ts'),
    {
      statements: [
        {
          kind: StructureKind.Enum,
          name: 'TokenSymbols',
          isExported: true,
          members: uniqueTokenSymbols.map((tokenSymbol) => ({
            name: tokenSymbol,
            value: tokenSymbol,
          })),
        },
      ],
    },
    { overwrite: true },
  )

  /**
   * Save all
   */
  void project.save()
}
