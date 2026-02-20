import { TokenConfig } from '../interfaces';

export const SUPPORTED_TOKENS: TokenConfig[] = [
  {
    id: 'ALEO',
    name: 'Aleo',
    symbol: 'ALEO',
    decimals: 6,
    image: '/tokens/ALEO.svg'
  },
  {
    id: '5983142094692128773510225623816045070304444621008302359049788306211838130558field',
    name: 'vUSDG',
    symbol: 'vUSDG',
    decimals: 6,
    image: '/tokens/vUSDG.svg'
  },
  {
    id: '7282192565387792361809088173158053178461960397100960262024562261205950610485field',
    name: 'vETE',
    symbol: 'vETE',
    decimals: 18,
    image: '/tokens/vETE.svg'
  },
  {
    id: '8260953594890310383870507716927422646335575786500909254294703665587287172223field',
    name: 'vUSDQ',
    symbol: 'vUSDQ',
    decimals: 6,
    image: '/tokens/vUSDT.svg'
  }
] as const;

export const WALEO_TOKEN: TokenConfig = {
  id: '3443843282313283355522573239085696902919850365217539366784739393210722344986field',
  name: 'Wrapped Aleo',
  symbol: 'wALEO',
  decimals: 6,
  image: '/tokens/ALEO.svg'
} as const; 