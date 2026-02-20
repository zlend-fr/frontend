export const LENDING_PROGRAM_ID = "zhppy2pajo.aleo";
export const LENDING_PROGRAM_ID_USDQ = "nafrqqtcxg.aleo";

export const LENDING_TOKENS = {
  vUSDG: "5983142094692128773510225623816045070304444621008302359049788306211838130558field",
  vUSDQ: "8260953594890310383870507716927422646335575786500909254294703665587287172223field",
  vETE: "7282192565387792361809088173158053178461960397100960262024562261205950610485field",
  avUSDG: "avUSDG",
  avUSDQ: "avUSDQ"
} as const;

/**
 * Returns the correct program ID for a given token
 */
export const getProgramIdForToken = (token_id: string): string => {
  if (token_id === LENDING_TOKENS.vUSDQ) {
    return LENDING_PROGRAM_ID_USDQ;
  }
  return LENDING_PROGRAM_ID;
};

export const FEE_AMOUNT = 1000000;

export const LENDING_FUNCTIONS = {
  LEND: "lend",
  REDEEM: "redeem",
  WITHDRAW: "withdraw"
} as const;

export const LENDING_MAPPINGS = {
  REWARDS: "rewards",
  APY: "apy"
} as const; 