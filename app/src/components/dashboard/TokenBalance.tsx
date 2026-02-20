/**
 * TokenBalance Component
 * Displays token balance information and action button
 * Shows public and private balances for lending, or available balance for borrowing
 */

import React from 'react';
import type { TokenConfig } from '../../interfaces';
import type { TokenBalances } from '../../interfaces';
import { formatBalance } from '../../utils/formatUtils';

interface TokenBalanceProps {
  token: TokenConfig;
  publicBalances: TokenBalances;
  privateBalances: TokenBalances;
  isLoading: boolean;
  onLendClick: (token: TokenConfig) => void;
  actionType?: 'lend' | 'borrow';
  availableAmount?: bigint;
  onWrapClick?: () => void;
  wAleoBalances?: TokenBalances;
  className?: string;
}

/**
 * TokenBalance Component
 * Displays token information including balances and action button
 * 
 * @param {TokenBalanceProps} props - Component props
 * @returns {JSX.Element} Token balance display component
 */
const TokenBalance: React.FC<TokenBalanceProps> = ({
  token,
  publicBalances,
  privateBalances,
  isLoading,
  onLendClick,
  actionType = 'lend',
  availableAmount,
  onWrapClick,
  wAleoBalances,
  className
}) => {
  // Format balance with loading state
  const formatBalanceWithLoading = (balance: bigint | undefined, decimals: number) => {
    return isLoading ? '...' : formatBalance(balance || BigInt(0), decimals);
  };

  const isAleoToken = token.id === 'ALEO';
  const hasPrivateBalance = (privateBalances[token.id] || BigInt(0)) > BigInt(0);
  const showWrap = actionType !== 'borrow' && onWrapClick && (isAleoToken || !hasPrivateBalance);

  return (
    <div className={`asset-balance token-balance-row ${className || ''}`}>
      {/* Token Logo */}
      <div className="token-balance-logo">
        <img
          src={token.image}
          alt={`${token.symbol} logo`}
          className={className}
        />
      </div>

      {/* Token Information */}
      <div className="token-balance-info">
        <div className="token-balance-title">{token.symbol}</div>
        <div className="token-balance-balances">
          {actionType === 'borrow' ? (
            // Borrow view - shows available balance
            <>
              <span className="token-balance-label">Available:</span>
              <span className="token-balance-label"></span>
              <span className="token-balance-value">
                {formatBalanceWithLoading(availableAmount || BigInt(0), token.decimals)}
              </span>
              <span className="token-balance-value"></span>
            </>
          ) : (
            // Lend view - shows public and private balances
            <>
              <span className="token-balance-label">Public:</span>
              <span className="token-balance-label">Private:</span>
              <span className="token-balance-value">
                {formatBalanceWithLoading(publicBalances[token.id], token.decimals)}
              </span>
              <span className="token-balance-value">
                {formatBalanceWithLoading(privateBalances[token.id], token.decimals)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="token-actions">
        {showWrap ? (
          <button
            className="action-button"
            onClick={onWrapClick}
            disabled={isLoading}
          >
            Wrap
          </button>
        ) : (
          <button
            className="action-button"
            onClick={() => onLendClick(token)}
            disabled={isLoading}
          >
            {actionType === 'borrow' ? 'Borrow' : 'Lend'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TokenBalance; 