/**
 * Lending Utilities for zLend Protocol
 * Collection of utility functions for interacting with the zLend lending protocol on Aleo
 * Handles lending, borrowing, and querying lending-related data
 */

import { LENDING_PROGRAM_ID, LENDING_PROGRAM_ID_USDQ, LENDING_TOKENS, getProgramIdForToken, getTokenIdForProgram } from '../constants/lending';
import { RPC_URL } from '../constants';
import { FEE_AMOUNT } from '../constants/lending';
import { hashStruct } from './balanceUtils';
import { 
  TokenRecord, 
  LendingProof, 
  LendingPosition, 
  LendingTransaction, 
  LendingTotals,
  BorrowPosition,
  LoanPublic
} from '../interfaces';

/**
 * Retrieves the current APY (Annual Percentage Yield) for a specific token
 * @param {string} token_id - The ID of the token to query APY for
 * @returns {Promise<number>} The current APY as a percentage (e.g., 5.0 for 5%)
 */
export const getLendingAPY = async (token_id: string): Promise<number> => {
  try {
    console.log('🔍 Fetching lending APY for token:', token_id);
    const programId = getProgramIdForToken(token_id);
    const tokenKey = `{ token_id: "${token_id}" }`;
    const hashedKey = await hashStruct(tokenKey);

    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getMappingValue',
      params: {
        program_id: programId,
        mapping_name: "lending_apy",
        key: hashedKey,
      },
    };

    console.log('📡 Sending RPC request for APY:', requestBody);
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('📥 Received APY response:', data);

    if (data.error || data.result == null) {
      console.error('❌ Error fetching APY:', data.error);
      return 0;
    }
    
    const apyMatch = data.result.match(/apy: (\d+)u64/);
    if (apyMatch && apyMatch[1]) {
      const apy = Number(apyMatch[1]) / 100;
      console.log('✅ Successfully fetched APY:', apy);
      return apy;
    }
    
    console.warn('⚠️ No APY match found in response');
    return 0;
  } catch (error) {
    console.error('❌ Error in getLendingAPY:', error);
    return 0;
  }
};

/**
 * Retrieves the current rewards for a specific token and address
 * @param {string} token_id - The ID of the token to query rewards for
 * @param {string} publicKey - The public key of the user
 * @returns {Promise<bigint>} The current rewards amount
 */
export const getLendingRewards = async (token_id: string, publicKey: string): Promise<bigint> => {
  try {
    console.log('🔍 Fetching lending rewards for token:', token_id, 'and address:', publicKey);
    const programId = getProgramIdForToken(token_id);
    const rewardKey = `{ token_id: "${token_id}", account: "${publicKey}" }`;
    const hashedKey = await hashStruct(rewardKey);

    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getMappingValue',
      params: {
        program_id: programId,
        mapping_name: "lending_rewards",
        key: hashedKey,
      },
    };

    console.log('📡 Sending RPC request for rewards:', requestBody);
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('📥 Received rewards response:', data);

    if (data.error || data.result == null) {
      console.error('❌ Error fetching rewards:', data.error);
      return BigInt(0);
    }
    
    const rewardMatch = data.result.match(/reward: (\d+)u128/);
    if (rewardMatch && rewardMatch[1]) {
      const reward = BigInt(rewardMatch[1]);
      console.log('✅ Successfully fetched rewards:', reward.toString());
      return reward;
    }
    
    console.warn('⚠️ No reward match found in response');
    return BigInt(0);
  } catch (error) {
    console.error('❌ Error in getLendingRewards:', error);
    return BigInt(0);
  }
};

/**
 * Retrieves the current total supplied and borrowed amounts from the lending program
 * @returns {Promise<LendingTotals>} Object containing total supplied and borrowed amounts
 */
