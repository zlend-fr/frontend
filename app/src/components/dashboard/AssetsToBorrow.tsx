/**
 * AssetsToBorrow Component
 * Displays a list of tokens available for borrowing and handles the borrow modal interaction
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TokenConfig } from '../../interfaces';
import { SUPPORTED_TOKENS, WALEO_TOKEN } from '../../constants/tokens';
import { DASHBOARD_ASSETS_TO_BORROW_TITLE } from '../../constants';
import TokenBalance from './TokenBalance';
import BorrowModal from './BorrowModal';
import { TokenBalances } from '../../interfaces';
import { getLendingTotals } from '../../utils/lendingUtils';
import { LENDING_TOKENS } from '../../constants/lending';

/**
 * Props for the AssetsToBorrow component
 * @property {TokenBalances} publicBalances - User's public token balances
 * @property {TokenBalances} privateBalances - User's private token balances
 * @property {Function} onBorrowSuccess - Callback for successful borrowing
 */
interface AssetsToBorrowProps {
  publicBalances: TokenBalances;
  privateBalances: TokenBalances;
  onBorrowSuccess: (tokenId: string, amount: bigint, transactionId: string, collateralTokenId: string, collateralAmount: bigint) => void;
}

const AssetsToBorrow: React.FC<AssetsToBorrowProps> = ({
  publicBalances,
  privateBalances,
  onBorrowSuccess
}) => {
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lendingTotals, setLendingTotals] = useState<{ supplied: bigint; borrowed: bigint }>({ supplied: BigInt(0), borrowed: BigInt(0) });
  const optimisticAvailableRef = useRef<bigint | null>(null);
  const lastBorrowAmountRef = useRef<bigint | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Get borrowable tokens (wALEO first, then others excluding ALEO)
  const borrowableTokens = [WALEO_TOKEN, ...SUPPORTED_TOKENS.filter(token => token.id !== 'ALEO')];

  // Load lending totals
  const loadLendingTotals = useCallback(async () => {
    try {
      console.log('🔄 Loading lending totals...');
      const totals = await getLendingTotals();
      console.log('📥 Lending totals loaded:', {
        supplied: totals.supplied.toString(),
        borrowed: totals.borrowed.toString(),
        available: (totals.supplied - totals.borrowed).toString()
      });
      
      // Only reset optimistic value if we have a pending borrow and the new totals reflect it
      if (lastBorrowAmountRef.current) {
        const expectedBorrowed = lendingTotals.borrowed + lastBorrowAmountRef.current;
        console.log('🔍 Checking borrow confirmation:', {
          currentBorrowed: totals.borrowed.toString(),
          expectedBorrowed: expectedBorrowed.toString(),
          lastBorrowAmount: lastBorrowAmountRef.current.toString()
        });
        
        if (totals.borrowed >= expectedBorrowed) {
          console.error('!!! CRITICAL: Resetting optimisticAvailableRef.current to null in main poll');
          console.log('✅ Borrow confirmed on chain, resetting optimistic value');
          optimisticAvailableRef.current = null;
          lastBorrowAmountRef.current = null;
          setUpdateTrigger(prev => prev + 1);
        }
      }
      
      setLendingTotals(totals);
    } catch (error) {
      console.error('❌ Error loading lending totals:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadLendingTotals();
  }, [loadLendingTotals]);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(loadLendingTotals, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [loadLendingTotals]);

  /**
   * Handles the click on a token's borrow button
   * @param {TokenConfig} token - The selected token configuration
   */
  const handleBorrowClick = (token: TokenConfig) => {
    setSelectedToken(token);
    setShowBorrowModal(true);
  };

  /**
   * Handles successful borrow operations
   */
  const handleBorrowSuccess = async (
    tokenId: string,
    amount: bigint,
    transactionId: string,
    collateralTokenId: string,
    collateralAmount: bigint
  ) => {
    console.log('🚀 Borrow success called with:', {
      tokenId,
      amount: amount.toString(),
      transactionId,
      collateralTokenId,
      collateralAmount: collateralAmount.toString()
    });

    onBorrowSuccess(tokenId, amount, transactionId, collateralTokenId, collateralAmount);
    
    // Store current available amount before updating
    const currentAvailable = lendingTotals.supplied - lendingTotals.borrowed;
    console.log('📊 Current available before update:', currentAvailable.toString());
    
    // Set optimistic available amount by subtracting the borrowed amount
    const newOptimisticAvailable = currentAvailable - amount;
    console.log('🎯 Setting optimistic available:', {
      current: currentAvailable.toString(),
      borrowed: amount.toString(),
      new: newOptimisticAvailable.toString()
    });
    optimisticAvailableRef.current = newOptimisticAvailable;
    setUpdateTrigger(prev => prev + 1);
    
    // Store the borrowed amount for polling verification
    lastBorrowAmountRef.current = amount;
    console.log('💾 Stored borrow amount for verification:', amount.toString());
    
    // Force immediate update of lending totals
    setLendingTotals(prev => {
      const newBorrowed = prev.borrowed + amount;
      console.log('📈 Updating lending totals:', {
        previous: {
          supplied: prev.supplied.toString(),
          borrowed: prev.borrowed.toString(),
          available: (prev.supplied - prev.borrowed).toString()
        },
        new: {
          supplied: prev.supplied.toString(),
          borrowed: newBorrowed.toString(),
          available: (prev.supplied - newBorrowed).toString()
        }
      });
      return {
        ...prev,
        borrowed: newBorrowed
      };
    });

    // Poll for transaction confirmation and totals update
    const startTime = Date.now();
    const poll = async () => {
      if (Date.now() - startTime > 180000) { // Stop after 3 minutes
        console.log('⏰ Polling timeout reached');
        lastBorrowAmountRef.current = null;
        return;
      }

      try {
        const totals = await getLendingTotals();
        const expectedBorrowed = lendingTotals.borrowed + amount;
        console.log('🔍 Polling lending totals:', {
          supplied: totals.supplied.toString(),
          borrowed: totals.borrowed.toString(),
          available: (totals.supplied - totals.borrowed).toString(),
          expectedBorrowed: expectedBorrowed.toString()
        });
        
        // Check if the borrowed amount has been updated on chain
        if (totals.borrowed >= expectedBorrowed) {
          console.log('✅ Borrow confirmed on chain');
          console.log('Previous optimistic value:', optimisticAvailableRef.current?.toString());
          setLendingTotals(totals);
          optimisticAvailableRef.current = null;
          lastBorrowAmountRef.current = null;
          setUpdateTrigger(prev => prev + 1);
          return;
        }
      } catch (error) {
        console.error('❌ Error polling lending totals:', error);
      }

      // Continue polling
      setTimeout(poll, 5000);
    };

    // Start polling
    poll();
  };

  // Calculate available amount
  const getAvailableAmount = useCallback((tokenId: string): bigint => {
    if (tokenId !== LENDING_TOKENS.vUSDG) return BigInt(0);
    
    const available = optimisticAvailableRef.current !== null 
      ? optimisticAvailableRef.current 
      : lendingTotals.supplied - lendingTotals.borrowed;
    
    console.log('💰 Getting available amount:', {
      tokenId,
      optimisticAvailable: optimisticAvailableRef.current?.toString(),
      calculatedAvailable: (lendingTotals.supplied - lendingTotals.borrowed).toString(),
      finalAvailable: available.toString()
    });
    
    return available;
  }, [lendingTotals, updateTrigger]);

  return (
    <div className='dashboard-section ds-lend'>
      <div className="dashboard-section">
        <h2 className="section-title">{DASHBOARD_ASSETS_TO_BORROW_TITLE}</h2>
        <div className="section-content">
          {borrowableTokens.map(token => (
            <TokenBalance
              key={`${token.id}-${updateTrigger}`}
              token={token}
              publicBalances={publicBalances}
              privateBalances={privateBalances}
              isLoading={isLoading}
              onLendClick={handleBorrowClick}
              actionType="borrow"
              availableAmount={getAvailableAmount(token.id)}
            />
          ))}
        </div>

        {showBorrowModal && selectedToken && (
          <BorrowModal
            privateBalances={privateBalances}
            onClose={() => setShowBorrowModal(false)}
            selectedToken={selectedToken.id}
            onBorrowSuccess={handleBorrowSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default AssetsToBorrow; 