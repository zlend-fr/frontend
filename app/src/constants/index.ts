export const SITE_NAME = 'zlend';
export const SITE_DESCRIPTION = 'Decentralized Lending Platform';
export const SITE_URL = 'https://zlend.vercel.app';
export const APP_URL = 'https://app-zlend.vercel.app';

export const NAVIGATION_ITEMS = [
  { id: 'app', title: 'Connect Wallet', url: APP_URL, isExternal: true }
];

export const SOCIAL_MEDIA = {
  twitter: {
    url: 'https://x.com/edenbdn',
    label: 'Twitter'
  },
  discord: {
    url: 'https://discord.gg/aleo',
    label: 'Discord'
  },
  github: {
    url: 'https://github.com/zlend-fr',
    label: 'GitHub'
  }
} as const;

export const DASHBOARD = {
  wallet: {
    connected: {
      headline: 'Wallet Connected!',
      subtextPrefix: 'Your public key: '
    },
    notConnected: {
      headline: 'Please connect your wallet',
      subtext: 'Link your Aleo wallet to access your zlend dashboard and manage your private lending and borrowing.',
      buttonText: 'Connect Wallet'
    }
  },
  sections: {
    yourLends: {
      title: 'Your Lends',
      emptyMessage: 'No active lending positions found.'
    },
    yourBorrows: {
      title: 'Your Borrows',
      emptyMessage: 'No active borrowing positions found.'
    },
    assetsToLend: {
      title: 'Assets to Lend',
      emptyMessage: 'No assets available for lending at the moment.'
    },
    assetsToBorrow: {
      title: 'Assets to Borrow',
      emptyMessage: 'No assets available for borrowing at the moment.'
    },
    tokenBalances: {
      title: 'Your Token Balances',
      emptyMessage: 'No token balances available.'
    }
  }
} as const;

export const DASHBOARD_WALLET_CONNECTED_HEADLINE = DASHBOARD.wallet.connected.headline;
export const DASHBOARD_WALLET_CONNECTED_SUBTEXT_PRE = DASHBOARD.wallet.connected.subtextPrefix;
export const DASHBOARD_WALLET_NOT_CONNECTED_HEADLINE = DASHBOARD.wallet.notConnected.headline;
export const DASHBOARD_WALLET_NOT_CONNECTED_SUBTEXT = DASHBOARD.wallet.notConnected.subtext;
export const DASHBOARD_CONNECT_WALLET_BUTTON_TEXT = DASHBOARD.wallet.notConnected.buttonText;
export const DASHBOARD_YOUR_LENDS_TITLE = DASHBOARD.sections.yourLends.title;
export const DASHBOARD_YOUR_BORROWS_TITLE = DASHBOARD.sections.yourBorrows.title;
export const DASHBOARD_ASSETS_TO_LEND_TITLE = DASHBOARD.sections.assetsToLend.title;
export const DASHBOARD_ASSETS_TO_BORROW_TITLE = DASHBOARD.sections.assetsToBorrow.title;
export const DASHBOARD_TOKEN_BALANCES_TITLE = DASHBOARD.sections.tokenBalances.title;
export const DASHBOARD_EMPTY_LENDS_MESSAGE = DASHBOARD.sections.yourLends.emptyMessage;
export const DASHBOARD_EMPTY_BORROWS_MESSAGE = DASHBOARD.sections.yourBorrows.emptyMessage;
export const DASHBOARD_EMPTY_ASSETS_TO_LEND_MESSAGE = DASHBOARD.sections.assetsToLend.emptyMessage;
export const DASHBOARD_EMPTY_ASSETS_TO_BORROW_MESSAGE = DASHBOARD.sections.assetsToBorrow.emptyMessage;
export const DASHBOARD_TOKEN_BALANCES_EMPTY_MESSAGE = DASHBOARD.sections.tokenBalances.emptyMessage;

export const BLOCKCHAIN = {
  network: 'testnet',
  rpcUrl: 'https://testnetbeta.aleorpc.com',
  programs: {
    registry: 'token_registry.aleo',
    aleoToken: 'credits.aleo'
  }
} as const;

export const RPC_URL = BLOCKCHAIN.rpcUrl;
export const REGISTRY_PROGRAM_ID = BLOCKCHAIN.programs.registry;
export const ALEO_TOKEN_ID = BLOCKCHAIN.programs.aleoToken;

export const ZLEND_URL = 'https://zlend.vercel.app';
export const ZLEND_APP_URL = 'https://app-zlend.vercel.app';

export const NETWORK = "testnet";
export const NEW_TOKEN_ID = "5983142094692128773510225623816045070304444621008302359049788306211838130558field";
export const VETE_TOKEN_ID = "7282192565387792361809088173158053178461960397100960262024562261205950610485field";