export const getLendingTotals = async (programId: string = LENDING_PROGRAM_ID): Promise<LendingTotals> => {
  try {
    console.log('🔍 Fetching lending totals for program:', programId);

    // Fetch supplied total
    console.log('📡 Fetching supplied_total mapping...');
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getMappingValue',
        params: {
          program_id: programId,
          mapping_name: "supplied_total",
          key: "true"
        }
      })
    });

    const suppliedData = await response.json();
    console.log('📥 Supplied total response:', suppliedData);
    
    // Extract number from u128 format
    const suppliedMatch = suppliedData.result?.match(/(\d+)u128/);
    const supplied = suppliedMatch ? BigInt(suppliedMatch[1]) : BigInt(0);
    console.log('✅ Supplied total value:', supplied.toString());

    // Fetch borrowed total
    console.log('📡 Fetching borrowed_total mapping...');
    const borrowedResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getMappingValue',
        params: {
          program_id: programId,
          mapping_name: "borrowed_total",
          key: "true"
        }
      })
    });

    const borrowedData = await borrowedResponse.json();
    console.log('📥 Borrowed total response:', borrowedData);
    
    // Extract number from u128 format
    const borrowedMatch = borrowedData.result?.match(/(\d+)u128/);
    const borrowed = borrowedMatch ? BigInt(borrowedMatch[1]) : BigInt(0);
    console.log('✅ Borrowed total value:', borrowed.toString());

    console.log('📊 Final lending totals:', { 
      supplied: supplied.toString(), 
      borrowed: borrowed.toString() 
    });
    return { supplied, borrowed };
  } catch (error) {
    console.error('❌ Error getting lending totals:', error);
    return { supplied: BigInt(0), borrowed: BigInt(0) };
  }
};

/**
 * Retrieves active lending positions for a user
 * @param {Function} requestRecords - Function to request records from the wallet
 * @returns {Promise<LendingPosition[]>} Array of active lending positions
 */
export const getActiveLends = async (requestRecords: (programId: string) => Promise<any[]>): Promise<LendingPosition[]> => {
  try {
    console.log('🔍 Fetching active lending records...');

    // Request records from both lending programs
    const [recordsUSDG, recordsUSDQ] = await Promise.all([
      requestRecords(LENDING_PROGRAM_ID),
      requestRecords(LENDING_PROGRAM_ID_USDQ)
    ]);
    const taggedUSDG = recordsUSDG.map(r => ({ ...r, _programId: LENDING_PROGRAM_ID }));
    const taggedUSDQ = recordsUSDQ.map(r => ({ ...r, _programId: LENDING_PROGRAM_ID_USDQ }));
    const records = [...taggedUSDG, ...taggedUSDQ];
    console.log('📥 Raw lending records:', records);

    if (!records || records.length === 0) {
      console.log('ℹ️ No lending records found');
      return [];
    }

    // Filter and parse lending records (avUSDG and avUSDQ)
    const lendingPositions = records
      .filter(record => !record.spent && (record.recordName === 'avUSDG' || record.recordName === 'avUSDQ'))
      .map(record => {
        console.log('🔍 Processing record:', record);
        const amount = BigInt(record.data.amount.split('u128')[0]);
        const timestamp = Number(record.data.timestamp.split('u32')[0]);
        const apy_snapshot = record.data.apy_snapshot;

        return {
          amount,
          timestamp,
          id: record.id,
          apy_snapshot,
          programId: record._programId,
          tokenId: getTokenIdForProgram(record._programId)
        };
      });

    console.log('✅ Found lending positions:', lendingPositions);
    return lendingPositions;
  } catch (error) {
    console.error('❌ Error in getActiveLends:', error);
    return [];
  }
};

/**
 * Retrieves public loan details from the lending program
 * @param {string} loanId - The public ID of the loan
 * @returns {Promise<LoanPublic | null>} The loan details or null if not found
 */
