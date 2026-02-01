
export enum AppView {
  LANDING = 'landing',
  STAKING = 'staking',
  DASHBOARD = 'dashboard'
}

export enum Currency {
  USD = 'USD',
  AUD = 'AUD'
}

export interface StakingTier {
  id: number;
  name: string;
  minUSD: number;
  maxUSD: number;
  apy: number;
}

export interface Transaction {
  id: string;
  type: 'STAKE' | 'HARVEST' | 'COMPOUND';
  amount: number;
  date: number;
  txHash: string;
}

export interface UserStake {
  id: string;
  principal: number;
  accruedYield: number;
  startDate: number;
  lockPeriodMonths: number;
  tier: number;
  lastCompound: number;
  history: Transaction[];
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoggedIn: boolean; // KYC/Auth status
  balance: number;
}
