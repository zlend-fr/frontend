/**
 * YourBorrows Component
 * Displays user's current borrow positions and pending borrows
 * Shows total borrowed amount and individual borrow details with timestamps
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { DASHBOARD_YOUR_BORROWS_TITLE, DASHBOARD_EMPTY_BORROWS_MESSAGE } from '../../constants';
import { formatBalance } from '../../utils/formatUtils';
import { SUPPORTED_TOKENS } from '../../constants/tokens';
import { useSuccessAnimation } from '../../contexts/SuccessAnimationContext';
import { getActiveBorrows, prepareRedeemBorrowTransaction } from '../../utils/lendingUtils';
import { LENDING_PROGRAM_ID, LENDING_PROGRAM_ID_USDQ } from '../../constants/lending';
import type { BorrowPosition, TokenBalances } from '../../interfaces';

/**
 * Interface for pending borrow operations
 * @property {string} tokenId - ID of the borrowed token
 * @property {bigint} amount - Amount borrowed
 * @property {number} timestamp - Unix timestamp of the borrow operation
 * @property {bigint} collateralAmount - Amount of collateral provided
 * @property {string} collateralTokenId - ID of the collateral token
 * @property {string} transactionId - Transaction ID of the borrow operation
 */
interface PendingBorrow {
  tokenId: string;
  amount: bigint;
  timestamp: number;
  collateralAmount: bigint;
  collateralTokenId: string;
  transactionId: string;
}

/**
 * Props for the YourBorrows component
 * @property {PendingBorrow[]} pendingBorrows - Array of pending borrow operations
 * @property {React.Dispatch<React.SetStateAction<PendingBorrow[]>>} setPendingBorrows - Function to update pending borrows
 * @property {Function} onRepaySuccess - Callback for successful repayment
 * @property {React.Dispatch<React.SetStateAction<TokenBalances>>} setPrivateBalances - Function to update private balances
 */
interface YourBorrowsProps {
  pendingBorrows: PendingBorrow[];
  setPendingBorrows: React.Dispatch<React.SetStateAction<PendingBorrow[]>>;
  onRepaySuccess: (tokenId: string, amount: bigint, collateralTokenId: string, collateralAmount: bigint) => void;
  setPrivateBalances: React.Dispatch<React.SetStateAction<TokenBalances>>;
}

/**
 * YourBorrows Component
 * @param {YourBorrowsProps} props - Component props
 * @returns {JSX.Element} Component displaying user's borrow positions
 */
