/**
 * YourLends Component
 * Displays user's current lending positions and pending lends
 * Shows total lent amount, average APY, and individual lend details
 * Handles lending position redemption and transaction management
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { DASHBOARD_YOUR_LENDS_TITLE, DASHBOARD_EMPTY_LENDS_MESSAGE } from '../../constants';
import { getActiveLends, prepareRedeemTransaction } from '../../utils/lendingUtils';
import { formatBalance } from '../../utils/formatUtils';
import { SUPPORTED_TOKENS } from '../../constants/tokens';
import { useSuccessAnimation } from '../../contexts/SuccessAnimationContext';
import { LENDING_TOKENS, LENDING_PROGRAM_ID, LENDING_PROGRAM_ID_USDQ } from '../../constants/lending';
import type { LendPosition, YourLendsProps } from '../../interfaces';

/**
 * YourLends Component
 * @param {YourLendsProps} props - Component props
 * @returns {JSX.Element} Component displaying user's lending positions
 */
const YourLends: React.FC<YourLendsProps> = ({ 
  pendingLends, 
  setPendingLends, 
  onRedeemSuccess 
}) => {
  // Wallet and animation hooks
  const { publicKey, requestRecords, requestTransaction } = useWallet();
  const { showSuccessAnimation } = useSuccessAnimation();

  // State management
  const [lends, setLends] = useState<LendPosition[]>([]);
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
   * Loads active lending positions
   */
  const loadLends = useCallback(async () => {
    if (!publicKey || !requestRecords) return;

    try {
      setIsLoading(true);
      setError(null);

      const activeLends = await getActiveLends(requestRecords);
      console.log('📥 Active lends:', activeLends);

      const sortedLends: LendPosition[] = activeLends.map(lend => ({
        id: lend.id,
        amount: lend.amount,
        timestamp: lend.timestamp,
        apy_snapshot: lend.apy_snapshot,
        apy: Number(lend.apy_snapshot?.replace('u128.private', '') || '0'),
        programId: lend.programId
      }));

      setLends(sortedLends);
    } catch (err) {
      console.error('❌ Error loading lends:', err);
      setError('Failed to load lending positions');
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, requestRecords]);

  /**
   * Handles the redemption of a lending position
   * @param {LendPosition} lendPosition - The lending position to redeem
   */
  const handleRedeem = async (lendPosition: LendPosition) => {
    if (!publicKey || !requestTransaction || !requestRecords) {
      console.log('❌ No public key, requestTransaction, or requestRecords available');
      return;
    }

    try {
      setIsRedeeming(lendPosition.id);
      console.log('🔄 Starting redeem process for position:', lendPosition);

      // Format the lending proof
      const lendingProof = {
        id: lendPosition.id,
        owner: publicKey,
        amount: `${lendPosition.amount}u128`,
        timestamp: `${lendPosition.timestamp}u32`,
        apy_snapshot: `${lendPosition.apy_snapshot || '0'}u128`
      };

      console.log('📄 Formatted lending proof:', JSON.stringify(lendingProof, null, 2));

      // Prepare and execute transaction
      const transaction = await prepareRedeemTransaction(lendingProof, publicKey, lendPosition.programId);
      console.log('💾 Prepared redeem transaction:', transaction);

      const txId = await requestTransaction(transaction);
      console.log('✅ Transaction submitted with ID:', txId);

      // Show success animation and update state
      showSuccessAnimation();
      setLends(prev => prev.filter(lend => lend.id !== lendPosition.id));
      if (onRedeemSuccess) {
        onRedeemSuccess(LENDING_TOKENS.vUSDG, lendPosition.amount);
      }

      // Poll for transaction confirmation
      const startTime = Date.now();
      const poll = async () => {
        if (Date.now() - startTime > 180000) { // Stop after 3 minutes
          setIsRedeeming(null);
          return;
        }

        try {
          const activeLends = await getActiveLends(requestRecords);
          if (!activeLends.some(lend => lend.id === lendPosition.id)) {
            console.log('✅ Redeem transaction confirmed');
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
      console.error('❌ Error in redeem process:', error);
      let errorMessage = 'Failed to redeem position';
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || error.message.includes('User denied')) {
          errorMessage = 'Transaction cancelled by user';
        } else if (error.message.includes('Insufficient balance')) {
          errorMessage = 'Insufficient balance for fees';
        } else {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsRedeeming(null);
    }
  };

  // Polling for pending lends
  useEffect(() => {
    if (!publicKey || !requestRecords || !pendingLends.length) return;

    let isMounted = true;
    const timeouts: NodeJS.Timeout[] = [];

    pendingLends.forEach((pendingLend) => {
      const startTime = Date.now();
      const poll = async () => {
        if (!isMounted) return;
        if (Date.now() - startTime > 180000) { // Stop after 3 minutes
          console.log(`⏰ Polling timeout for lend ${pendingLend.transactionId}`);
          const updatedLends = pendingLends.filter(lend => lend !== pendingLend);
          setPendingLends(updatedLends);
          return;
        }

        try {
          console.log(`🔍 Polling for new avUSDG records for transaction ${pendingLend.transactionId}`);
          
          // Get records from both lending programs
          const [recordsUSDG, recordsUSDQ] = await Promise.all([
            requestRecords(LENDING_PROGRAM_ID),
            requestRecords(LENDING_PROGRAM_ID_USDQ)
          ]);
          const records = [...recordsUSDG, ...recordsUSDQ];
          console.log('📥 All records received:', records.length);

          // Filter for unspent avUSDG/avUSDQ records that we haven't seen before
          const avUSDGRecords = records.filter(record =>
            !record.spent &&
            (record.recordName === 'avUSDG' || record.recordName === 'avUSDQ')
          );

          console.log('📋 avToken records found:', avUSDGRecords);

          // Check if we have a new record that wasn't in our active lends
          for (const record of avUSDGRecords) {
            const recordId = record.id;
            if (!recordId) continue;

            // Check if this record is already in our active lends
            const alreadyExists = lends.some(lend => lend.id === recordId);
            if (alreadyExists) continue;

            console.log(`🔍 Found potential new lend record: ${recordId}`);
            
            // Extract record data
            const amount = record.data?.amount ? BigInt(record.data.amount.replace('u128.private', '')) : BigInt(0);
            const timestamp = record.data?.timestamp ? parseInt(record.data.timestamp.replace('u32.private', '')) : 0;
            const apy_snapshot = record.data?.apy_snapshot?.replace('u128.private', '') || '0';

            console.log('📊 Record details:', {
              recordId,
              amount: amount.toString(),
              timestamp,
              apy_snapshot,
              pendingAmount: pendingLend.amount.toString()
            });

            // Check if this matches our pending lend
            if (amount === pendingLend.amount) {
              console.log('✅ Found matching record for pending lend!', {
                recordId,
                amount: amount.toString(),
                timestamp,
                apy_snapshot
              });

              // Create new lend position
              const newLendPosition: LendPosition = {
                id: recordId,
                amount: amount,
                timestamp: timestamp,
                apy_snapshot: apy_snapshot,
                apy: Number(apy_snapshot),
                programId: record.recordName === 'avUSDQ' ? LENDING_PROGRAM_ID_USDQ : LENDING_PROGRAM_ID
              };

              // Update active lends immediately
              setLends(prev => {
                const newLends = [...prev, newLendPosition].sort((a, b) => b.timestamp - a.timestamp);
                console.log('📊 Updated active lends:', newLends);
                return newLends;
              });
              
              // Remove from pending lends
              const updatedLends = pendingLends.filter(lend => lend !== pendingLend);
              setPendingLends(updatedLends);
              console.log('✅ Removed from pending lends');
              return;
            }
          }
        } catch (e) {
          console.error('❌ Error polling for pending lend:', e);
        }
        
        timeouts.push(setTimeout(poll, 5000));
      };
      poll();
    });

    return () => {
      isMounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, [pendingLends, publicKey, requestRecords, lends, setPendingLends]);

  // Update elapsed times
  useEffect(() => {
    if (!pendingLends.length) {
      setElapsedTimes({});
      return;
    }

    // Show details when there are pending lends
    setShowDetails(true);

    const updateElapsedTimes = () => {
      const now = Math.floor(Date.now() / 1000);
      const newElapsedTimes: { [key: string]: string } = {};
      
      pendingLends.forEach(lend => {
        const diff = now - lend.timestamp;
        newElapsedTimes[lend.timestamp.toString()] = formatElapsedTime(diff);
      });
      
      setElapsedTimes(newElapsedTimes);
    };

    updateElapsedTimes();
    const interval = setInterval(updateElapsedTimes, 1000);
    return () => clearInterval(interval);
  }, [pendingLends]);

  // Initial load and cleanup
  useEffect(() => {
    loadLends();
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [loadLends]);

  // Calculate totals and averages
  const totalAmountLent = lends.reduce((total, lend) => total + lend.amount, BigInt(0)) + 
    pendingLends.reduce((total, lend) => total + lend.amount, BigInt(0));

  const averageApy = lends.length > 0 
    ? lends.reduce((sum, lend) => {
        const weight = Number(lend.amount) / Number(totalAmountLent);
        return sum + (lend.apy * weight);
      }, 0)
    : 0;

  // Get token configuration
  const vUSDGToken = SUPPORTED_TOKENS.find(token => token.id === '5983142094692128773510225623816045070304444621008302359049788306211838130558field');
  const decimals = vUSDGToken?.decimals || 6;

  return (
    <div className='dashboard-section ds-lend'>
      <div className="dashboard-section">
        <h2 className="section-title">{DASHBOARD_YOUR_LENDS_TITLE}</h2>
        <div className="section-content">
          {isLoading ? (
            <p className="loading-state">Loading...</p>
          ) : error ? (
            <p className="error-state">{error}</p>
          ) : lends.length === 0 && pendingLends.length === 0 ? (
            <p className="empty-state">{DASHBOARD_EMPTY_LENDS_MESSAGE}</p>
          ) : (
            <>
              {/* Total Lending Summary */}
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
                    <span className="token-balance-label">Total Lent:</span>
                    <span className="token-balance-label">Average APY:</span>
                    <span className="token-balance-value">{formatBalance(totalAmountLent, decimals)}</span>
                    <span className="token-balance-value">
                      {pendingLends.length > 0 ? (
                        <div className="lend-skeleton-apy">Calculating...</div>
                      ) : (
                        `${averageApy.toFixed(2)}%`
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lending Details */}
              {showDetails && (
                <div className="lends-details">
                  {/* Pending Lends */}
                  {pendingLends.map((lend, idx) => (
                    <div key={idx} className="lend-skeleton">
                      <div className="lend-skeleton-info">
                        <div className="lend-skeleton-amount">
                          {formatBalance(lend.amount, decimals)} vUSDG
                        </div>
                        <div className="lend-skeleton-date">
                          {elapsedTimes[lend.timestamp.toString()] || 'A few seconds ago'}
                        </div>
                      </div>
                      <div className="lend-skeleton-status">
                        Processing...
                      </div>
                    </div>
                  ))}

                  {/* Active Lends - Sorted by date */}
                  {lends
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((lend) => (
                      <div key={lend.id} className="lend-detail-item">
                        <div className="lend-detail-info">
                          <div className="lend-detail-row">
                            <div className="lend-detail-amount">
                              {formatBalance(lend.amount, decimals)} vUSDG
                            </div>
                            <div className="lend-detail-date">
                              {formatDate(lend.timestamp)}
                            </div>
                            <div className="lend-detail-apy">
                              <div>APY:</div>
                              <div>{lend.apy.toFixed(2)}%</div>
                            </div>
                          </div>
                          <div className="lend-detail-actions">
                            <button
                              className={`action-button ${isRedeeming === lend.id ? 'processing' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRedeem(lend);
                              }}
                              disabled={isRedeeming === lend.id}
                            >
                              Redeem
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

export default YourLends; 