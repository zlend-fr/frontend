/**
 * AssetsToLend Component
 * Displays a list of tokens available for lending and handles lending operations
 * Manages token balances, transfers, and lending interactions
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { DASHBOARD_ASSETS_TO_LEND_TITLE } from '../../constants';
import { TokenBalances, TokenConfig } from '../../interfaces';
import { getPrivateBalances, getPublicBalance, getAleoBalance } from '../../utils/balanceUtils';
import { SUPPORTED_TOKENS, WALEO_TOKEN } from '../../constants/tokens';
import TransferModal from './TransferModal';
import LendModal from './LendModal';
import WrapModal from './WrapModal';
import TokenBalance from './TokenBalance';

/**
 * Props for the AssetsToLend component
 * @property {Function} onLendPending - Callback when a lend operation is pending
 * @property {TokenBalances} privateBalances - User's private token balances
 * @property {Function} setPrivateBalances - Function to update private balances
 * @property {TokenBalances} publicBalances - User's public token balances
 * @property {Function} setPublicBalances - Function to update public balances
 */
interface AssetsToLendProps {
  onLendPending: (tokenId: string, amount: bigint, timestamp: number, transactionId: string) => void;
  privateBalances: TokenBalances;
  setPrivateBalances: React.Dispatch<React.SetStateAction<TokenBalances>>;
  publicBalances: TokenBalances;
  setPublicBalances: React.Dispatch<React.SetStateAction<TokenBalances>>;
}

