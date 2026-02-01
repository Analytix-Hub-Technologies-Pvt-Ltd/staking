
import { StakingTier } from './types';

export const STAKING_TIERS: StakingTier[] = [
  { id: 1, name: 'Entry', minUSD: 100, maxUSD: 999, apy: 3.5 },
  { id: 2, name: 'Starter', minUSD: 1000, maxUSD: 4999, apy: 4.75 },
  { id: 3, name: 'Growing', minUSD: 5000, maxUSD: 9999, apy: 6.0 },
  { id: 4, name: 'Mid', minUSD: 10000, maxUSD: 19999, apy: 7.25 },
  { id: 5, name: 'High Mid', minUSD: 20000, maxUSD: 29999, apy: 8.0 },
  { id: 6, name: 'Premium', minUSD: 30000, maxUSD: 39999, apy: 9.0 },
  { id: 7, name: 'Top Tier', minUSD: 40000, maxUSD: 49999, apy: 10.0 },
  { id: 8, name: 'VIP Gold', minUSD: 50000, maxUSD: 100000000, apy: 27.0 },
];

export const TOKEN_NAME = "11::11";
export const TOKEN_SYMBOL = "11::11";
export const LOCK_PERIOD_MONTHS = 9;
export const COMPOUND_COOLDOWN_DAYS = 7;
// Default fallback if API fails
export const DEFAULT_TOKEN_PRICE = 0.20388;
