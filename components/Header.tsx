
import React from 'react';
import { AppView, WalletState, Currency } from '../types';
import { Wallet, LayoutDashboard, Coins, Info, Moon, Sun, DollarSign } from 'lucide-react';

interface HeaderProps {
  wallet: WalletState;
  onConnect: () => void;
  setView: (view: AppView) => void;
  currentView: AppView;
  isDarkMode: boolean;
  toggleTheme: () => void;
  currency: Currency;
  toggleCurrency: () => void;
}

const Header: React.FC<HeaderProps> = ({ wallet, onConnect, setView, currentView, isDarkMode, toggleTheme, currency, toggleCurrency }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 px-6 py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => setView(AppView.LANDING)}
        >
          <div className="w-10 h-10 bg-gradient-green rounded-full flex items-center justify-center green-glow transform group-hover:scale-110 transition-transform">
            <span className="text-black font-black text-xl italic">11</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">11::11 GOLD</h1>
            <p className="text-[10px] text-emerald-500 uppercase tracking-[0.2em] font-bold">ALLTRA SmartChain</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          {[
            { id: AppView.LANDING, label: 'About', icon: <Info size={16} /> },
            { id: AppView.STAKING, label: 'Staking', icon: <Coins size={16} /> },
            { id: AppView.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={16} /> }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-emerald-500 ${currentView === item.id ? 'text-emerald-500' : 'text-zinc-500 dark:text-zinc-400'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          {/* Currency Toggle */}
          <button 
            onClick={toggleCurrency}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all active:scale-95 font-bold text-xs"
          >
            <DollarSign size={14} />
            <span>{currency}</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all active:scale-90"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {wallet.isConnected ? (
            <div className="flex flex-col items-end">
              <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">{wallet.address}</span>
              </div>
              {wallet.isLoggedIn && (
                <span className="text-[10px] text-emerald-500 font-bold uppercase mt-1">KYC Verified</span>
              )}
            </div>
          ) : (
            <button 
              onClick={onConnect}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-5 py-2.5 rounded-full transition-all hover:scale-105 green-glow active:scale-95"
            >
              <Wallet size={18} />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
