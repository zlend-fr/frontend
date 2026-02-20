export interface IMenuItem {
  id: string;
  title: string;
  url: string;
  isExternal?: boolean;
}

export interface TokenConfig {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  image?: string;
}

export interface TokenRecord {
  id: string;
  owner: string;
  program_id: string;
  spent: boolean;
  recordName: string;
  data: {
    owner: string;
    amount: string;
    token_id?: string;
    timestamp?: string;
    apy_snapshot?: string;
    microcredits?: string;
  };
}

export interface TokenBalances {
  [key: string]: bigint;
}

export interface LendingProof {
  id: string;
  owner: string;
  amount: string;
  timestamp: string;
  apy_snapshot: string;
}

export interface LendingPosition {
  amount: bigint;
  timestamp: number;
  id: string;
  apy_snapshot?: string;
}

export interface LendingTransaction {
  address: string;
  chainId: string;
  transitions: Array<{
    program: string;
    functionName: string;
    inputs: Array<string | TokenRecord>;
  }>;
  fee: number;
  feePrivate: boolean;
}

export interface LendingTotals {
  supplied: bigint;
  borrowed: bigint;
}

export interface LendPosition {
  id: string;
  amount: bigint;
  timestamp: number;
  apy_snapshot?: string;
  apy: number;
}

export interface PendingLend {
  amount: bigint;
  timestamp: number;
  transactionId: string;
}

export interface YourLendsProps {
  pendingLends: PendingLend[];
  setPendingLends: (lends: PendingLend[]) => void;
  onRedeemSuccess: (tokenId: string, amount: bigint) => void;
}

export interface BorrowModalProps {
  privateBalances: TokenBalances;
  onClose: () => void;
  selectedToken: string;
  onBorrowSuccess: (tokenId: string, amount: bigint, txId: string, collateralId: string, collateralAmount: bigint) => void;
}

export interface BorrowPosition {
  id: string;
  borrowed_amount: bigint;
  collateral_amount: bigint;
  collateral_token_id: string;
  timestamp: number;
  apr_snapshot?: bigint;
  apr: number;
}

export interface PendingBorrow {
  tokenId: string;
  amount: bigint;
  collateralAmount: bigint;
  collateralTokenId: string;
  timestamp: number;
  transactionId: string;
}

export interface YourBorrowsProps {
  pendingBorrows: PendingBorrow[];
  setPendingBorrows: (borrows: PendingBorrow[]) => void;
  onRepaySuccess: (tokenId: string, amount: bigint, collateralTokenId: string, collateralAmount: bigint) => void;
  setPrivateBalances: React.Dispatch<React.SetStateAction<TokenBalances>>;
}

export interface LoanPublic {
  id_public: number;
  collateral_amount: bigint;
  collateral_token_id: string;
  borrowed_amount: bigint;
  timestamp: number;
  apr_snapshot: bigint;
  active: boolean;
}