import path from 'path'
import { Project, StructureKind, VariableDeclarationKind } from 'ts-morph'
import { CWD, OUTPUT_DIR } from '../constant/common'
import { AssetData, ChainIdWithAddress, TokenData } from '../types/common'
import getChainIdWithAddress from './getChainIdWithAddress'

type Data = {
  assets: { [id: ChainIdWithAddress]: AssetData }
  tokens: { [id: ChainIdWithAddress]: TokenData }
}

export default function saveToFiles(project: Project, data: Data) {
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
    path.resolve(CWD, OUTPUT_DIR, 'assetData.ts'),
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
    path.resolve(CWD, OUTPUT_DIR, 'tokenSymbols.ts'),
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
