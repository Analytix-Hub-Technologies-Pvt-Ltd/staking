
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, WalletState, UserStake, Currency, Transaction } from './types';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import StakingPage from './components/StakingPage';
import DashboardPage from './components/DashboardPage';
import { TOKEN_NAME, DEFAULT_TOKEN_PRICE } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === null ? false : saved === 'dark';
  });
  
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency');
    return (saved as Currency) || Currency.USD;
  });

  const [tokenPrice, setTokenPrice] = useState<number>(DEFAULT_TOKEN_PRICE);
  const [fxRate, setFxRate] = useState<number>(1.54); 
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false);
  
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isLoggedIn: false,
    balance: 294291 
  });

  const [stakes, setStakes] = useState<UserStake[]>([]);

  const fetchTokenPrice = useCallback(async (base: Currency) => {
    setIsLoadingPrice(true);
    try {
      const [usdRes, audRes] = await Promise.all([
        fetch(`https://alltra.azurewebsites.net/api/alltra-pricing?base=USD`, { mode: 'cors' }),
        fetch(`https://alltra.azurewebsites.net/api/alltra-pricing?base=AUD`, { mode: 'cors' })
      ]);

      const usdData = await usdRes.json();
      const audData = await audRes.json();

      const usdPriceObj = Array.isArray(usdData) ? usdData.find(t => t.symbol === "11::11") : usdData;
      const audPriceObj = Array.isArray(audData) ? audData.find(t => t.symbol === "11::11") : audData;

      if (usdPriceObj?.rate && audPriceObj?.rate) {
        setFxRate(audPriceObj.rate / usdPriceObj.rate);
        setTokenPrice(base === Currency.USD ? usdPriceObj.rate : audPriceObj.rate);
      }
    } catch (error) {
      console.warn("Pricing API fetch failed. Using fallback.", error);
    } finally {
      setIsLoadingPrice(false);
    }
  }, []);

  useEffect(() => {
    fetchTokenPrice(currency);
  }, [currency, fetchTokenPrice]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    const savedStakes = localStorage.getItem('1111_stakes');
    if (savedStakes) {
      setStakes(JSON.parse(savedStakes));
    }
  }, []);

  const handleConnectWallet = useCallback(() => {
    setWallet(prev => ({
      ...prev,
      isConnected: true,
      address: '0x71C765...d897'
    }));
  }, []);

  const handleLoginKYC = useCallback(() => {
    alert("Redirecting to login.alltraverse.com for KYC verification...");
    setWallet(prev => ({
      ...prev,
      isLoggedIn: true
    }));
  }, []);

  const createTx = (type: Transaction['type'], amount: number): Transaction => ({
    id: Math.random().toString(36).substr(2, 9),
    type,
    amount,
    date: Date.now(),
    txHash: '0x' + Math.random().toString(16).substr(2, 40)
  });

  const handleStake = (tokenAmount: number, tierId: number, apy: number) => {
    if (!wallet.isLoggedIn) {
      handleLoginKYC();
      return;
    }

    const initialTx = createTx('STAKE', tokenAmount);

    const newStake: UserStake = {
      id: Math.random().toString(36).substr(2, 9),
      principal: tokenAmount,
      accruedYield: 0,
      startDate: Date.now(),
      lockPeriodMonths: 9,
      tier: tierId,
      lastCompound: Date.now(),
      history: [initialTx]
    };

    const updatedStakes = [...stakes, newStake];
    setStakes(updatedStakes);
    setWallet(prev => ({ ...prev, balance: prev.balance - tokenAmount }));
    localStorage.setItem('1111_stakes', JSON.stringify(updatedStakes));
    setCurrentView(AppView.DASHBOARD);
  };

  const handleHarvest = (stakeId: string) => {
    setStakes(prev => {
      const updated = prev.map(s => {
        if (s.id !== stakeId) return s;
        const harvestedAmount = s.accruedYield;
        const harvestTx = createTx('HARVEST', harvestedAmount);
        
        if (harvestedAmount > 0) {
            setWallet(w => ({ ...w, balance: w.balance + harvestedAmount }));
        }

        return {
          ...s,
          accruedYield: 0,
          lastCompound: Date.now(),
          history: [harvestTx, ...s.history]
        };
      });
      localStorage.setItem('1111_stakes', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCompound = (stakeId: string) => {
    setStakes(prev => {
      const updated = prev.map(s => {
        if (s.id !== stakeId) return s;
        const yieldAmount = s.accruedYield;
        const compoundTx = createTx('COMPOUND', yieldAmount);
        
        return {
          ...s,
          principal: s.principal + yieldAmount,
          accruedYield: 0,
          lastCompound: Date.now(),
          history: [compoundTx, ...s.history]
        };
      });
      localStorage.setItem('1111_stakes', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUnstake = (stakeId: string) => {
    setStakes(prev => {
      const stakeToExit = prev.find(s => s.id === stakeId);
      if (!stakeToExit) return prev;
      
      const totalExitAmount = stakeToExit.principal + stakeToExit.accruedYield;
      setWallet(w => ({ ...w, balance: w.balance + totalExitAmount }));
      
      const updated = prev.filter(s => s.id !== stakeId);
      localStorage.setItem('1111_stakes', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const toggleCurrency = () => setCurrency(prev => prev === Currency.USD ? Currency.AUD : Currency.USD);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark bg-[#050505] text-[#f8fafc]' : 'bg-[#fcfcfc] text-[#0f172a]'} selection:bg-emerald-500/30`}>
      <Header 
        wallet={wallet} 
        onConnect={handleConnectWallet} 
        setView={setCurrentView}
        currentView={currentView}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        currency={currency}
        toggleCurrency={toggleCurrency}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {currentView === AppView.LANDING && (
          <LandingPage onStakeClick={() => setCurrentView(AppView.STAKING)} />
        )}
        
        {currentView === AppView.STAKING && (
          <StakingPage 
            wallet={wallet} 
            onStake={handleStake} 
            onConnect={handleConnectWallet}
            currency={currency}
            tokenPrice={tokenPrice}
            fxRate={fxRate}
            isLoadingPrice={isLoadingPrice}
          />
        )}

        {currentView === AppView.DASHBOARD && (
          <DashboardPage 
            wallet={wallet}
            stakes={stakes}
            onHarvest={handleHarvest}
            onCompound={handleCompound}
            onUnstake={handleUnstake}
            currency={currency}
            tokenPrice={tokenPrice}
          />
        )}
      </main>

      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-900 mt-auto">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          <div className="flex justify-center space-x-8 mb-4">
            <a href="#" className="hover:text-emerald-500 transition-colors font-bold">Terms of Service</a>
            <a href="#" className="hover:text-emerald-500 transition-colors font-bold">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors font-bold">Contact Support</a>
          </div>
          <p>© 2024 ALLTRA SmartChain. 11::11 Gold Staking Protocol. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