const YourBorrows: React.FC<YourBorrowsProps> = ({ 
  pendingBorrows, 
  setPendingBorrows, 
  onRepaySuccess,
  setPrivateBalances
}) => {
  // Wallet and animation hooks
  const { publicKey, requestRecords, requestTransaction } = useWallet();
  const { showSuccessAnimation } = useSuccessAnimation();

  // State management
  const [activeBorrows, setActiveBorrows] = useState<BorrowPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [elapsedTimes, setElapsedTimes] = useState<{ [key: string]: string }>({});

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Refs
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Formats elapsed time since a given timestamp
   * @param {number} diff - Time difference in seconds
   * @returns {string} Formatted elapsed time string
   */
  const formatElapsedTime = (diff: number): string => {
    if (diff < 10) return 'A few seconds ago';
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 120) return '1 minute ago';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 7200) return '1 hour ago';
    return `${Math.floor(diff / 3600)} hours ago`;
  };

  /**
   * Formats a timestamp into a localized date string
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Formatted date string
   */
  const formatDate = (timestamp: number) => {
    const startDate = new Date('2024-08-27T02:16:30Z');
    const date = new Date(startDate.getTime() + (timestamp * 1000));
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }) + ' UTC';
  };

  /**
   * Loads active borrow positions
   */
  const loadBorrows = useCallback(async () => {
    if (!publicKey || !requestRecords) return;

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Loading borrows for address:', publicKey);
      
      const borrows = await getActiveBorrows(requestRecords);
      console.log('📥 Active borrows:', borrows);
      
      // Format borrows for display
      const formattedBorrows = borrows.map(borrow => ({
        ...borrow,
        apr: Number(borrow.apr_snapshot) // APR is already in percentage
      }));
      
      setActiveBorrows(formattedBorrows);
    } catch (err) {
      console.error('❌ Error loading borrows:', err);
      setError('Failed to load borrows');
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, requestRecords]);

  // Polling for pending borrows
  useEffect(() => {
    if (!publicKey || !requestRecords || !pendingBorrows.length) return;

    let isMounted = true;
    const timeouts: NodeJS.Timeout[] = [];

    pendingBorrows.forEach((pendingBorrow) => {
      const startTime = Date.now();
      const poll = async () => {
        if (!isMounted) return;
        if (Date.now() - startTime > 180000) { // Stop after 3 minutes
          console.log(`⏰ Polling timeout for borrow ${pendingBorrow.transactionId}`);
          const updatedBorrows = pendingBorrows.filter(borrow => borrow !== pendingBorrow);
          setPendingBorrows(updatedBorrows);
          return;
        }

        try {
          console.log(`🔍 Polling for new LoanPrivate records for transaction ${pendingBorrow.transactionId}`);
          
          // Get LoanPrivate records from both lending programs
          const [recordsUSDG, recordsUSDQ] = await Promise.all([
            requestRecords(LENDING_PROGRAM_ID),
            requestRecords(LENDING_PROGRAM_ID_USDQ)
          ]);
          const records = [...recordsUSDG, ...recordsUSDQ];
          console.log('📥 All records received:', records.length);
          
          // Filter for unspent LoanPrivate records that we haven't seen before
          const loanPrivateRecords = records.filter(record => 
            !record.spent && 
            record.recordName === 'LoanPrivate'
          );
          
          console.log('📋 LoanPrivate records found:', loanPrivateRecords);

          // Check if we have a new record that wasn't in our active borrows
          for (const record of loanPrivateRecords) {
            const loanId = record.data.id_public;
            if (!loanId) continue;

            // Check if this loan is already in our active borrows
            const alreadyExists = activeBorrows.some(borrow => borrow.id === loanId);
            if (alreadyExists) continue;

            console.log(`🔍 Found potential new loan ID: ${loanId}, fetching public details...`);
            
            // Fetch public loan details
            const { getPublicLoanDetails } = await import('../../utils/lendingUtils');
            const loanDetails = await getPublicLoanDetails(loanId);
            
            if (!loanDetails) {
              console.warn(`⚠️ Could not fetch details for loan: ${loanId}`);
              continue;
            }

            console.log('📊 Fetched loan details:', loanDetails);

            // Check if this matches our pending borrow
            const matchesPending = (
              loanDetails.borrowed_amount === pendingBorrow.amount &&
              loanDetails.collateral_amount === pendingBorrow.collateralAmount &&
              loanDetails.collateral_token_id === pendingBorrow.collateralTokenId
            );

            if (matchesPending) {
              console.log('✅ Found matching loan for pending borrow!', {
                loanId,
                borrowedAmount: loanDetails.borrowed_amount.toString(),
                collateralAmount: loanDetails.collateral_amount.toString(),
                collateralTokenId: loanDetails.collateral_token_id
              });

              // Create new borrow position
              const newBorrowPosition = {
                id: loanId,
                borrowed_amount: loanDetails.borrowed_amount,
                collateral_amount: loanDetails.collateral_amount,
                collateral_token_id: loanDetails.collateral_token_id,
                timestamp: loanDetails.timestamp,
                apr_snapshot: loanDetails.apr_snapshot,
                apr: Number(loanDetails.apr_snapshot) // Convert to percentage
              };

              // Update active borrows immediately
              setActiveBorrows(prev => {
                const newBorrows = [...prev, newBorrowPosition].sort((a, b) => b.timestamp - a.timestamp);
                console.log('📊 Updated active borrows:', newBorrows);
                return newBorrows;
              });
              
              // Remove from pending borrows
              const updatedBorrows = pendingBorrows.filter(borrow => borrow !== pendingBorrow);
              setPendingBorrows(updatedBorrows);
              console.log('✅ Removed from pending borrows');
              return;
            }
          }
        } catch (e) {
          console.error('❌ Error polling for pending borrow:', e);
        }
        
        timeouts.push(setTimeout(poll, 5000));
      };
      poll();
    });

    return () => {
      isMounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, [pendingBorrows, publicKey, requestRecords, activeBorrows, setPendingBorrows]);

  // Update elapsed times
  useEffect(() => {
    if (!pendingBorrows.length) {
      setElapsedTimes({});
      return;
    }

    // Show details when there are pending borrows
    setShowDetails(true);

    const updateElapsedTimes = () => {
      const now = Math.floor(Date.now() / 1000);
      const newElapsedTimes: { [key: string]: string } = {};
      
      pendingBorrows.forEach(borrow => {
        const diff = now - borrow.timestamp;
        newElapsedTimes[borrow.timestamp.toString()] = formatElapsedTime(diff);
      });
      
      setElapsedTimes(newElapsedTimes);
    };

    updateElapsedTimes();
    const interval = setInterval(updateElapsedTimes, 1000);
    return () => clearInterval(interval);
  }, [pendingBorrows]);

  // Initial load and cleanup
  useEffect(() => {
    loadBorrows();
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [loadBorrows]);

  // Calculate totals and averages
  const totalAmountBorrowed = activeBorrows.reduce((total, borrow) => total + borrow.borrowed_amount, BigInt(0)) + 
    pendingBorrows.reduce((total, borrow) => total + borrow.amount, BigInt(0));

  const averageApr = activeBorrows.length > 0 
    ? activeBorrows.reduce((sum, borrow) => {
        const weight = Number(borrow.borrowed_amount) / Number(totalAmountBorrowed);
        return sum + (borrow.apr * weight);
      }, 0)
    : 0;

  // Get token configuration
  const vUSDGToken = SUPPORTED_TOKENS.find(token => token.id === '5983142094692128773510225623816045070304444621008302359049788306211838130558field');
  const decimals = vUSDGToken?.decimals || 6;

  /**
   * Handles the repayment of a borrow position
   * @param {BorrowPosition} borrowPosition - The borrow position to repay
   */
  const handleRepay = async (borrowPosition: BorrowPosition) => {
    if (!publicKey || !requestTransaction || !requestRecords) {
      console.log('❌ No public key, requestTransaction, or requestRecords available');
      return;
    }

    try {
      setIsRedeeming(borrowPosition.id);
      console.log('🔄 Starting repay process for position:', borrowPosition);

      // Get token records for repayment
      const tokenRecords = await requestRecords('token_registry.aleo');
      console.log('📥 Received token records:', tokenRecords.length, 'records');

      // Get loan records from both programs
      const [loanRecordsUSDG, loanRecordsUSDQ] = await Promise.all([
        requestRecords(LENDING_PROGRAM_ID),
        requestRecords(LENDING_PROGRAM_ID_USDQ)
      ]);
      const loanRecords = [...loanRecordsUSDG, ...loanRecordsUSDQ];
      console.log('📥 Received loan records:', loanRecords.length, 'records');

      // Find a suitable token record for repayment
      const repaymentRecord = tokenRecords.find(record => {
        if (record.spent || !record.data) return false;
        
        // Extract token_id properly
        const tokenIdRaw = record.data.token_id;
        if (!tokenIdRaw) return false;
        
        const tokenId = tokenIdRaw.replace('.private', '');
        
        // Extract amount properly
        const amountRaw = record.data.amount;
        if (!amountRaw) return false;
        
        const amount = BigInt(amountRaw.split('u128')[0]);
        
        console.log('🔍 Checking token record:', {
          tokenId,
          amount: amount.toString(),
          required: borrowPosition.borrowed_amount.toString()
        });
        
        return tokenId === '5983142094692128773510225623816045070304444621008302359049788306211838130558field' && 
              amount >= borrowPosition.borrowed_amount;
      });

      if (!repaymentRecord) {
        throw new Error('No suitable token record found with enough balance for repayment');
      }

      console.log('✅ Found repayment record:', {
        id: repaymentRecord.id,
        amount: repaymentRecord.data?.amount
      });

      // Find the loan private record
      const loanPrivateRecord = loanRecords.find(record => {
        if (record.spent || record.recordName !== 'LoanPrivate' || !record.data) {
          return false;
        }
        
        // Extract the loan ID properly
        const loanIdRaw = record.data.id_public;
        if (!loanIdRaw) return false;
        
        const loanId = loanIdRaw.replace('.private', '').replace('u32', '');
        
        // Extract the target loan ID (remove u32.private suffix if present)
        const targetLoanId = borrowPosition.id.replace('u32.private', '').replace('.private', '');
        
        console.log('🔍 Checking loan record:', {
          recordLoanId: loanId,
          targetLoanId: targetLoanId,
          originalTargetId: borrowPosition.id
        });
        
        return loanId === targetLoanId;
      });

      if (!loanPrivateRecord) {
        throw new Error('Loan private record not found');
      }

      console.log('✅ Found loan private record:', {
        id: loanPrivateRecord.id,
        loanId: loanPrivateRecord.data?.id_public
      });

      // Prepare and execute transaction
      const transaction = await prepareRedeemBorrowTransaction(
        borrowPosition.id,
        publicKey,
        repaymentRecord,
        loanPrivateRecord
      );
      
      console.log('💾 Prepared repay transaction');

      const txId = await requestTransaction(transaction);
      console.log('✅ Transaction submitted:', txId);

      // Show success animation and update state
      showSuccessAnimation();
      setActiveBorrows(prev => prev.filter(borrow => borrow.id !== borrowPosition.id));
      if (onRepaySuccess) {
        onRepaySuccess(
          '5983142094692128773510225623816045070304444621008302359049788306211838130558field', 
          borrowPosition.borrowed_amount,
          borrowPosition.collateral_token_id,
          borrowPosition.collateral_amount
        );
      }

      // Poll for transaction confirmation
      const startTime = Date.now();
      const poll = async () => {
        if (Date.now() - startTime > 180000) { // Stop after 3 minutes
          setIsRedeeming(null);
          return;
        }

        try {
          const activeBorrows = await getActiveBorrows(requestRecords);
          if (!activeBorrows.some(borrow => borrow.id === borrowPosition.id)) {
            console.log('✅ Repay transaction confirmed');
            setIsRedeeming(null);
            return;
          }
        } catch (error) {
          console.error('❌ Error polling for transaction confirmation:', error);
        }

        setTimeout(poll, 5000);
      };

      poll();
    } catch (error) {
      console.error('❌ Error in repay process:', error);
      let errorMessage = 'Failed to repay position';
      
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || error.message.includes('User denied')) {
          errorMessage = 'Transaction cancelled by user';
        } else if (error.message.includes('No suitable token record')) {
          errorMessage = 'No token record found with enough balance. You may need to consolidate your records.';
        } else if (error.message.includes('Loan private record not found')) {
          errorMessage = 'Could not find the loan record. Please try again.';
        } else if (error.message.includes('Insufficient balance')) {
          errorMessage = 'Insufficient balance for repayment and fees';
        } else if (error.message.includes('replace is not a function')) {
          errorMessage = 'Data formatting error. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsRedeeming(null);
    }
  };

  return (
    <div className='dashboard-section ds-lend'>
      <div className="dashboard-section">
        <h2 className="section-title">{DASHBOARD_YOUR_BORROWS_TITLE}</h2>
        <div className="section-content">
          {isLoading ? (
            <p className="loading-state">Loading...</p>
          ) : error ? (
            <p className="error-state">{error}</p>
          ) : activeBorrows.length === 0 && pendingBorrows.length === 0 ? (
            <p className="empty-state">{DASHBOARD_EMPTY_BORROWS_MESSAGE}</p>
          ) : (
            <>
              {/* Total Borrowing Summary */}
              <div 
                className="asset-balance token-balance-row"
                onClick={() => setShowDetails(!showDetails)}
                style={{ cursor: 'pointer' }}
              >
                <div className="token-balance-logo">
                  <img
                    src={vUSDGToken?.image}
                    alt="vUSDG logo"
                  />
                </div>
                <div className="token-balance-info">
                  <div className="token-balance-title">vUSDG</div>
                  <div className="token-balance-balances">
                    <span className="token-balance-label">Total Borrowed:</span>
                    <span className="token-balance-label">Average APR:</span>
                    <span className="token-balance-value">{formatBalance(totalAmountBorrowed, decimals)}</span>
                    <span className="token-balance-value">
                      {pendingBorrows.length > 0 ? (
                        <div className="borrow-skeleton-apr">Calculating...</div>
                      ) : (
                        `${averageApr.toFixed(2)}%`
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Borrowing Details */}
              {showDetails && (
                <div className="borrows-details">
                  {/* Pending Borrows */}
                  {pendingBorrows.map((borrow, idx) => (
                    <div key={idx} className="borrow-skeleton">
                      <div className="borrow-skeleton-info">
                        <div className="borrow-skeleton-amount">
                          {formatBalance(borrow.amount, decimals)} vUSDG
                        </div>
                        <div className="borrow-skeleton-date">
                          {elapsedTimes[borrow.timestamp.toString()] || 'A few seconds ago'}
                        </div>
                      </div>
                      <div className="borrow-skeleton-status">
                        Processing...
                      </div>
                    </div>
                  ))}

                  {/* Active Borrows - Sorted by date */}
                  {activeBorrows
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((borrow) => (
                      <div key={borrow.id} className="lend-detail-item">
                        <div className="lend-detail-info">
                          <div className="lend-detail-row">
                            <div className="lend-detail-amount">
                              {formatBalance(borrow.borrowed_amount, decimals)} vUSDG
                            </div>
                            <div className="lend-detail-date">
                              {formatDate(borrow.timestamp)}
                            </div>
                            <div className="lend-detail-apy">
                              <div>APR:</div>
                              <div>{borrow.apr.toFixed(2)}%</div>
                            </div>
                          </div>
                          <div className="lend-detail-actions">
                            <button
                              className={`action-button ${isRedeeming === borrow.id ? 'processing' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRepay(borrow);
                              }}
                              disabled={isRedeeming === borrow.id}
                            >
                              Repay
                            </button>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourBorrows; 