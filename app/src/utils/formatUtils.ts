/**
 * Formatting Utilities for zLend Protocol
 * Collection of utility functions for formatting numbers and balances
 * Handles formatting of token balances and amounts with proper decimal places
 */

/**
 * Formats a balance value with specified decimal places
 * @param {bigint | undefined} balance - The balance to format
 * @param {number} decimals - Number of decimal places (default: 6)
 * @returns {string} Formatted balance string (e.g., "123.4567")
 * @example
 * formatBalance(BigInt("1234567890"), 6) // returns "123.4567"
 * formatBalance(undefined, 6) // returns "0.0000"
 */
export const formatBalance = (balance: bigint | undefined, decimals: number = 6): string => {
  if (!balance) return "0.0000";
  const balanceStr = balance.toString();
  const whole = balanceStr.slice(0, -decimals) || "0";
  const decimal = balanceStr.slice(-decimals).padStart(decimals, "0");
  // Take only first 4 digits of the decimal part for better readability
  const formattedDecimal = decimal.slice(0, 4);
  return `${whole}.${formattedDecimal}`;
};

/**
 * Formats an amount with proper decimal places
 * @param {bigint} amount - The amount to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted amount string with proper decimal places
 * @example
 * formatAmount(BigInt("1234567890"), 6) // returns "1234.567890"
 */
export const formatAmount = (amount: bigint, decimals: number): string => {
  const amountStr = amount.toString();
  const paddedAmount = amountStr.padStart(decimals + 1, '0');
  const integerPart = paddedAmount.slice(0, -decimals);
  const decimalPart = paddedAmount.slice(-decimals);
  return `${integerPart}.${decimalPart}`;
}; 