export const getPublicLoanDetails = async (loanId: string, programId: string = LENDING_PROGRAM_ID): Promise<LoanPublic | null> => {
  try {
    // Extract the numeric ID from the loan ID (e.g., "3u32.private" -> "3")
    const numericId = loanId.match(/(\d+)u32/)?.[1];
    if (!numericId) {
      console.error('❌ Invalid loan ID format:', loanId);
      return null;
    }

    console.log('🔍 Fetching public loan details for ID:', numericId);
    
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getMappingValue',
      params: {
        program_id: programId,
        mapping_name: "loans_public",
        key: `${numericId}u32`
      }
    };

    console.log('📡 Sending RPC request for loan details:', requestBody);
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('📥 Received loan details response:', data);

    if (data.error || !data.result) {
      console.error('❌ Error fetching loan details:', data.error);
      return null;
    }

    // Parse the loan public details from the response
    const loanDetails = data.result;
    console.log('📋 Raw loan details:', loanDetails);

    // Extract values using regex patterns
    const idPublicMatch = loanDetails.match(/id_public: (\d+)u32/);
    const collateralAmountMatch = loanDetails.match(/collateral_amount: (\d+)u128/);
    const collateralTokenIdMatch = loanDetails.match(/collateral_token_id: ([^,]+)/);
    const borrowedAmountMatch = loanDetails.match(/borrowed_amount: (\d+)u128/);
    const timestampMatch = loanDetails.match(/timestamp: (\d+)u32/);
    const aprSnapshotMatch = loanDetails.match(/apr_snapshot: (\d+)u128/);
    const activeMatch = loanDetails.match(/active: (true|false)/);

    if (!idPublicMatch || !collateralAmountMatch || !collateralTokenIdMatch || 
        !borrowedAmountMatch || !timestampMatch || !aprSnapshotMatch || !activeMatch) {
      console.error('❌ Failed to parse loan details:', {
        idPublic: idPublicMatch?.[1],
        collateralAmount: collateralAmountMatch?.[1],
        collateralTokenId: collateralTokenIdMatch?.[1],
        borrowedAmount: borrowedAmountMatch?.[1],
        timestamp: timestampMatch?.[1],
        aprSnapshot: aprSnapshotMatch?.[1],
        active: activeMatch?.[1]
      });
      throw new Error('Failed to parse loan public details');
    }

    const loan: LoanPublic = {
      id_public: parseInt(idPublicMatch[1]),
      collateral_amount: BigInt(collateralAmountMatch[1]),
      collateral_token_id: collateralTokenIdMatch[1],
      borrowed_amount: BigInt(borrowedAmountMatch[1]),
      timestamp: parseInt(timestampMatch[1]),
      apr_snapshot: BigInt(aprSnapshotMatch[1]),
      active: activeMatch[1] === 'true'
    };

    console.log('✅ Successfully parsed loan details:', loan);
    return loan;
  } catch (error) {
    console.error('❌ Error in getPublicLoanDetails:', error);
    return null;
  }
};

/**
 * Retrieves active borrow positions for a user
 * @param {Function} requestRecords - Function to request records from the wallet
 * @returns {Promise<BorrowPosition[]>} Array of active borrow positions
 */
export const getActiveBorrows = async (requestRecords: (programId: string) => Promise<any[]>): Promise<BorrowPosition[]> => {
  try {
    console.log('🔍 Fetching active borrow records...');
    const [recordsUSDG, recordsUSDQ] = await Promise.all([
      requestRecords(LENDING_PROGRAM_ID),
      requestRecords(LENDING_PROGRAM_ID_USDQ)
    ]);

    // Tag records with their source program
    const taggedRecordsUSDG = recordsUSDG.map(r => ({ ...r, _programId: LENDING_PROGRAM_ID }));
    const taggedRecordsUSDQ = recordsUSDQ.map(r => ({ ...r, _programId: LENDING_PROGRAM_ID_USDQ }));
    const records = [...taggedRecordsUSDG, ...taggedRecordsUSDQ];
    console.log('📥 Records received:', records.length);

    // Filter for unspent LoanPrivate records
    const borrowRecords = records.filter(record =>
      !record.spent &&
      record.recordName === 'LoanPrivate'
    );

    if (borrowRecords.length === 0) {
      console.log('ℹ️ No active borrow records found');
      return [];
    }

    console.log('📋 Found borrow records:', borrowRecords);

    // Get public loan details for each borrow record
    const borrowPositions: BorrowPosition[] = [];
    for (const record of borrowRecords) {
      const loanId = record.data.id_public;
      if (!loanId) {
        console.warn('⚠️ Record missing loan ID:', record);
        continue;
      }

      const loanDetails = await getPublicLoanDetails(loanId, record._programId);
      if (!loanDetails) {
        console.warn('⚠️ Could not fetch details for loan:', loanId);
        continue;
      }

      borrowPositions.push({
        id: loanId,
        borrowed_amount: loanDetails.borrowed_amount,
        collateral_amount: loanDetails.collateral_amount,
        collateral_token_id: loanDetails.collateral_token_id,
        timestamp: loanDetails.timestamp,
        apr_snapshot: loanDetails.apr_snapshot,
        apr: Number(loanDetails.apr_snapshot) / 100 // Convert from basis points to percentage
      });
    }

    console.log('✅ Successfully processed borrow positions:', borrowPositions);
    return borrowPositions;
  } catch (error) {
    console.error('❌ Error in getActiveBorrows:', error);
    return [];
  }
};

