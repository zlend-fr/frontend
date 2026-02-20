import { SUPPORTED_TOKENS } from '../constants/tokens';
import { FEE_AMOUNT } from '../constants/lending';

/**
 * Prepares and executes a transfer from public to private
 * @param {string} tokenId - The ID of the token to transfer
 * @param {bigint} amountInMicrocredits - The amount to transfer in microcredits
 * @param {string} publicKey - The user's public key
 * @param {Function} requestTransaction - Function to request a transaction from the wallet
 * @returns {Promise<string>} The transaction ID
 */
export const transferPublicToPrivate = async (
  tokenId: string,
  amountInMicrocredits: bigint,
  publicKey: string,
  requestTransaction: (transaction: any) => Promise<string>
): Promise<string> => {
  if (!requestTransaction) {
    throw new Error('Wallet not connected');
  }

  console.log('💾 Preparing transaction...');
  const transactionRequest = {
    address: publicKey,
    chainId: "testnetbeta",
    transitions: [{
      program: tokenId === 'ALEO' ? 'credits.aleo' : 'token_registry.aleo',
      functionName: 'transfer_public_to_private',
      inputs: tokenId === 'ALEO' ? [
        publicKey,
        `${amountInMicrocredits}u64`
      ] : [
        tokenId,
        publicKey,
        `${amountInMicrocredits}u128`,
        'false'
      ]
    }],
    fee: FEE_AMOUNT,
    feePrivate: false
  };

  console.log('📡 Sending transaction...');
  const transactionId = await requestTransaction(transactionRequest);
  console.log('✅ Transaction sent successfully, ID:', transactionId);

  return transactionId;
};

/**
 * Validates the transfer amount and returns any error message
 * @param {string} amount - The amount to transfer
 * @param {string} tokenId - The ID of the token to transfer
 * @param {bigint} availableBalance - The available balance
 * @returns {string | null} Error message if validation fails, null otherwise
 */
export const validateTransferAmount = (
  amount: string,
  tokenId: string,
  availableBalance: bigint
): string | null => {
  if (!amount || parseFloat(amount) <= 0) {
    return 'Please enter a valid amount';
  }

  const selectedTokenConfig = SUPPORTED_TOKENS.find(token => token.id === tokenId);
  const decimals = selectedTokenConfig?.decimals || 6;
  const amountInMicrocredits = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));

  if (amountInMicrocredits > availableBalance) {
    return 'Insufficient balance for transfer and fees';
  }

  return null;
};