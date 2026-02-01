
import React, { useState, useMemo } from 'react';
import { WalletState, Currency } from '../types';
import { STAKING_TIERS, TOKEN_NAME, LOCK_PERIOD_MONTHS } from '../constants';
import { Calculator, Wallet, Crown, Loader2, ShieldCheck, Zap, Users, Repeat } from 'lucide-react';

interface StakingPageProps {
  wallet: WalletState;
  onStake: (amount: number, tierId: number, apy: number) => void;
  onConnect: () => void;
  currency: Currency;
  tokenPrice: number;
  fxRate: number;
  isLoadingPrice: boolean;
}

const StakingPage: React.FC<StakingPageProps> = ({ wallet, onStake, onConnect, currency, tokenPrice, fxRate, isLoadingPrice }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [inputMode, setInputMode] = useState<'fiat' | 'token'>('fiat');
  
  const symbol = currency === Currency.AUD ? 'A$' : '$';
  
  // Convert standard USD tiers to current currency ranges
  const convertedTiers = useMemo(() => {
    const rate = currency === Currency.AUD ? fxRate : 1;
    return STAKING_TIERS.map(tier => ({
      ...tier,
      min: tier.minUSD * rate,
      max: tier.maxUSD * rate
    }));
  }, [currency, fxRate]);

  const tokenAmount = useMemo(() => {
    const num = parseFloat(inputValue) || 0;
    return inputMode === 'token' ? num : num / tokenPrice;
  }, [inputValue, inputMode, tokenPrice]);

  const fiatValueForTierCalc = useMemo(() => {
    const num = parseFloat(inputValue) || 0;
    // Always calculate tier based on the selected fiat currency (USD/AUD)
    return inputMode === 'fiat' ? num : num * tokenPrice;
  }, [inputValue, inputMode, tokenPrice]);

  const selectedTier = useMemo(() => {
    const amountNum = fiatValueForTierCalc;
    return convertedTiers.find(t => amountNum >= t.min && amountNum <= t.max) || 
           (amountNum >= convertedTiers[7].min ? convertedTiers[7] : null);
  }, [fiatValueForTierCalc, convertedTiers]);

  const estimatedYieldTokens = useMemo(() => {
    if (!selectedTier || !inputValue) return 0;
    return tokenAmount * (selectedTier.apy / 100) * (LOCK_PERIOD_MONTHS / 12);
  }, [selectedTier, inputValue, tokenAmount]);

  const handleMax = () => {
    if (inputMode === 'token') {
      setInputValue(wallet.balance.toFixed(4));
    } else {
      const maxFiat = wallet.balance * tokenPrice;
      setInputValue(maxFiat.toFixed(2));
    }
  };

  const handleStakeClick = () => {
    if (isNaN(tokenAmount) || tokenAmount <= 0) return;
    if (tokenAmount > wallet.balance) {
      alert("Insufficient balance");
      return;
    }
    if (!selectedTier) {
      alert(`Minimum stake required: ${symbol}${convertedTiers[0].min.toFixed(0)}`);
      return;
    }
    onStake(tokenAmount, selectedTier.id, selectedTier.apy);
  };

  const toggleInputMode = () => {
    const num = parseFloat(inputValue) || 0;
    if (inputMode === 'fiat') {
      setInputValue((num / tokenPrice).toFixed(4));
      setInputMode('token');
    } else {
      setInputValue((num * tokenPrice).toFixed(2));
      setInputMode('fiat');
    }
  };

  const publicTiers = convertedTiers.filter(t => t.id < 8);
  const vipTier = convertedTiers.find(t => t.id === 8);

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Side: Tier Overview */}
        <div className="lg:w-2/3 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black flex items-center space-x-3 text-zinc-950 dark:text-white">
              <Zap className="text-emerald-500" size={32} />
              <span>11::11 Protocols</span>
            </h2>
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-3">
                {isLoadingPrice && <Loader2 size={16} className="animate-spin text-emerald-500" />}
                <div className="text-emerald-500 text-sm font-black uppercase tracking-wider bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                  Rate: 1 {TOKEN_NAME} = {symbol}{tokenPrice.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
          
          {/* VIP Section */}
          <div className="space-y-4">
            <h3 className="text-amber-500 text-sm font-black uppercase tracking-widest flex items-center space-x-2">
              <Crown size={16} />
              <span>VIP Gold Elite Protocol</span>
            </h3>
            {vipTier && (
              <div 
                className={`p-10 rounded-[40px] border-4 transition-all relative overflow-hidden group ${
                  selectedTier?.id === 8 
                    ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_60px_rgba(245,158,11,0.25)] scale-[1.01]' 
                    : 'bg-zinc-50 dark:bg-zinc-900 border-amber-500/20 hover:border-amber-500/50'
                }`}
              >
                <Crown className="absolute -top-6 -right-6 w-40 h-40 text-amber-500/5 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <h4 className="text-3xl font-black text-zinc-950 dark:text-white mb-2">{vipTier.name}</h4>
                    <p className="text-zinc-800 dark:text-white text-xl font-black">
                      Minimum Entry: {symbol}{vipTier.min.toLocaleString(undefined, { maximumFractionDigits: 0 })} +
                    </p>
                    <div className="mt-6 flex items-center space-x-4">
                      <span className="text-xs font-black uppercase bg-amber-500 text-black px-4 py-1.5 rounded-full">Whitelisted Only</span>
                      <span className="text-xs font-black uppercase bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-white px-4 py-1.5 rounded-full">9 Month Escrow</span>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-amber-500 text-6xl font-black mb-1">{vipTier.apy}%</div>
                    <div className="text-zinc-600 dark:text-zinc-300 text-xs font-black uppercase tracking-widest">Fixed Annual Yield</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Public Tiers Section */}
          <div className="space-y-4">
            <h3 className="text-emerald-500 text-sm font-black uppercase tracking-widest flex items-center space-x-2">
              <Users size={16} />
              <span>Public Progressive Tiers</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicTiers.map((tier) => {
                const isSelected = selectedTier?.id === tier.id;
                return (
                  <div 
                    key={tier.id}
                    className={`p-8 rounded-[32px] border-2 transition-all ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500 green-glow' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        isSelected ? 'bg-emerald-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-white'
                      }`}>
                        {tier.name}
                      </span>
                      <div className="text-emerald-500 text-3xl font-black">{tier.apy}%</div>
                    </div>
                    <p className="text-zinc-950 dark:text-white text-lg font-black mb-1">
                      {symbol}{tier.min.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300 text-xs font-bold mb-4">
                      Max: {symbol}{tier.max.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-200 uppercase tracking-tighter font-black">
                      ~{(tier.min / tokenPrice).toLocaleString(undefined, {maximumFractionDigits: 0})} {TOKEN_NAME} Tokens min.
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Staking Interface */}
        <div className="lg:w-1/3">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[48px] p-10 sticky top-32 shadow-2xl shadow-black/5 dark:shadow-none transition-all duration-300">
            <h3 className="text-3xl font-black mb-10 flex items-center space-x-3 text-zinc-950 dark:text-white">
              <Calculator className="text-emerald-500" size={32} />
              <span>Staking Desk</span>
            </h3>

            <div className="space-y-8">
              {/* Amount Input */}
              <div>
                <div className="flex justify-between items-center text-xs font-black text-zinc-700 dark:text-white mb-4 uppercase tracking-widest">
                  <div className="flex items-center space-x-2">
                    <span>Stake Amount</span>
                    <button 
                      onClick={toggleInputMode}
                      className="flex items-center space-x-1 text-emerald-500 hover:text-emerald-400 transition-colors"
                      title="Toggle input mode"
                    >
                      <Repeat size={12} />
                      <span className="text-[10px]">{inputMode === 'fiat' ? 'Switch to Tokens' : 'Switch to Fiat'}</span>
                    </button>
                  </div>
                  <span className="opacity-60">Bal: {wallet.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {TOKEN_NAME}</span>
                </div>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-2xl">
                    {inputMode === 'fiat' ? symbol : '11'}
                  </div>
                  <input 
                    type="number" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl py-6 pl-14 pr-24 text-3xl font-black focus:outline-none focus:border-emerald-500 text-zinc-950 dark:text-white transition-colors"
                  />
                  <button 
                    onClick={handleMax}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-900 dark:bg-zinc-800 hover:bg-black dark:hover:bg-zinc-700 text-white text-[10px] font-black px-4 py-2.5 rounded-2xl transition-colors uppercase tracking-widest"
                  >
                    MAX
                  </button>
                </div>
                <div className="mt-3 text-[11px] font-black text-emerald-500 uppercase tracking-widest px-1">
                  {inputMode === 'fiat' 
                    ? `≈ ${tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${TOKEN_NAME}`
                    : `≈ ${symbol}${fiatValueForTierCalc.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                  }
                </div>
              </div>

              {/* Yield Calculator */}
              <div className={`p-8 rounded-[32px] border-2 space-y-5 transition-colors ${selectedTier?.id === 8 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'}`}>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-700 dark:text-zinc-100 font-black">Protocol Term:</span>
                  <span className="text-zinc-950 dark:text-white font-black">{LOCK_PERIOD_MONTHS} Months</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-700 dark:text-zinc-100 font-black">Applied APY:</span>
                  <span className={`${selectedTier?.id === 8 ? 'text-amber-500' : 'text-emerald-500'} font-black`}>{selectedTier?.apy || 0}%</span>
                </div>
                <div className="flex justify-between text-sm border-t border-zinc-200 dark:border-zinc-800 pt-5">
                  <span className="text-zinc-700 dark:text-zinc-100 font-black">Estimated Yield:</span>
                  <span className="text-emerald-500 font-black">
                    +{estimatedYieldTokens.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {TOKEN_NAME}
                  </span>
                </div>
                <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-300">Total at Maturity:</span>
                  <span className={`${selectedTier?.id === 8 ? 'text-amber-500' : 'text-emerald-500'} text-3xl font-black tracking-tighter`}>
                    {(tokenAmount + estimatedYieldTokens).toLocaleString(undefined, {maximumFractionDigits: 2})}
                  </span>
                </div>
              </div>

              {wallet.isConnected ? (
                <button 
                  onClick={handleStakeClick}
                  disabled={!selectedTier}
                  className={`w-full py-6 rounded-[28px] font-black text-2xl transition-all flex items-center justify-center space-x-3 ${
                    selectedTier 
                      ? selectedTier.id === 8 
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-2xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-black green-glow hover:scale-[1.02] active:scale-95' 
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck size={28} />
                  <span>{selectedTier?.id === 8 ? 'Enter VIP Escrow' : 'Execute Staking'}</span>
                </button>
              ) : (
                <button 
                  onClick={onConnect}
                  className="w-full py-6 bg-zinc-900 dark:bg-zinc-800 hover:bg-black dark:hover:bg-zinc-700 text-white rounded-[28px] font-black text-2xl transition-all flex items-center justify-center space-x-3"
                >
                  <Wallet size={28} />
                  <span>Connect Wallet</span>
                </button>
              )}

              <p className="text-[11px] text-center text-zinc-500 dark:text-zinc-200 uppercase tracking-widest leading-relaxed font-black">
                Weekly compounding available. <br /> Rewards are settled in gold-backed {TOKEN_NAME}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingPage;