/**
 * Retrieves the current block height from the Aleo network
 * @returns {Promise<number>} The current block height
 */
const getBlockHeight = async (): Promise<number> => {
  try {
    console.log('📡 Requesting latest block height from Aleo Public API...');
    const response = await fetch('https://api.explorer.provable.com/v1/testnet/block/height/latest');

    if (!response.ok) {
      throw new Error(`HTTP error getting block height: ${response.statusText}`);
    }

    const height = await response.text();
    console.log('📥 Received block height response:', height);

    if (!height) {
      throw new Error('Empty block height response from Aleo Public API');
    }

    const blockHeight = Number(height);
    if (isNaN(blockHeight)) {
      throw new Error('Invalid block height format from Aleo Public API');
    }

    console.log('✅ Current block height:', blockHeight);
    return blockHeight;
  } catch (error) {
    console.error('❌ Error getting block height:', error);
    throw error;
  }
};

/**
 * Retrieves the next available loan ID from the lending program
 * @returns {Promise<number>} The next available loan ID
 */
export const getNextLoanId = async (programId: string = LENDING_PROGRAM_ID): Promise<number> => {
  try {
    console.log('🔍 Fetching next loan ID for program:', programId);
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getMappingValue',
      params: {
        program_id: programId,
        mapping_name: "last_loan_id",
        key: "true"
      }
    };

    console.log('📡 Sending RPC request for next loan ID:', requestBody);
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('📥 Received next loan ID response:', data);

    if (data.error || data.result == null) {
      console.error('❌ Error fetching next loan ID:', data.error);
      return 1; // Default to 1 if no loan ID exists yet
    }
    
    const idMatch = data.result.match(/(\d+)u32/);
    if (idMatch && idMatch[1]) {
      const nextId = parseInt(idMatch[1]);
      console.log('✅ Successfully fetched next loan ID:', nextId);
      return nextId;
    }
    
    console.warn('⚠️ No loan ID match found in response, defaulting to 1');
    return 1; // Default to 1 if no loan ID exists yet
  } catch (error) {
    console.error('❌ Error in getNextLoanId:', error);
    return 1; // Default to 1 if there's an error
  }
};

/**
 * Prepares a lending transaction using the Aleo Wallet Adapter format
 * @param {string} token_id - The ID of the token to lend
 * @param {bigint} amount - The amount to lend
 * @param {string} publicKey - The public key of the user
 * @param {TokenRecord} tokenRecord - The token record to use for the transaction
 * @returns {Promise<{ transaction: LendingTransaction; fee: bigint }>} The prepared transaction and fee
 */
export const prepareLendingTransaction = async (
  token_id: string,
  amount: bigint,
  publicKey: string,
  tokenRecord: TokenRecord
): Promise<{ transaction: LendingTransaction; fee: bigint }> => {
  try {
    console.log('🚀 Preparing lending transaction with official format');
    console.log('📖 Based on: https://docs.leo.app/aleo-wallet-adapter');

    // Verify token_id matches supported tokens
    if (token_id !== LENDING_TOKENS.vUSDG && token_id !== LENDING_TOKENS.vUSDQ) {
      throw new Error('Invalid token ID. Only vUSDG and vUSDQ tokens are supported.');
    }

    const programId = getProgramIdForToken(token_id);
    console.log('📡 Using program:', programId);

    // Get current block height
    const blockHeight = await getBlockHeight();
    console.log('📊 Current block height:', blockHeight);

    // Get current lending totals
    const { supplied, borrowed } = await getLendingTotals(programId);
    console.log('📊 Current lending totals:', { supplied: supplied.toString(), borrowed: borrowed.toString() });

    // Format record as JSON object (official format)
    const recordForTransaction = {
      id: tokenRecord.id,
      owner: tokenRecord.owner,
      program_id: tokenRecord.program_id,
      spent: tokenRecord.spent,
      recordName: tokenRecord.recordName,
      data: tokenRecord.data
    };

    console.log('📋 Record format:', recordForTransaction);

    const transaction = {
      address: publicKey,
      chainId: "testnetbeta",
      transitions: [{
        program: programId,
        functionName: 'lend',
        inputs: [
          recordForTransaction,
          `${amount}u128`,
          `${blockHeight}u32`,
          `${supplied}u128`,
          `${borrowed}u128`
        ]
      }],
      fee: FEE_AMOUNT,
      feePrivate: false
    };

    console.log('💾 Transaction prepared successfully');

    const fee = BigInt(100000);
    return { transaction, fee };
  } catch (error) {
    console.error('❌ Error preparing transaction:', error);
    throw error;
  }
};

