/**
 * Balance Utilities for zLend Protocol
 * Collection of utility functions for managing token balances and account states
 * Handles private and public balance queries, hash calculations, and Aleo-specific operations
 */

import { TokenRecord, TokenBalances } from '../interfaces';
import { REGISTRY_PROGRAM_ID, RPC_URL } from '../constants';

const SNARKVM_NETWORK_NAME = "TestnetV0";

/**
 * Hashes a struct string using the Aleo SDK's BHP256 algorithm
 * @param {string} structString - The struct string to hash
 * @returns {Promise<string>} The hashed value
 * @throws {Error} If the hashing operation fails
 */
export const hashStruct = async (structString: string): Promise<string> => {
  try {
    const { Plaintext } = await import('@demox-labs/aleo-sdk');
    return Plaintext.fromString(SNARKVM_NETWORK_NAME, structString).hashBhp256();
  } catch (error) {
    console.error('❌ Error in hashStruct:', error);
    throw error;
  }
};

/**
 * Calculates private token balances from a list of token records
 * @param {TokenRecord[]} records - Array of token records to process
 * @returns {Promise<TokenBalances>} Object containing token balances
 */
export const getPrivateBalances = async (records: TokenRecord[]): Promise<TokenBalances> => {
  console.log('📥 Processing records in getPrivateBalances:', JSON.stringify(records, null, 2));
  const balances: TokenBalances = {};
  
  records.forEach((record, index) => {
    console.log(`\n🔍 Processing record ${index}:`, {
      program_id: record.program_id,
      spent: record.spent,
      data: record.data
    });

    // Handle credit records (ALEO tokens)
    if (record.program_id === 'credits.aleo' && record.data?.microcredits) {
      const amountStr = record.data.microcredits;
      console.log('💰 Credit record found:', { amountStr, spent: record.spent });
      
      // Skip spent records
      if (record.spent) {
        console.log('❌ Credit record ignored (spent)');
        return;
      }
      
      if (balances['ALEO'] == null) {
        balances['ALEO'] = BigInt(0);
      }
      
      const creditAmount = BigInt(amountStr.split('u64')[0]);
      balances['ALEO'] += creditAmount;
      console.log('✅ ALEO balance updated:', balances['ALEO'].toString());
      return;
    }
    
    // Handle token records from token registry
    if (record.program_id === REGISTRY_PROGRAM_ID) {
      const tokenId = record?.data?.token_id;
      const amountStr = record?.data?.amount;

      console.log('🎯 Token record found:', { tokenId, amountStr });

      if (record.spent || tokenId == null || amountStr == null) {
        console.log('❌ Record ignored:', { spent: record.spent, tokenId: tokenId == null, amountStr: amountStr == null });
        return;
      }

      // Remove .private suffix from token_id
      const cleanTokenId = tokenId.split('.')[0];
      console.log('🧹 Cleaned token ID:', cleanTokenId);

      if (balances[cleanTokenId] == null) {
        balances[cleanTokenId] = BigInt(0);
      }

      // Remove the field suffix and convert to BigInt
      const tokenAmountStr = amountStr.split(".")[0].slice(0, -4);
      const tokenAmount = BigInt(tokenAmountStr || "0");
      
      balances[cleanTokenId] += tokenAmount;
      console.log('✅ Balance updated for', cleanTokenId, ':', balances[cleanTokenId].toString());
    }
  });
  
  console.log('📊 Final balances:', balances);
  return balances;
};

/**
 * Retrieves the public balance for a specific token and account
 * @param {string} token_id - The ID of the token to query
 * @param {string} publicKey - The public key of the account
 * @returns {Promise<bigint>} The public balance of the token
 */
export const getPublicBalance = async (token_id: string, publicKey: string): Promise<bigint> => {
  try {
    console.log('🔍 Fetching public balance for:', { token_id, publicKey });
    const tokenOwner = `{account: ${publicKey}, token_id: ${token_id}}`;
    const hashedKey = await hashStruct(tokenOwner);
    console.log('🔑 Hashed key:', hashedKey);
    
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getMappingValue',
      params: {
        program_id: REGISTRY_PROGRAM_ID,
        mapping_name: "authorized_balances",
        key: hashedKey,
      },
    };

    console.log('📡 RPC request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('📥 RPC response:', JSON.stringify(data, null, 2));

    if (data.error || data.result == null) {
      console.log('❌ Error or null result:', data.error);
      return BigInt(0);
    }
    
    // Parse the Aleo format response
    const balanceMatch = data.result.match(/balance: (\d+)u128/);
    if (balanceMatch && balanceMatch[1]) {
      const balance = BigInt(balanceMatch[1]);
      console.log('✅ Balance found:', balance.toString());
      return balance;
    }
    
    console.log('⚠️ No balance found in response');
    return BigInt(0);
  } catch (error) {
    console.error('❌ Error in getPublicBalance:', error);
    return BigInt(0);
  }
};

/**
 * Retrieves the ALEO balance for a specific account
 * @param {string} publicKey - The public key of the account
 * @returns {Promise<bigint>} The ALEO balance of the account
 */
export const getAleoBalance = async (publicKey: string): Promise<bigint> => {
  try {
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getMappingValue',
      params: {
        program_id: 'credits.aleo',
        mapping_name: 'account',
        key: publicKey,
      },
    };

    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!data.error && data.result != null) {
      const balanceMatch = data.result.match(/(\d+)u64/);
      
      if (balanceMatch && balanceMatch[1]) {
        return BigInt(balanceMatch[1]);
      }
    }
    return BigInt(0);
  } catch (error) {
    console.error('❌ Error in getAleoBalance:', error);
    return BigInt(0);
  }
}; 