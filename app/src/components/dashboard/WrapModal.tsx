/**
 * WrapModal Component
 * Modal dialog for wrapping ALEO credits to wALEO tokens and unwrapping wALEO to ALEO
 * Handles both wrapping and unwrapping processes and transaction management
 */

import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { formatBalance } from '../../utils/formatUtils';
import { useSuccessAnimation } from '../../contexts/SuccessAnimationContext';
import { WALEO_TOKEN } from '../../constants/tokens';

/**
 * Props for the WrapModal component
 */
interface WrapModalProps {
  aleoPrivateBalance: bigint;
  wAleoPrivateBalance: bigint;
  onClose: () => void;
  onWrapSuccess: (amount: bigint, transactionId: string, isWrap: boolean) => void;
}

const WrapModal: React.FC<WrapModalProps> = ({
  aleoPrivateBalance,
  wAleoPrivateBalance,
  onClose,
  onWrapSuccess
}) => {
  const { publicKey, requestTransaction, requestRecords } = useWallet();
  const { showSuccessAnimation } = useSuccessAnimation();
  
  const [amount, setAmount] = useState('');
  const [isWrapping, setIsWrapping] = useState(false);
  const [wrapError, setWrapError] = useState<string | null>(null);
  const [operationType, setOperationType] = useState<'wrap' | 'unwrap'>('wrap');

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

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Clear error when amount changes
  useEffect(() => {
    if (wrapError) setWrapError(null);
  }, [amount]);

  /**
   * Handles the wrapping/unwrapping process
   */
  const handleTransaction = async () => {
    if (!requestTransaction || !publicKey || !amount || !requestRecords) {
      console.log('❌ Transaction conditions not met:', {
        hasRequestTransaction: !!requestTransaction,
        hasPublicKey: !!publicKey,
        hasAmount: !!amount,
        hasRequestRecords: !!requestRecords
      });
      return;
    }

    console.log(`🚀 Starting ${operationType} process for:`, {
      amount,
      publicKey,
      operationType
    });

    setIsWrapping(true);
    setWrapError(null);

    try {
      const amountInMicrocredits = BigInt(Math.floor(parseFloat(amount) * 1_000_000));
      console.log('💰 Amount converted to microcredits:', amountInMicrocredits.toString());

      if (operationType === 'wrap') {
        await handleWrapTransaction(amountInMicrocredits);
      } else {
        await handleUnwrapTransaction(amountInMicrocredits);
      }

    } catch (error) {
      console.error(`❌ Error during ${operationType} process:`, error);
      
      let errorMessage = `${operationType === 'wrap' ? 'Wrapping' : 'Unwrapping'} failed`;
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || error.message.includes('User denied')) {
          errorMessage = 'Transaction cancelled by user';
        } else if (error.message.includes('No suitable') || error.message.includes('not found')) {
          errorMessage = `No ${operationType === 'wrap' ? 'credits' : 'wALEO'} record found with enough balance.`;
        } else if (error.message.includes('Insufficient balance')) {
          errorMessage = `Insufficient balance for ${operationType} and fees`;
        } else if (error.message.includes('fee')) {
          errorMessage = 'Insufficient ALEO for transaction fees';
        } else {
          errorMessage = error.message;
        }
      }
      
      setWrapError(errorMessage);
    } finally {
      setIsWrapping(false);
    }
  };

  /**
   * Handles wrapping ALEO to wALEO
   */
  const handleWrapTransaction = async (amountInMicrocredits: bigint) => {
    if (amountInMicrocredits > aleoPrivateBalance) {
      throw new Error('Insufficient private ALEO balance');
    }

    // Get credits records from the wallet
    console.log('📥 Fetching credits records...');
    const records = await requestRecords!('credits.aleo');
    console.log('📊 Records received:', records.length);
    
    // Find a suitable credits record with enough balance
    let selectedRecord = null;
    console.log('🔍 Searching for a credits record with sufficient balance...');
    
    for (const record of records) {
      if (record.spent) continue;
      
      const recordAmount = record?.data?.microcredits;
      if (!recordAmount) continue;
      
      const creditAmount = BigInt(recordAmount.split('u64')[0] || "0");
      console.log('💰 Record amount:', creditAmount.toString());
      
      if (creditAmount >= amountInMicrocredits) {
        console.log('✅ Suitable credits record found:', {
          recordId: record.id,
          amount: creditAmount.toString()
        });
        selectedRecord = record;
        break;
      }
    }

    if (!selectedRecord) {
      console.error('❌ No suitable credits record found');
      throw new Error('No suitable credits record found with enough balance');
    }

    console.log('💾 Preparing wrap transaction...');
    
    const transaction = {
      address: publicKey!,
      chainId: 'testnetbeta',
      transitions: [{
        program: 'wrapped_credits.aleo',
        functionName: 'deposit_credits_private',
        inputs: [
          selectedRecord,
          `${Number(amountInMicrocredits)}u64`
        ]
      }],
      fee: 1000000,
      feePrivate: false
    };

    console.log('✅ Wrap transaction prepared:', transaction);
    console.log('📡 Sending wrap transaction...');
    const transactionId = await requestTransaction!(transaction);
    console.log('✅ Wrap transaction sent successfully, ID:', transactionId);
    
    // Reset and complete
    setAmount('');
    if (inputRef.current) inputRef.current.focus();
    
    onWrapSuccess(amountInMicrocredits, transactionId, true);
    showSuccessAnimation();
    onClose();
  };

  /**
   * Handles unwrapping wALEO to ALEO
   */
  const handleUnwrapTransaction = async (amountInMicrocredits: bigint) => {
    if (amountInMicrocredits > wAleoPrivateBalance) {
      throw new Error('Insufficient private wALEO balance');
    }

    // Get wALEO token records from the wallet
    console.log('📥 Fetching wALEO token records...');
    const records = await requestRecords!('token_registry.aleo');
    console.log('📊 Records received:', records.length);
    
    // Find a suitable wALEO record with enough balance
    let selectedRecord = null;
    console.log('🔍 Searching for a wALEO record with sufficient balance...');
    
    for (const record of records) {
      if (record.spent) continue;
      
      // Check if this is a wALEO token record
      const tokenId = record?.data?.token_id?.split('.')[0];
      if (tokenId !== WALEO_TOKEN.id) continue;
      
      const recordAmount = record?.data?.amount;
      if (!recordAmount) continue;
      
      const tokenAmount = BigInt(recordAmount.split('u128')[0] || "0");
      console.log('💰 wALEO Record amount:', tokenAmount.toString());
      
      if (tokenAmount >= amountInMicrocredits) {
        console.log('✅ Suitable wALEO record found:', {
          recordId: record.id,
          amount: tokenAmount.toString()
        });
        selectedRecord = record;
        break;
      }
    }

    if (!selectedRecord) {
      console.error('❌ No suitable wALEO record found');
      throw new Error('No suitable wALEO record found with enough balance');
    }

    console.log('💾 Preparing unwrap transaction...');
    
    const transaction = {
      address: publicKey!,
      chainId: 'testnetbeta',
      transitions: [{
        program: 'wrapped_credits.aleo',
        functionName: 'withdraw_credits_private',
        inputs: [
          selectedRecord,
          `${Number(amountInMicrocredits)}u64`
        ]
      }],
      fee: 1000000,
      feePrivate: false
    };

    console.log('✅ Unwrap transaction prepared:', transaction);
    console.log('📡 Sending unwrap transaction...');
    const transactionId = await requestTransaction!(transaction);
    console.log('✅ Unwrap transaction sent successfully, ID:', transactionId);
    
    // Reset and complete
    setAmount('');
    if (inputRef.current) inputRef.current.focus();
    
    onWrapSuccess(amountInMicrocredits, transactionId, false);
    showSuccessAnimation();
    onClose();
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTransaction();
  };

  const getCurrentBalance = () => {
    return operationType === 'wrap' ? aleoPrivateBalance : wAleoPrivateBalance;
  };

  const getCurrentTokenSymbol = () => {
    return operationType === 'wrap' ? 'ALEO' : 'wALEO';
  };

  const getTargetTokenSymbol = () => {
    return operationType === 'wrap' ? 'wALEO' : 'ALEO';
  };

  return (
    <div className="modal-overlay-o">
      <div className="modal-content" ref={modalContentRef}>
        <h3>ALEO {"<>"} wALEO</h3>
        
        <form onSubmit={handleSubmit}>
          {/* Operation Type Selection */}
          <div className="operation-toggle">
            <button
              type="button"
              className={`toggle-button ${operationType === 'wrap' ? 'active' : ''}`}
              onClick={() => {
                setOperationType('wrap');
                setAmount('');
                setWrapError(null);
              }}
              disabled={isWrapping}
            >
              ALEO to wALEO
            </button>
            <button
              type="button"
              className={`toggle-button ${operationType === 'unwrap' ? 'active' : ''}`}
              onClick={() => {
                setOperationType('unwrap');
                setAmount('');
                setWrapError(null);
              }}
              disabled={isWrapping}
            >
              wALEO to ALEO
            </button>
          </div>

          <div className="modal-input-group">
            <label htmlFor="amount">
              Amount to {operationType === 'wrap' ? 'Wrap' : 'Unwrap'}
            </label>
            <input
              ref={inputRef}
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              min="0"
              step="0.000001"
              disabled={isWrapping}
            />
            <div className="available-balance">
              Available: {formatBalance(getCurrentBalance(), 6)} {getCurrentTokenSymbol()}
            </div>
          </div>

          {wrapError && (
            <div className="error-message">
              {wrapError}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={isWrapping || !amount || parseFloat(amount) <= 0}
            >
              {isWrapping 
                ? `${operationType === 'wrap' ? 'Wrapping' : 'Unwrapping'}...` 
                : `${operationType === 'wrap' ? 'Wrap' : 'Unwrap'}`
              }
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={isWrapping}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WrapModal; 