/**
 * Prepares a redeem transaction for a lending position
 * @param {LendingProof} lendingProof - The lending proof containing position details
 * @param {string} publicKey - The public key of the user
 * @returns {Promise<LendingTransaction>} The prepared redeem transaction
 */
export const prepareRedeemTransaction = async (
  lendingProof: LendingProof,
  publicKey: string,
  programId: string = LENDING_PROGRAM_ID
): Promise<LendingTransaction> => {
  try {
    console.log('🔄 Preparing redeem transaction for program:', programId);
    console.log('📄 Using lending proof:', lendingProof);

    // Get current block height
    const blockHeight = await getBlockHeight();
    console.log('📊 Current block height:', blockHeight);

    // Get current supplied total
    const { supplied } = await getLendingTotals(programId);
    console.log('📊 Current supplied total:', supplied.toString());

    // Determine record name based on program
    const recordName = programId === LENDING_PROGRAM_ID_USDQ ? "avUSDQ" : "avUSDG";

    // Format the avToken record
    const avTokenRecord = {
      id: lendingProof.id,
      owner: lendingProof.owner,
      program_id: programId,
      spent: false,
      recordName,
      data: {
        owner: lendingProof.owner,
        amount: lendingProof.amount,
        timestamp: lendingProof.timestamp,
        apy_snapshot: lendingProof.apy_snapshot
      }
    };

    console.log('📋 Formatted record:', avTokenRecord);

    const transaction = {
      address: publicKey,
      chainId: "testnetbeta",
      transitions: [{
        program: programId,
        functionName: 'redeem',
        inputs: [
          avTokenRecord,
          `${blockHeight}u32`,
          `${supplied}u128`
        ]
      }],
      fee: FEE_AMOUNT,
      feePrivate: false
    };

    console.log('💾 Redeem transaction prepared successfully');
    return transaction;
  } catch (error) {
    console.error('❌ Error preparing redeem transaction:', error);
    throw error;
  }
};

/**
 * Prepares a borrow transaction
 * @param {number} loanId - The ID of the loan
 * @param {TokenRecord} collateralToken - The collateral token record
 * @param {bigint} collateralAmount - The amount of collateral to provide
 * @param {bigint} borrowedAmount - The amount to borrow
 * @param {string} publicKey - The public key of the user
 * @returns {Promise<LendingTransaction>} The prepared borrow transaction
 */
