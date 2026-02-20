/**
 * TransferModal Component
 * Modal dialog for transferring tokens from public to private
 * Handles token selection, amount input, and transaction management
 */

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { formatBalance } from '../../utils/formatUtils';
import type { TokenBalances } from '../../interfaces';
import { SUPPORTED_TOKENS } from '../../constants/tokens';
import { useSuccessAnimation } from '../../contexts/SuccessAnimationContext';
import { transferPublicToPrivate, validateTransferAmount } from '../../utils/transferUtils';

/**
 * Props for the TransferModal component
 * @property {TokenBalances} publicBalances - User's public token balances
 * @property {Function} onClose - Function to close the modal
 * @property {Function} onTransferSuccess - Callback when transfer is successful
 */
interface TransferModalProps {
  publicBalances: TokenBalances;
  onClose: () => void;
  onTransferSuccess: (tokenId: string, amount: bigint, transactionId: string) => void;
}

/**
 * TransferModal Component
 * @param {TransferModalProps} props - Component props
 * @returns {React.ReactPortal | null} Modal dialog for transferring tokens
 */
const TransferModal: React.FC<TransferModalProps> = ({ 
  publicBalances, 
  onClose, 
  onTransferSuccess 
}) => {
  // Wallet and animation hooks
  const { publicKey, requestTransaction } = useWallet();
  const { showSuccessAnimation } = useSuccessAnimation();

  // State management
  const [selectedToken, setSelectedToken] = useState<string>(SUPPORTED_TOKENS[0].id);
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

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
   * Handles the transfer process
   * Validates inputs, prepares transaction, and handles success/error states
   */
  const handleTransfer = async () => {
    if (!publicKey || !transferAmount || !requestTransaction) {
      console.log('❌ Transfer conditions not met:', {
        hasPublicKey: !!publicKey,
        hasAmount: !!transferAmount,
        hasRequestTransaction: !!requestTransaction
      });
      return;
    }

    console.log('🚀 Starting transfer process for:', {
      token: selectedToken,
      amount: transferAmount,
      publicKey
    });

    setIsTransferring(true);
    setTransferError(null);

    try {
      const selectedTokenConfig = SUPPORTED_TOKENS.find(token => token.id === selectedToken);
      const decimals = selectedTokenConfig?.decimals || 6;
      const amountInMicrocredits = BigInt(Math.floor(parseFloat(transferAmount) * Math.pow(10, decimals)));
      
      // Validate transfer amount
      const validationError = validateTransferAmount(transferAmount, selectedToken, publicBalances[selectedToken] || BigInt(0));
      if (validationError) {
        throw new Error(validationError);
      }

      // Execute transfer
      const transactionId = await transferPublicToPrivate(selectedToken, amountInMicrocredits, publicKey, requestTransaction);
      
      // Reset input and focus it
      setTransferAmount('');
      if (inputRef.current) {
        inputRef.current.focus();
      }

      // Close modal first, then show success animation
      onClose();
      onTransferSuccess(selectedToken, amountInMicrocredits, transactionId);
      showSuccessAnimation();

    } catch (error) {
      console.error('❌ Error during transfer process:', error);
      
      let errorMessage = 'Transfer failed';
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || error.message.includes('User denied')) {
          errorMessage = 'Transaction cancelled';
        } else if (error.message.includes('Insufficient balance')) {
          errorMessage = 'Insufficient balance for transfer and fees';
        } else if (error.message.includes('fee')) {
          errorMessage = 'Insufficient ALEO for transaction fees';
        } else {
          errorMessage = error.message || 'Transaction failed. Please try again.';
        }
      }
      setTransferError(errorMessage);
    } finally {
      setIsTransferring(false);
    }
  };

  // Get modal root element
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  // Get token configuration
  const selectedTokenConfig = SUPPORTED_TOKENS.find(token => token.id === selectedToken);
  const tokenName = selectedTokenConfig?.symbol || 'Unknown';
  const availableBalance = publicBalances[selectedToken] || BigInt(0);

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content" role="dialog" aria-modal="true" ref={modalContentRef}>
        <h3>Transfer to Private</h3>
        
        {/* Token Selection */}
        <div className="modal-input-group">
          <label>Select Token</label>
          <select 
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="token-select"
          >
            {SUPPORTED_TOKENS.map(token => (
              <option key={token.id} value={token.id}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div className="modal-input-group">
          <label>Amount ({tokenName})</label>
          <input
            ref={inputRef}
            type="number"
            step="0.000001"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isTransferring && transferAmount && parseFloat(transferAmount) > 0) {
                handleTransfer();
              }
            }}
            placeholder="0.00"
            className="custom-number-input"
            disabled={isTransferring}
          />
          <div className="available-balance">
            Available: {formatBalance(availableBalance, selectedTokenConfig?.decimals || 6)} {tokenName}
          </div>
        </div>

        {/* Error Message */}
        {transferError && (
          <div className="error-message">
            {transferError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-actions">
          <button
            className="primary-button"
            onClick={handleTransfer}
            disabled={isTransferring || !transferAmount || parseFloat(transferAmount) <= 0}
          >
            {isTransferring ? 'Processing...' : 'Transfer'}
          </button>
          <button
            className="secondary-button"
            onClick={onClose}
            disabled={isTransferring}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default TransferModal;