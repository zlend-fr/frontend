import React, { useEffect, useState } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';

import {
  DASHBOARD_WALLET_NOT_CONNECTED_HEADLINE,
  DASHBOARD_WALLET_NOT_CONNECTED_SUBTEXT,
  DASHBOARD_CONNECT_WALLET_BUTTON_TEXT,
} from '../../constants';

import type { TokenBalances, PendingLend } from '../../interfaces';

import coin1 from '../../assets/images/coin1.png';
import coin2 from '../../assets/images/coin2.png';
import coin3 from '../../assets/images/coin3.png';
import coin4 from '../../assets/images/coin4.png';
import coin5 from '../../assets/images/coin5.png';
import coin6 from '../../assets/images/coin6.png';
import coin7 from '../../assets/images/coin7.png';
import coin8 from '../../assets/images/coin8.png';

import '../../styles/dashboard.css';

import YourLends from './YourLends';
import YourBorrows from './YourBorrows';
import AssetsToLend from './AssetsToLend';
import AssetsToBorrow from './AssetsToBorrow';

const Dashboard: React.FC = () => {
  const { publicKey, connected } = useWallet();

  const [pendingLends, setPendingLends] = useState<PendingLend[]>([]);
  const [pendingBorrows, setPendingBorrows] = useState<{ tokenId: string; amount: bigint; timestamp: number; collateralAmount: bigint; collateralTokenId: string; transactionId: string }[]>([]);
  const [privateBalances, setPrivateBalances] = useState<TokenBalances>({});
  const [publicBalances, setPublicBalances] = useState<TokenBalances>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLendPending = (tokenId: string, amount: bigint, timestamp: number, transactionId: string) => {
    setPendingLends(prev => [...prev, { amount, timestamp, transactionId }]);
  };

  const handleBorrowPending = (tokenId: string, amount: bigint, timestamp: number, collateralAmount: bigint, collateralTokenId: string, transactionId: string) => {
    setPendingBorrows(prev => [...prev, { tokenId, amount, timestamp, collateralAmount, collateralTokenId, transactionId }]);
  };

  const handleRedeemSuccess = (tokenId: string, amount: bigint) => {
    console.log(`Redeem successful, updating private balance for ${tokenId} with amount ${amount}`);
    setPrivateBalances(prev => ({
      ...prev,
      [tokenId]: (prev[tokenId] || BigInt(0)) + amount
    }));
  };

  const handleBorrowSuccess = (
    tokenId: string, 
    amount: bigint, 
    transactionId: string, 
    collateralTokenId: string, 
    collateralAmount: bigint
  ) => {
    console.log(`Borrow successful: ${transactionId}, Token: ${tokenId}, Amount: ${amount}, Collateral: ${collateralTokenId}, Amount: ${collateralAmount}`);
    
    setPrivateBalances(prev => ({
      ...prev,
      [tokenId]: (prev[tokenId] || BigInt(0)) + amount
    }));

    setPrivateBalances(prev => ({
      ...prev,
      [collateralTokenId]: (prev[collateralTokenId] || BigInt(0)) - collateralAmount
    }));

    handleBorrowPending(tokenId, amount, Math.floor(Date.now() / 1000), collateralAmount, collateralTokenId, transactionId);
  };

  const handleRepaySuccess = (tokenId: string, amount: bigint, collateralTokenId: string, collateralAmount: bigint) => {
    console.log(`Repay successful: Token ${tokenId}, Amount ${amount}, Collateral ${collateralTokenId}, Collateral Amount ${collateralAmount}`);
    
    setPrivateBalances(prev => ({
      ...prev,
      [tokenId]: (prev[tokenId] || BigInt(0)) - amount
    }));

    setPrivateBalances(prev => ({
      ...prev,
      [collateralTokenId]: (prev[collateralTokenId] || BigInt(0)) + collateralAmount
    }));
  };

  return (
    <>
      <div className="coin-container left-1">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin1} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin1} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container left-2">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin2} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin2} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container left-3">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin3} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin3} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container left-4">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin4} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin4} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container right-1">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin5} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin5} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container right-2">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin6} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin6} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container right-3">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin7} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin7} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container right-4">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin8} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin8} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>
      <div className={`dashboard ${!connected ? 'dashboard-not-connected' : ''}`}>
        {connected && publicKey ? (
          <div className="dashboard-container-wrapper">
            <div className="dashboard-sections-grid">
              <YourLends 
                pendingLends={pendingLends} 
                setPendingLends={setPendingLends} 
                onRedeemSuccess={handleRedeemSuccess}
              />
              <YourBorrows 
                pendingBorrows={pendingBorrows}
                setPendingBorrows={setPendingBorrows}
                onRepaySuccess={handleRepaySuccess}
                setPrivateBalances={setPrivateBalances}
              />
              <AssetsToLend 
                onLendPending={handleLendPending} 
                privateBalances={privateBalances}
                setPrivateBalances={setPrivateBalances}
                publicBalances={publicBalances}
                setPublicBalances={setPublicBalances}
              />
              <AssetsToBorrow 
                publicBalances={publicBalances}
                privateBalances={privateBalances}
                onBorrowSuccess={handleBorrowSuccess}
              />
            </div>
          </div>
        ) : (
          <div className="dashboard-container">
            <div className="connect-wallet-message">
              <p className="connect-wallet-headline">{DASHBOARD_WALLET_NOT_CONNECTED_HEADLINE}</p>
              <p className="connect-wallet-subtext">{DASHBOARD_WALLET_NOT_CONNECTED_SUBTEXT}</p>
            </div>
            <WalletMultiButton className="connect-wallet-button">
              {DASHBOARD_CONNECT_WALLET_BUTTON_TEXT}
            </WalletMultiButton>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard; 