export const prepareBorrowTransaction = async (
  loanId: number,
  collateralToken: TokenRecord,
  collateralAmount: bigint,
  borrowedAmount: bigint,
  publicKey: string,
  programId: string = LENDING_PROGRAM_ID
): Promise<LendingTransaction> => {
  try {
    console.log('🚀 Preparing borrow transaction for program:', programId);

    // Get current block height
    const blockHeight = await getBlockHeight();
    console.log('📊 Current block height:', blockHeight);

    // Get current lending totals
    const { supplied, borrowed } = await getLendingTotals(programId);
    console.log('📊 Current lending totals:', { supplied: supplied.toString(), borrowed: borrowed.toString() });

    // Get the next loan ID from the program
    const nextLoanId = await getNextLoanId(programId);
    console.log('📊 Using loan ID:', nextLoanId);

    // Format the collateral token record
    const formattedCollateralToken = {
      id: collateralToken.id,
      owner: collateralToken.owner,
      program_id: collateralToken.program_id,
      spent: collateralToken.spent,
      recordName: collateralToken.recordName,
      data: collateralToken.data
    };

    const transaction = {
      address: publicKey,
      chainId: "testnetbeta",
      transitions: [{
        program: programId,
        functionName: 'borrow',
        inputs: [
          `${nextLoanId}u32`,
          formattedCollateralToken,
          `${collateralAmount}u128`,
          `${borrowedAmount}u128`,
          `${blockHeight}u32`,
          `${supplied}u128`,
          `${borrowed}u128`
        ]
      }],
      fee: FEE_AMOUNT,
      feePrivate: false
    };

    console.log('💾 Borrow transaction prepared successfully');
    return transaction;
  } catch (error) {
    console.error('❌ Error preparing borrow transaction:', error);
    throw error;
  }
};

/**
 * Prepares a redeem borrow transaction
 * @param {string} id - The ID of the loan
 * @param {string} owner - The owner of the loan
 * @param {TokenRecord} repaymentToken - The token record to use for repayment
 * @param {TokenRecord} loanPrivateRecord - The loan private record
 * @returns {Promise<LendingTransaction>} The prepared redeem borrow transaction
 */
export const prepareRedeemBorrowTransaction = async (
  id: string,
  owner: string,
  repaymentToken: TokenRecord,
  loanPrivateRecord: TokenRecord,
  programId: string = LENDING_PROGRAM_ID
): Promise<LendingTransaction> => {
  console.log('🔄 Preparing redeem borrow transaction for program:', programId);

  // Get current block height
  const blockHeight = await getBlockHeight();
  console.log('📊 Current block height:', blockHeight);

  // Get current borrowed total
  const { borrowed } = await getLendingTotals(programId);
  console.log('📊 Current borrowed total:', borrowed);

  // Get loan details from the mapping
  const loanDetails = await getPublicLoanDetails(id, programId);
  console.log('📋 Raw loan details:', loanDetails);

  if (!loanDetails) {
    throw new Error('Failed to fetch loan details');
  }

  // Format the repayment token record (TokenRegistry format)
  const formattedRepaymentToken = {
    id: repaymentToken.id,
    owner: repaymentToken.owner,
    program_id: repaymentToken.program_id,
    spent: repaymentToken.spent,
    recordName: repaymentToken.recordName,
    data: repaymentToken.data // Utiliser les données originales du record
  };

  // Format the loan private record (LendingProgram format)
  const formattedLoanPrivate = {
    id: loanPrivateRecord.id,
    owner: loanPrivateRecord.owner,
    program_id: loanPrivateRecord.program_id,
    spent: loanPrivateRecord.spent,
    recordName: loanPrivateRecord.recordName,
    data: loanPrivateRecord.data // Utiliser les données originales du record
  };

  // Create the loan public struct as a formatted string (Aleo struct format)
  const loanPublicStruct = `{
    id_public: ${loanDetails.id_public}u32,
    collateral_amount: ${loanDetails.collateral_amount}u128,
    collateral_token_id: ${loanDetails.collateral_token_id},
    borrowed_amount: ${loanDetails.borrowed_amount}u128,
    timestamp: ${loanDetails.timestamp}u32,
    apr_snapshot: ${loanDetails.apr_snapshot}u128,
    active: ${loanDetails.active}
  }`;

  console.log('📋 Formatted records:', {
    repaymentToken: formattedRepaymentToken,
    loanPrivate: formattedLoanPrivate,
    loanPublic: loanPublicStruct
  });

  // Create the transaction
  const transaction: LendingTransaction = {
    address: owner,
    chainId: 'testnetbeta',
    transitions: [
      {
        program: programId,
        functionName: 'redeem_borrow',
        inputs: [
          formattedRepaymentToken,
          formattedLoanPrivate,
          loanPublicStruct,
          `${blockHeight}u32`,
          `${borrowed}u128`
        ]
      }
    ],
    fee: FEE_AMOUNT,
    feePrivate: false
  };

  console.log('💾 Redeem borrow transaction prepared successfully');
  return transaction;
};