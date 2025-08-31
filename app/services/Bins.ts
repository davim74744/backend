import binsConfig from '#config/bins'

type Issuer = (typeof binsConfig)[keyof typeof binsConfig]
type IssuerRules = Issuer['rules']

type FindResult = {
  name: string
  foundBin: number
  rules: IssuerRules
}

export default class CardBinsService {
  public findByCardNumber(cardNumber: string): FindResult | null {
    for (const [issuerName, issuerData] of Object.entries(binsConfig)) {
      const foundBin = issuerData.bins.find((bin) =>
        cardNumber.startsWith(String(bin))
      )

      if (foundBin) {
        return {
          name: issuerName,
          foundBin: foundBin,
          rules: issuerData.rules,
        }
      }
    }

    return null
  }
}