const AssetsToLend: React.FC<AssetsToLendProps> = ({ 
  onLendPending, 
  privateBalances, 
  setPrivateBalances,
  publicBalances,
  setPublicBalances
}) => {
  const { publicKey, requestRecords } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showLendModal, setShowLendModal] = useState(false);
  const [showWrapModal, setShowWrapModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenConfig | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Loads all token balances for the user
   * Fetches both private and public balances for all supported tokens
   */
  const loadBalances = useCallback(async () => {
    if (!publicKey || !requestRecords) return;
    console.log('🚀 Loading balances for:', publicKey);
    setIsLoading(true);
    setError(null);

    try {
      const creditsRecords = await requestRecords('credits.aleo');
      const tokenRecords = await requestRecords('token_registry.aleo');
      
      const privateBalancesData = await getPrivateBalances([...creditsRecords, ...tokenRecords]);
      setPrivateBalances(privateBalancesData);

      const publicBalancesData: TokenBalances = {};
      // Load SUPPORTED_TOKENS
      for (const token of SUPPORTED_TOKENS) {
        if (token.id === 'ALEO') {
          const aleoBalance = await getAleoBalance(publicKey);
          if (aleoBalance !== null) {
            publicBalancesData[token.id] = aleoBalance;
          }
        } else {
          const publicBalance = await getPublicBalance(token.id, publicKey);
          if (publicBalance !== null) {
            publicBalancesData[token.id] = publicBalance;
          }
        }
      }
      
      // Also load wALEO
      const wAleoPublicBalance = await getPublicBalance(WALEO_TOKEN.id, publicKey);
      if (wAleoPublicBalance !== null) {
        publicBalancesData[WALEO_TOKEN.id] = wAleoPublicBalance;
      }
      
      setPublicBalances(publicBalancesData);

    } catch (error) {
      console.error('Error loading balances:', error);
      setError('Failed to load balances');
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, requestRecords, setPrivateBalances, setPublicBalances]);

  /**
   * Polls for token balance updates after a transaction
   * @param {string} tokenId - The token ID to poll for
   * @param {number} startTime - The timestamp when polling started
   */
  const pollTokenBalance = useCallback(async (tokenId: string, startTime: number, attempt: number = 1) => {
    if (!publicKey) return;

    if (Date.now() - startTime > 180000) {
      console.log(`Polling stopped for ${tokenId} after 3 minutes`);
      return;
    }

    console.log(`🔄 Polling attempt #${attempt} for ${tokenId}`);

    try {
      let newPublicBalance: bigint | null = null;
      let newPrivateBalance: bigint | null = null;
      let shouldContinuePolling = false;

      if (publicBalances[tokenId] !== undefined) {
        if (tokenId === 'ALEO') {
          newPublicBalance = await getAleoBalance(publicKey);
        } else {
          newPublicBalance = await getPublicBalance(tokenId, publicKey);
        }

        if (newPublicBalance !== null && newPublicBalance !== publicBalances[tokenId]) {
          console.log(`Updating public balance for ${tokenId}: ${newPublicBalance}`);
          setPublicBalances((prev: TokenBalances) => ({
            ...prev,
            [tokenId]: newPublicBalance!
          }));
        } else {
          shouldContinuePolling = true;
        }
      }

      if (privateBalances[tokenId] !== undefined && requestRecords) {
        const creditsRecords = tokenId === 'ALEO' ? await requestRecords('credits.aleo') : [];
        const tokenRecords = tokenId !== 'ALEO' ? await requestRecords('token_registry.aleo') : [];
        
        const relevantRecords = [...creditsRecords, ...tokenRecords].filter(record => {
          if (record.program_id === 'credits.aleo') {
            return tokenId === 'ALEO';
          }
          const recordTokenId = record.data?.token_id?.split('.')[0];
          return recordTokenId === tokenId;
        });

        const privateBalancesData = await getPrivateBalances(relevantRecords);
        newPrivateBalance = privateBalancesData[tokenId] || BigInt(0);

        if (newPrivateBalance !== privateBalances[tokenId]) {
          console.log(`Updating private balance from blockchain for ${tokenId}: ${newPrivateBalance}`);
          setPrivateBalances((prev: TokenBalances) => ({
            ...prev,
            [tokenId]: newPrivateBalance!
          }));
          shouldContinuePolling = false;
        } else {
          shouldContinuePolling = true;
        }
      }

      if (shouldContinuePolling) {
        // Dynamic polling interval: start fast, then slow down
        const interval = attempt <= 3 ? 2000 : attempt <= 6 ? 3000 : 5000;
        console.log(`⏰ Next poll in ${interval}ms (attempt ${attempt + 1})`);
        
        pollingTimeoutRef.current = setTimeout(() => {
          pollTokenBalance(tokenId, startTime, attempt + 1);
        }, interval);
      } else {
        console.log(`✅ Polling completed for ${tokenId} - all balances updated`);
      }

    } catch (error) {
      console.error(`❌ Error polling balance for ${tokenId} (attempt ${attempt}):`, error);
      const retryInterval = attempt <= 3 ? 3000 : 5000;
      pollingTimeoutRef.current = setTimeout(() => {
        pollTokenBalance(tokenId, startTime, attempt + 1);
      }, retryInterval);
    }
  }, [publicKey, requestRecords, publicBalances, privateBalances]);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handles successful token transfers
   * Updates balances and starts polling for updates
   */
  const handleTransferSuccess = (tokenId: string, amount: bigint, transactionId: string) => {
    console.log(`Transfer successful: ${transactionId}, Token: ${tokenId}, Amount: ${amount}`);

    setPublicBalances((prev: TokenBalances) => ({
      ...prev,
      [tokenId]: (prev[tokenId] || BigInt(0)) - amount
    }));

    setPrivateBalances((prev: TokenBalances) => ({
      ...prev,
      [tokenId]: (prev[tokenId] || BigInt(0)) + amount
    }));

    setTimeout(() => pollTokenBalance(tokenId, Date.now()), 1000);
  };

  /**
   * Handles successful lending operations
   * Updates balances and notifies parent component
   */
  const handleLendSuccess = (tokenId: string, amount: bigint, transactionId: string) => {
    console.log(`Lend successful: ${transactionId}, Token: ${tokenId}, Amount: ${amount}`);

    setPrivateBalances((prev: TokenBalances) => {
      const currentBalance = prev[tokenId] || BigInt(0);
      const newBalance = currentBalance - amount;
      console.log(`Updating private balance for ${tokenId}: ${currentBalance} -> ${newBalance}`);
      return {
        ...prev,
        [tokenId]: newBalance
      };
    });

    onLendPending(tokenId, amount, Math.floor(Date.now() / 1000), transactionId);
    setTimeout(() => pollTokenBalance(tokenId, Date.now()), 1000);
  };

  const hasPublicBalance = !isLoading && SUPPORTED_TOKENS.some(
    token => publicBalances[token.id] > BigInt(0)
  );

  const handleLendClick = (token: TokenConfig) => {
    setSelectedToken(token);
    setShowLendModal(true);
  };

  /**
   * Handles successful wrapping/unwrapping operations
   * Updates ALEO balances and wALEO balances
   */
  const handleWrapSuccess = (amount: bigint, transactionId: string, isWrap: boolean) => {
    console.log(`${isWrap ? 'Wrap' : 'Unwrap'} successful: ${transactionId}, Amount: ${amount}`);
    
    if (isWrap) {
      // Wrapping: ALEO -> wALEO
      setPrivateBalances((prev: TokenBalances) => {
        const newAleoBalance = (prev.ALEO || BigInt(0)) - amount;
        console.log(`Optimistic ALEO balance update: ${prev.ALEO || BigInt(0)} -> ${newAleoBalance}`);
        
        return {
          ...prev,
          ALEO: newAleoBalance,
          [WALEO_TOKEN.id]: (prev[WALEO_TOKEN.id] || BigInt(0)) + amount
        };
      });
    } else {
      // Unwrapping: wALEO -> ALEO
      setPrivateBalances((prev: TokenBalances) => {
        const newWAleoBalance = (prev[WALEO_TOKEN.id] || BigInt(0)) - amount;
        console.log(`Optimistic wALEO balance update: ${prev[WALEO_TOKEN.id] || BigInt(0)} -> ${newWAleoBalance}`);
        
        return {
          ...prev,
          [WALEO_TOKEN.id]: newWAleoBalance,
          ALEO: (prev.ALEO || BigInt(0)) + amount
        };
      });
    }

    // Start polling for balance updates
    setTimeout(() => pollTokenBalance('ALEO', Date.now()), 2000);
    setTimeout(() => pollTokenBalance(WALEO_TOKEN.id, Date.now()), 3000);
  };

  const handleWrapClick = () => {
    setShowWrapModal(true);
  };

  return (
    <div className='dashboard-section ds-lend'>
      {isLoading ? (
        <div className="loading-state">
          <p>Loading token balances...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-section-lend">
            <h2 className="section-title">{DASHBOARD_ASSETS_TO_LEND_TITLE}</h2>
            <div className="section-content">
              {SUPPORTED_TOKENS.map(token => (
                <React.Fragment key={token.id}>
                  <TokenBalance
                    token={token}
                    publicBalances={publicBalances}
                    privateBalances={privateBalances}
                    isLoading={isLoading}
                    onLendClick={handleLendClick}
                    onWrapClick={token.id === 'ALEO' ? handleWrapClick : undefined}
                    wAleoBalances={token.id === 'ALEO' ? publicBalances : undefined}
                  />
                  {token.id === 'ALEO' && (
                    <TokenBalance
                      token={WALEO_TOKEN}
                      publicBalances={publicBalances}
                      privateBalances={privateBalances}
                      isLoading={isLoading}
                      onLendClick={handleLendClick}
                      onWrapClick={handleWrapClick}
                      className={"wALEO-logo"}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {showTransferModal && (
              <TransferModal
                publicBalances={publicBalances}
                onClose={() => setShowTransferModal(false)}
                onTransferSuccess={handleTransferSuccess}
              />
            )}

            {showLendModal && selectedToken && (
              <LendModal
                privateBalances={privateBalances}
                onClose={() => {
                  setShowLendModal(false);
                  setSelectedToken(null);
                }}
                selectedToken={selectedToken.id}
                onLendSuccess={handleLendSuccess}
              />
            )}

            {showWrapModal && (
              <WrapModal
                aleoPrivateBalance={privateBalances.ALEO || BigInt(0)}
                wAleoPrivateBalance={privateBalances[WALEO_TOKEN.id] || BigInt(0)}
                onClose={() => setShowWrapModal(false)}
                onWrapSuccess={handleWrapSuccess}
              />
            )}
          </div>

          {hasPublicBalance && (
            <button
              className="transfer-button"
              onClick={() => setShowTransferModal(true)}
            >
              Transfer Public to Private
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default AssetsToLend; 