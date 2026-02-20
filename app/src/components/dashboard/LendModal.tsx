/**
 * LendModal Component
 * Modal dialog for lending tokens
 * Handles the lending process, token selection, and transaction management
 */

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { TokenBalances } from '../../interfaces';
import { prepareLendingTransaction } from '../../utils/lendingUtils';
import { SUPPORTED_TOKENS, WALEO_TOKEN } from '../../constants/tokens';
import { formatBalance } from '../../utils/formatUtils';
import { REGISTRY_PROGRAM_ID } from '../../constants';
import { useSuccessAnimation } from '../../contexts/SuccessAnimationContext';

/**
 * Props for the LendModal component
 * @property {TokenBalances} privateBalances - User's private token balances
 * @property {Function} onClose - Function to close the modal
 * @property {string} selectedToken - ID of the selected token to lend
 * @property {Function} onLendSuccess - Callback when lending is successful
 */
interface LendModalProps {
  privateBalances: TokenBalances;
  onClose: () => void;
  selectedToken: string;
  onLendSuccess: (tokenId: string, amount: bigint, transactionId: string) => void;
}

/**
 * LendModal Component
 * @param {LendModalProps} props - Component props
 * @returns {React.ReactPortal | null} Modal dialog for lending tokens
 */
const LendModal: React.FC<LendModalProps> = ({ 
  privateBalances, 
  onClose, 
  selectedToken, 
  onLendSuccess 
}) => {
  // Wallet and animation hooks
  const { publicKey, requestTransaction, requestRecords } = useWallet();
  const { showSuccessAnimation } = useSuccessAnimation();

  // State management
  const [amount, setAmount] = useState('');
  const [isLending, setIsLending] = useState(false);
  const [lendError, setLendError] = useState<string | null>(null);

  // Refs
  const modalContentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
   * Handles the lending process
   * Validates inputs, prepares transaction, and handles success/error states
   */
  const handleLend = async () => {
    if (!requestTransaction || !publicKey || !amount || !requestRecords) {
      console.log('❌ Lending conditions not met:', {
        hasRequestTransaction: !!requestTransaction,
        hasPublicKey: !!publicKey,
        hasAmount: !!amount,
        hasRequestRecords: !!requestRecords
      });
      return;
    }

    console.log('🚀 Starting lending process for:', {
      token: selectedToken,
      amount,
      publicKey
    });

    setIsLending(true);
    setLendError(null);

    try {
      let selectedTokenConfig = SUPPORTED_TOKENS.find(token => token.id === selectedToken);
      if (!selectedTokenConfig && selectedToken === WALEO_TOKEN.id) {
        selectedTokenConfig = WALEO_TOKEN;
      }
      console.log('🔍 Token configuration found:', selectedTokenConfig);
      
      const decimals = selectedTokenConfig?.decimals || 6;
      const amountInMicrocredits = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));
      console.log('💰 Amount converted to microcredits:', amountInMicrocredits.toString());

      // Get token records from the wallet
      console.log('📥 Fetching token records...');
      const records = await requestRecords(REGISTRY_PROGRAM_ID);
      console.log('📊 Records received:', records.length);
      console.log('📋 First record (structure):', records[0] ? Object.keys(records[0]) : 'No records');
      
      // Find a suitable Token record with enough balance
      let selectedRecord = null;
      console.log('🔍 Searching for a record with sufficient balance...');
      
      for (const record of records) {
        if (record.spent) {
          console.log('⏭️ Record already spent, skipping');
          continue;
        }
        
        const tokenId = record?.data?.token_id;
        const recordAmount = record?.data?.amount;
        
        if (!tokenId || !recordAmount) {
          console.log('⚠️ Invalid record:', { tokenId, recordAmount });
          continue;
        }
        
        // Clean the token ID
        const cleanTokenId = tokenId.replace('.private', '');
        console.log('🧹 Cleaned token ID:', cleanTokenId);
        
        // Check if this is the right token
        if (cleanTokenId === selectedToken) {
          const tokenAmountStr = recordAmount.split('u128')[0];
          const tokenAmount = BigInt(tokenAmountStr || "0");
          console.log('💰 Record amount:', tokenAmount.toString());
          
          // Check if this record has enough balance
          if (tokenAmount >= amountInMicrocredits) {
            console.log('✅ Suitable record found:', {
              recordId: record.id,
              amount: tokenAmount.toString()
            });
            selectedRecord = record;
            break;
          } else {
            console.log('⚠️ Insufficient record:', {
              recordId: record.id,
              amount: tokenAmount.toString(),
              required: amountInMicrocredits.toString()
            });
          }
        }
      }

      if (!selectedRecord) {
        console.error('❌ No suitable record found');
        throw new Error('No suitable token record found with enough balance');
      }

      console.log('💾 Preparing transaction...');
      const { transaction } = await prepareLendingTransaction(
        selectedToken,
        amountInMicrocredits,
        publicKey,
        selectedRecord
      );
      console.log('✅ Transaction prepared');

      console.log('📡 Sending transaction...');
      const transactionId = await requestTransaction(transaction);
      console.log('✅ Transaction sent successfully, ID:', transactionId);
      
      // Reset input and focus it
      setAmount('');
      if (inputRef.current) {
        inputRef.current.focus();
      }

      // Call onLendSuccess first to update balances
      onLendSuccess(selectedToken, amountInMicrocredits, transactionId);
      
      // Show success animation
      showSuccessAnimation();

      // Close modal last
      onClose();

    } catch (error) {
      console.error('❌ Error during lending process:', error);
      
      let errorMessage = 'Lending failed';
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || error.message.includes('User denied')) {
          errorMessage = 'Transaction cancelled by user';
        } else if (error.message.includes('No suitable token record')) {
          errorMessage = 'No token record found with enough balance. You may need to consolidate your records.';
        } else if (error.message.includes('Insufficient balance')) {
          errorMessage = 'Insufficient balance for lending and fees';
        } else if (error.message.includes('fee')) {
          errorMessage = 'Insufficient ALEO for transaction fees';
        } else {
          errorMessage = error.message || 'Transaction failed. Please try again.';
        }
      }
      setLendError(errorMessage);
    } finally {
      setIsLending(false);
    }
  };

  // Get modal root element
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  // Get token configuration
  let selectedTokenConfig = SUPPORTED_TOKENS.find(token => token.id === selectedToken);
  if (!selectedTokenConfig && selectedToken === WALEO_TOKEN.id) {
    selectedTokenConfig = WALEO_TOKEN;
  }
  const tokenName = selectedTokenConfig?.symbol || 'Unknown';
  const privateBalance = privateBalances[selectedToken] || BigInt(0);

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content" role="dialog" aria-modal="true" ref={modalContentRef}>
        <h3>Lend {tokenName}</h3>
        
        <div className="modal-input-group">
          <label>Amount ({tokenName})</label>
          <input
            ref={inputRef}
            type="number"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLending && amount && parseFloat(amount) > 0) {
                handleLend();
              }
            }}
            placeholder="0.00"
            className="custom-number-input"
            disabled={isLending}
          />
          <div className="available-balance">
            <div className="balance-item">
              <span className="balance-label">Available:</span>
              <span className="balance-value">
                {formatBalance(privateBalance, selectedTokenConfig?.decimals || 6)} {tokenName}
              </span>
            </div>
          </div>
        </div>

        {lendError && (
          <div className="error-message">
            {lendError}
          </div>
        )}

        <div className="modal-actions">
          <button
            className="primary-button"
            onClick={handleLend}
            disabled={isLending || !amount || parseFloat(amount) <= 0}
          >
            {isLending ? 'Processing...' : 'Lend'}
          </button>
          <button
            className="secondary-button"
            onClick={onClose}
            disabled={isLending}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default LendModal;