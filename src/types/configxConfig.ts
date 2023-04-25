type ContractName = 'masterWombat' | 'asset' | 'voter' | 'bribe'
export type ConfigxConfig = {
  abis: {
    [key in ContractName]: {
      path: string
      address: {
        [id: string]: string
      }
    }
  }
}
