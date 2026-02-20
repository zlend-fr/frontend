/**
 * BorrowModal Component
 * Modal dialog for borrowing tokens with collateral
 * Handles the borrowing process, collateral selection, and transaction management
 */

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { formatBalance } from '../../utils/formatUtils';
import { BorrowModalProps, TokenRecord } from '../../interfaces';
import { SUPPORTED_TOKENS, WALEO_TOKEN } from '../../constants/tokens';
import { useSuccessAnimation } from '../../contexts/SuccessAnimationContext';
import { prepareBorrowTransaction } from '../../utils/lendingUtils';

import '../../styles/global.css';

/**
 * BorrowModal Component
 * @param {BorrowModalProps} props - Component props
 * @returns {React.ReactPortal | null} Modal dialog for borrowing tokens
 */
const BorrowModal: React.FC<BorrowModalProps> = ({ 
  privateBalances, 
  onClose, 
  selectedToken, 
  onBorrowSuccess 
}) => {
  // Wallet and animation hooks
  const { publicKey, requestTransaction, requestRecords } = useWallet();
  const { showSuccessAnimation } = useSuccessAnimation();

  // State management
  const [borrowAmount, setBorrowAmount] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [selectedCollateral, setSelectedCollateral] = useState('');
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [borrowError, setBorrowError] = useState<string | null>(null);

  // Refs
  const modalContentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get available tokens for collateral (excluding the token being borrowed and ALEO)
  // Include wALEO as collateral option if available
  const supportedCollateralTokens = SUPPORTED_TOKENS.filter(token => token.id !== 'ALEO');
  const allPossibleCollateralTokens = [...supportedCollateralTokens, WALEO_TOKEN];
  
  const availableCollateralTokens = allPossibleCollateralTokens.filter(token => 
    token.id !== selectedToken && 
    (privateBalances?.[token.id] || BigInt(0)) > BigInt(0)
  );

  // Set default collateral if available
  useEffect(() => {
    if (availableCollateralTokens.length > 0 && !selectedCollateral) {
      setSelectedCollateral(availableCollateralTokens[0].id);
    }
  }, [availableCollateralTokens, selectedCollateral]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  /**
   * Handles the borrow transaction process
   * Validates inputs, prepares transaction, and handles success/error states
   */
  const handleBorrow = async () => {
    if (!requestTransaction || !publicKey || !borrowAmount || !collateralAmount || !selectedCollateral || !requestRecords) {
      return;
    }

    setIsBorrowing(true);
    setBorrowError(null);

    try {
      const selectedTokenConfig = allPossibleCollateralTokens.find(token => token.id === selectedToken) || SUPPORTED_TOKENS.find(token => token.id === selectedToken);
      const collateralTokenConfig = allPossibleCollateralTokens.find(token => token.id === selectedCollateral);
      
      if (!selectedTokenConfig || !collateralTokenConfig) {
        throw new Error('Invalid token configuration');
      }

      const borrowDecimals = selectedTokenConfig.decimals;
      const collateralDecimals = collateralTokenConfig.decimals;
      
      const borrowAmountInMicrocredits = BigInt(Math.floor(parseFloat(borrowAmount) * Math.pow(10, borrowDecimals)));
      const collateralAmountInMicrocredits = BigInt(Math.floor(parseFloat(collateralAmount) * Math.pow(10, collateralDecimals)));

      console.log('🔍 Looking for collateral records...', {
        selectedCollateral,
        collateralAmountInMicrocredits: collateralAmountInMicrocredits.toString(),
        availableBalance: privateBalances[selectedCollateral]?.toString(),
        collateralTokenConfig
      });

      // Get token records for collateral
      const records = await requestRecords('token_registry.aleo');
      console.log('📥 Received token records:', records);

      // Log records for debugging
      records.forEach((record: TokenRecord, index: number) => {
        console.log(`Record ${index}:`, {
          spent: record.spent,
          token_id: record.data?.token_id,
          amount: record.data?.amount,
          program_id: record.program_id
        });
      });

      // Filter and sort records by amount
      const availableRecords = records
        .filter((record: TokenRecord) => {
          const isNotSpent = !record.spent;
          const recordTokenId = record.data?.token_id;
          const hasTokenId = recordTokenId === `${selectedCollateral}.private`;
          const hasAmount = record.data?.amount;
          
          console.log('Filtering record:', {
            isNotSpent,
            hasTokenId,
            hasAmount,
            recordTokenId,
            selectedCollateral,
            expectedTokenId: `${selectedCollateral}.private`
          });

          return isNotSpent && hasTokenId && hasAmount;
        })
        .map((record: TokenRecord) => {
          const amount = BigInt(record.data?.amount?.split('u128')[0] || '0');
          console.log('Mapped record:', {
            id: record.id,
            amount: amount.toString(),
            token_id: record.data?.token_id
          });
          return {
            ...record,
            amount
          };
        })
        .sort((a: { amount: bigint }, b: { amount: bigint }) => Number(b.amount - a.amount));

      console.log('📊 Available collateral records:', availableRecords);

      // Find suitable collateral record
      const collateralRecord = availableRecords.find((record: { amount: bigint }) => 
        record.amount >= collateralAmountInMicrocredits
      );

      if (!collateralRecord) {
        console.error('❌ No suitable collateral record found. Available records:', availableRecords);
        throw new Error('No suitable collateral record found. You may need to consolidate your records or use a different amount.');
      }

      console.log('✅ Found suitable collateral record:', collateralRecord);

      // Get next loan ID (placeholder)
      const loanId = 2;

      // Format collateral record for transaction
      const formattedCollateralRecord = {
        id: collateralRecord.id,
        owner: collateralRecord.owner,
        program_id: collateralRecord.program_id,
        spent: collateralRecord.spent,
        recordName: collateralRecord.recordName,
        data: collateralRecord.data
      };

      console.log('📋 Formatted collateral record:', formattedCollateralRecord);

      // Prepare and send transaction
      const transaction = await prepareBorrowTransaction(
        loanId,
        formattedCollateralRecord,
        collateralAmountInMicrocredits,
        borrowAmountInMicrocredits,
        publicKey
      );

      console.log('📝 Prepared borrow transaction:', transaction);

      const transactionId = await requestTransaction(transaction);
      console.log('✅ Transaction sent successfully:', transactionId);
      
      // Reset form and close modal
      setBorrowAmount('');
      setCollateralAmount('');
      if (inputRef.current) {
        inputRef.current.focus();
      }

      onClose();
      if (onBorrowSuccess) {
        onBorrowSuccess(
          selectedToken,
          borrowAmountInMicrocredits,
          transactionId,
          selectedCollateral,
          collateralAmountInMicrocredits
        );
      }
      showSuccessAnimation();

    } catch (error) {
      console.error('❌ Error during borrow process:', error);
      
      let errorMessage = 'Borrowing failed';
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || error.message.includes('User denied')) {
          errorMessage = 'Transaction cancelled';
        } else if (error.message.includes('No suitable collateral record')) {
          errorMessage = error.message;
        } else if (error.message.includes('Insufficient balance')) {
          errorMessage = 'Insufficient balance for borrowing and fees';
        } else if (error.message.includes('fee')) {
          errorMessage = 'Insufficient ALEO for transaction fees';
        } else {
          errorMessage = 'Transaction failed. Please try again.';
        }
      }
      setBorrowError(errorMessage);
    } finally {
      setIsBorrowing(false);
    }
  };

  // Get modal root element
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  // Get token configurations
  const selectedTokenConfig = allPossibleCollateralTokens.find(token => token.id === selectedToken) || SUPPORTED_TOKENS.find(token => token.id === selectedToken);
  const tokenName = selectedTokenConfig?.symbol || 'Unknown';

  const selectedCollateralConfig = allPossibleCollateralTokens.find(token => token.id === selectedCollateral);
  const collateralName = selectedCollateralConfig?.symbol || 'Unknown';

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content" role="dialog" aria-modal="true" ref={modalContentRef}>
        <h3>Borrow {tokenName}</h3>
        
        <div className="modal-input-group">
          <label>Amount to Borrow ({tokenName})</label>
          <input
            ref={inputRef}
            type="number"
            step="0.000001"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isBorrowing && borrowAmount && parseFloat(borrowAmount) > 0) {
                handleBorrow();
              }
            }}
            placeholder="0.00"
            className="custom-number-input"
            disabled={isBorrowing}
          />
        </div>

        <div className="modal-input-group">
          <label>Collateral Token</label>
          <select
            value={selectedCollateral}
            onChange={(e) => setSelectedCollateral(e.target.value)}
            disabled={isBorrowing}
            className="token-select"
          >
            {availableCollateralTokens.map(token => (
              <option key={token.id} value={token.id}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-input-group">
          <label>Collateral Amount ({collateralName})</label>
          <input
            type="number"
            step="0.000001"
            value={collateralAmount}
            onChange={(e) => setCollateralAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isBorrowing && borrowAmount && collateralAmount && parseFloat(borrowAmount) > 0 && parseFloat(collateralAmount) > 0) {
                handleBorrow();
              }
            }}
            placeholder="0.00"
            className="custom-number-input"
            disabled={isBorrowing}
          />
          <div className="available-balance">
            <div className="balance-item">
              <span className="balance-label">Available:</span>
              <span className="balance-value">
                {selectedCollateralConfig ? formatBalance(privateBalances[selectedCollateral], selectedCollateralConfig.decimals) : '0'} {collateralName}
              </span>
            </div>
          </div>
        </div>

        {borrowError && (
          <div className="error-message">
            {borrowError}
          </div>
        )}

        <div className="modal-actions">
          <button
            className="primary-button"
            onClick={handleBorrow}
            disabled={isBorrowing || !borrowAmount || !collateralAmount || parseFloat(borrowAmount) <= 0 || parseFloat(collateralAmount) <= 0}
          >
            {isBorrowing ? 'Processing...' : 'Borrow'}
          </button>
          <button
            className="secondary-button"
            onClick={onClose}
            disabled={isBorrowing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default BorrowModal; 