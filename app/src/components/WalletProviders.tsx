import React, { useMemo } from "react";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import {
  LeoWalletAdapter,
  PuzzleWalletAdapter,
  FoxWalletAdapter,
  SoterWalletAdapter,
} from "aleo-adapters";
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";

import "@demox-labs/aleo-wallet-adapter-reactui/styles.css";

const PROGRAMS = [
  "credits.aleo",
  "token_registry.aleo",
  "wrapped_credits.aleo",
  "zhppy2pajo.aleo",
  "nafrqqtcxg.aleo",
];

const WalletProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({ appName: "zlend" }),
      new PuzzleWalletAdapter({
        appName: "zlend",
        appDescription: "Privacy-focused Lending & Borrowing on Aleo",
        programIdPermissions: {
          [WalletAdapterNetwork.TestnetBeta]: PROGRAMS,
        },
      }),
      new FoxWalletAdapter({ appName: "zlend" }),
      new SoterWalletAdapter({ appName: "zlend" }),
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.AutoDecrypt}
      network={WalletAdapterNetwork.TestnetBeta}
      programs={PROGRAMS}
      autoConnect
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
};

export default WalletProviders;
