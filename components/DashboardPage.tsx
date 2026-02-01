
import React, { useMemo, useState } from 'react';
import { WalletState, UserStake, Currency, Transaction } from '../types';
import { TOKEN_NAME, COMPOUND_COOLDOWN_DAYS, STAKING_TIERS, LOCK_PERIOD_MONTHS } from '../constants';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Clock, ArrowUpRight, Coins, RefreshCw, HandCoins, Crown, ShieldCheck, FileText, Download, Layers, LogOut, Lock } from 'lucide-react';

interface DashboardPageProps {
  wallet: WalletState;
  stakes: UserStake[];
  onHarvest: (stakeId: string) => void;
  onCompound: (stakeId: string) => void;
  onUnstake: (stakeId: string) => void;
  currency: Currency;
  tokenPrice: number;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ wallet, stakes, onHarvest, onCompound, onUnstake, currency, tokenPrice }) => {
  const [selectedStakeId, setSelectedStakeId] = useState<string | null>(stakes.length > 0 ? stakes[0].id : null);
  const symbol = currency === Currency.AUD ? 'A$' : '$';

  const activeStake = useMemo(() => 
    stakes.find(s => s.id === selectedStakeId) || null
  , [stakes, selectedStakeId]);

  const aggregateStats = useMemo(() => {
    return stakes.reduce((acc, s) => ({
      totalPrincipal: acc.totalPrincipal + s.principal,
      totalYield: acc.totalYield + s.accruedYield,
      count: acc.count + 1
    }), { totalPrincipal: 0, totalYield: 0, count: 0 });
  }, [stakes]);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: `Day ${i + 1}`,
      yield: (Math.random() * 5 + i * 2) * tokenPrice * (stakes.length || 1),
    }));
  }, [tokenPrice, stakes.length]);

  const compoundAvailable = useMemo(() => {
    if (!activeStake) return false;
    const cooldownMs = COMPOUND_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - activeStake.lastCompound >= cooldownMs;
  }, [activeStake]);

  const totalDays = LOCK_PERIOD_MONTHS * 30.44; 
  const daysLocked = useMemo(() => {
    if (!activeStake) return 0;
    const diff = Date.now() - activeStake.startDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [activeStake]);

  const isMatured = useMemo(() => {
    return daysLocked >= totalDays;
  }, [daysLocked, totalDays]);

  const tierInfo = activeStake ? STAKING_TIERS.find(t => t.id === activeStake.tier) : null;
  const isVIP = tierInfo?.id === 8;

  const downloadPDF = () => {
    if (!activeStake || !tierInfo) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const historyHtml = activeStake.history.map(tx => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 0;">${new Date(tx.date).toLocaleString()}</td>
        <td style="padding: 12px 0; font-weight: bold;">${tx.type}</td>
        <td style="padding: 12px 0;">${tx.amount.toFixed(4)} ${TOKEN_NAME}</td>
        <td style="padding: 12px 0; font-family: monospace; font-size: 10px; color: #666;">${tx.txHash}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>11::11 Gold Staking Statement</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; color: #000; padding: 50px; line-height: 1.5; }
            .header { border-bottom: 3px solid #10b981; padding-bottom: 30px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo-box { display: flex; align-items: center; gap: 12px; }
            .logo-icon { width: 40px; height: 40px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; }
            .logo-text { font-size: 28px; font-weight: 900; letter-spacing: -0.02em; }
            .statement-info { text-align: right; font-size: 12px; color: #666; font-weight: bold; }
            .section { margin-bottom: 40px; }
            .section-title { font-size: 14px; font-weight: 900; text-transform: uppercase; color: #10b981; margin-bottom: 15px; border-left: 4px solid #10b981; padding-left: 12px; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; background: #f9fafb; padding: 25px; border-radius: 20px; }
            .stat-item { border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
            .stat-label { font-size: 10px; text-transform: uppercase; color: #666; font-weight: 800; }
            .stat-value { font-size: 18px; font-weight: 900; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; font-size: 11px; text-transform: uppercase; color: #666; border-bottom: 2px solid #000; padding-bottom: 12px; }
            .footer { margin-top: 60px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 30px; font-weight: 600; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-box">
              <div class="logo-icon">11</div>
              <div class="logo-text">11::11 GOLD PROTOCOL</div>
            </div>
            <div class="statement-info">
              STATEMENT ID: ${activeStake.id.toUpperCase()}<br/>
              PERIOD END: ${new Date().toLocaleDateString()}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Escrow Certificate Summary</div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-label">Active Tier</div>
                <div class="stat-value">${tierInfo.name} (${tierInfo.apy}% APY)</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Principal Balance</div>
                <div class="stat-value">${activeStake.principal.toFixed(4)} ${TOKEN_NAME}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Start Date</div>
                <div class="stat-value">${new Date(activeStake.startDate).toLocaleDateString()}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Wallet Address</div>
                <div class="stat-value" style="font-size: 12px; font-family: monospace;">${wallet.address}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Audit Log / Ledger Transactions</div>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Operation</th>
                  <th>Amount</th>
                  <th>Transaction Hash</th>
                </tr>
              </thead>
              <tbody>
                ${historyHtml}
              </tbody>
            </table>
          </div>

          <div class="footer">
            This document is an official ledger export from the ALLTRA SmartChain 11::11 Gold Staking Protocol.<br/>
            All assets are collateralized by physical gold reserves held in decentralized escrow.<br/>
            ALLTRA Global &copy; 2024
          </div>
          <script>
            window.onload = function() { 
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (stakes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-10">
        <div className="w-32 h-32 bg-zinc-100 dark:bg-zinc-900 border-4 border-zinc-200 dark:border-zinc-800 rounded-[40px] flex items-center justify-center text-zinc-400">
          <Coins size={64} />
        </div>
        <div>
          <h2 className="text-4xl font-black text-zinc-950 dark:text-white mb-4">Portfolio Empty</h2>
          <p className="text-zinc-800 dark:text-white max-w-sm leading-relaxed font-black text-lg">
            No active stakes found. Deposit {TOKEN_NAME} to start generating gold-backed rewards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Aggregate Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { 
            label: "Portfolio Value", 
            value: `${symbol}${(aggregateStats.totalPrincipal * tokenPrice).toLocaleString(undefined, {maximumFractionDigits: 2})}`, 
            icon: <Layers className="text-emerald-500" /> 
          },
          { 
            label: "Total Accrued Yield", 
            value: `${aggregateStats.totalYield.toFixed(4)}`, 
            icon: <ArrowUpRight className="text-emerald-500" /> 
          },
          { label: "Active Positions", value: aggregateStats.count, icon: <Coins className="text-emerald-500" /> },
          { label: "Protocol Health", value: "Optimal", icon: <ShieldCheck className="text-emerald-500" /> }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border-2 p-8 rounded-[40px] shadow-xl dark:shadow-none transition-all border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-start mb-6">
              <span className="text-zinc-700 dark:text-white text-[11px] font-black uppercase tracking-widest">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="text-3xl font-black text-zinc-950 dark:text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          {/* Active Stakes List */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-zinc-950 dark:text-white flex items-center space-x-3">
              <Layers className="text-emerald-500" />
              <span>Active Staking Escrows</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stakes.map((s) => {
                const sTier = STAKING_TIERS.find(t => t.id === s.tier);
                const isSelected = s.id === selectedStakeId;
                const isS_Matured = (Math.floor((Date.now() - s.startDate) / (1000 * 60 * 60 * 24))) >= totalDays;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStakeId(s.id)}
                    className={`text-left p-8 rounded-[40px] border-4 transition-all relative overflow-hidden group ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-500/5 shadow-2xl' 
                        : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${s.tier === 8 ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'}`}>
                        {sTier?.name}
                      </span>
                      {isS_Matured && <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1"><ShieldCheck size={12}/> Matured</span>}
                    </div>
                    <div className="text-2xl font-black text-zinc-950 dark:text-white mb-1">
                      {s.principal.toFixed(2)} {TOKEN_NAME}
                    </div>
                    <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-6">
                      +{s.accruedYield.toFixed(4)} Yield Accrued
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                      <span>{sTier?.apy}% APY</span>
                      <span>Lock: 9m</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[48px] p-10 shadow-sm">
            <h3 className="text-2xl font-black mb-12 text-zinc-950 dark:text-white flex items-center space-x-3">
              <div className="w-3 h-8 rounded-full bg-emerald-500"></div>
              <span>Portfolio Performance</span>
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} dy={12} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} dx={-12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '20px', color: '#fff' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    formatter={(val) => [`${symbol}${parseFloat(val as string).toFixed(2)}`, 'Growth']}
                  />
                  <Area type="monotone" dataKey="yield" stroke="#10b981" fillOpacity={1} fill="url(#colorYield)" strokeWidth={5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Selected Stake Detail Desk */}
          {activeStake && (
            <div className={`border-4 rounded-[48px] p-10 shadow-sm relative overflow-hidden transition-all ${isVIP ? 'bg-amber-500/5 border-amber-500/50' : 'bg-zinc-50 dark:bg-zinc-900 border-emerald-500/30'}`}>
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-zinc-950 dark:text-white flex items-center space-x-3">
                   {isVIP ? <Crown className="text-amber-500" /> : <ShieldCheck className="text-emerald-500" />}
                   <span>Escrow Management</span>
                </h3>
                <button 
                  onClick={downloadPDF}
                  className="p-3 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-2xl hover:scale-110 transition-transform active:scale-90"
                  title="Download Statement"
                >
                  <Download size={18} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-white dark:bg-black/40 rounded-3xl border-2 border-zinc-100 dark:border-zinc-800">
                  <div className="text-[10px] font-black uppercase text-zinc-500 mb-2">Selected Position Yield</div>
                  <div className={`text-4xl font-black ${isVIP ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {activeStake.accruedYield.toFixed(4)}
                  </div>
                  <div className="text-[10px] font-black text-zinc-400 mt-1 uppercase tracking-widest">{TOKEN_NAME} Accrued</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => onCompound(activeStake.id)}
                    disabled={!compoundAvailable}
                    className={`p-6 rounded-3xl flex flex-col items-center justify-center transition-all border-2 ${
                      compoundAvailable 
                        ? 'bg-zinc-950 text-white border-emerald-500 hover:scale-[1.05]' 
                        : 'bg-zinc-100 dark:bg-zinc-800 border-transparent opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw size={24} className={compoundAvailable ? 'animate-spin-slow mb-3' : 'mb-3'} />
                    <span className="text-[10px] font-black uppercase">Compound</span>
                  </button>

                  <button 
                    onClick={() => onHarvest(activeStake.id)}
                    className="p-6 bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center hover:border-amber-500 transition-all hover:scale-[1.05]"
                  >
                    <HandCoins size={24} className="mb-3 text-amber-500" />
                    <span className="text-[10px] font-black uppercase text-zinc-900 dark:text-white">Harvest</span>
                  </button>
                </div>

                {/* Unstake Option */}
                <button 
                  onClick={() => onUnstake(activeStake.id)}
                  disabled={!isMatured}
                  className={`w-full py-6 rounded-3xl flex flex-col items-center justify-center transition-all border-2 group ${
                    isMatured 
                      ? 'bg-emerald-500 text-black border-emerald-600 hover:scale-[1.02] shadow-xl' 
                      : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-1">
                    {isMatured ? <LogOut size={20} /> : <Lock size={20} className="text-zinc-400" />}
                    <span className="text-xs font-black uppercase tracking-widest">Unstake Position</span>
                  </div>
                  <div className={`text-[10px] font-black uppercase transition-opacity ${isMatured ? 'opacity-100' : 'opacity-40'}`}>
                    Future Value: {(activeStake.principal + activeStake.accruedYield).toFixed(2)} {TOKEN_NAME}
                  </div>
                </button>

                <div className="space-y-4">
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                       <div 
                         className={`${isVIP ? 'bg-amber-500' : 'bg-emerald-500'} h-full transition-all duration-1000`} 
                         style={{ width: `${Math.min(100, (daysLocked / totalDays) * 100)}%` }}
                       />
                    </div>
                    <div className="flex justify-between text-[11px] font-black text-zinc-500 uppercase tracking-tighter">
                        <span>{daysLocked} / {Math.floor(totalDays)} Days In Escrow</span>
                        <span className={isMatured ? 'text-emerald-500' : 'text-zinc-500'}>
                          {isMatured ? 'MATURITY REACHED' : 'LOCKED'}
                        </span>
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* Aggregate Statement Summary */}
          <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[48px] p-10 shadow-sm">
            <h3 className="text-2xl font-black text-zinc-950 dark:text-white mb-8 flex items-center space-x-3">
                <FileText className="text-emerald-500" />
                <span>Quick Ledger</span>
            </h3>
            <div className="space-y-6">
                {activeStake ? activeStake.history.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center border-b border-zinc-50 dark:border-zinc-800 pb-4">
                        <div>
                            <div className="text-xs font-black text-zinc-950 dark:text-white uppercase">{tx.type}</div>
                            <div className="text-[10px] text-zinc-400 font-bold">{new Date(tx.date).toLocaleDateString()}</div>
                        </div>
                        <div className={`text-sm font-black ${tx.type === 'HARVEST' ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {tx.type === 'HARVEST' ? '-' : '+'}{tx.amount.toFixed(2)}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 text-zinc-400 font-black text-xs uppercase">Select a position to view history</div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
