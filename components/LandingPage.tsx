
import React from 'react';
import { ChevronRight, ShieldCheck, Zap, Lock, Crown, Globe, Users } from 'lucide-react';

interface LandingPageProps {
  onStakeClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStakeClick }) => {
  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="text-center relative">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full -z-10"></div>
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-zinc-900 dark:text-white text-xs font-black uppercase tracking-wider">ALLTRA SmartChain Active</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tight text-zinc-950 dark:text-white">
          Secure Your <span className="text-emerald-500">Future</span> <br />
          In <span className="text-amber-500">Gold</span>
        </h1>
        <p className="text-zinc-800 dark:text-zinc-100 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-bold">
          Choose between our <span className="text-emerald-500">Public Tiers</span> or the exclusive <br />
          <span className="text-amber-500">VIP Gold Program</span>. Earn up to 27% APY.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
          <button 
            onClick={onStakeClick}
            className="w-full md:w-auto px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xl rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 green-glow shadow-xl shadow-emerald-500/20"
          >
            <span>Launch Protocol</span>
            <ChevronRight size={24} />
          </button>
          <a 
            href="https://alltra.global" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full md:w-auto px-10 py-5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-950 dark:text-white font-black text-xl rounded-2xl transition-all border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-lg"
          >
            Read Whitepaper
          </a>
        </div>
      </section>

      {/* Program Dual Path */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[40px] relative overflow-hidden group hover:border-emerald-500 transition-colors">
          <Users className="absolute -bottom-4 -right-4 w-32 h-32 text-emerald-500/10 group-hover:scale-110 transition-transform" />
          <h3 className="text-4xl font-black mb-4 text-zinc-950 dark:text-white">Public Staking</h3>
          <p className="text-zinc-800 dark:text-zinc-100 mb-8 font-bold leading-relaxed text-lg">
            Accessible entry-level staking starting from $100. Grow your 11::11 tokens with tiered rewards up to 10% APY.
          </p>
          <ul className="space-y-4 relative z-10">
            {['Flexible entry from $100', '7 Progressive Tiers', 'Weekly Compounding', 'Verified Smart Contract'].map((item, i) => (
              <li key={i} className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 font-black">
                <ShieldCheck size={22} />
                <span className="text-zinc-900 dark:text-white">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 p-10 rounded-[40px] relative overflow-hidden group hover:border-amber-500 transition-colors">
          <Crown className="absolute -bottom-4 -right-4 w-32 h-32 text-amber-500/10 group-hover:scale-110 transition-transform" />
          <h3 className="text-4xl font-black mb-4 text-amber-500">VIP Gold Elite</h3>
          <p className="text-zinc-800 dark:text-zinc-100 mb-8 font-bold leading-relaxed text-lg">
            Reserved for elite investors with $50,000+. This exclusive program offers a fixed, high-yield return.
          </p>
          <ul className="space-y-4 relative z-10">
            {[
              { label: 'Fixed 27% APY Rewards', icon: <Zap size={22} /> },
              { label: '9-Month Escrow Period', icon: <Lock size={22} /> },
              { label: 'Priority Support Access', icon: <Globe size={22} /> },
              { label: 'Full Whitelist Enforcement', icon: <ShieldCheck size={22} /> }
            ].map((item, i) => (
              <li key={i} className="flex items-center space-x-3 text-amber-600 dark:text-amber-500 font-black">
                {item.icon}
                <span className="text-zinc-900 dark:text-white">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Process Visualization */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[48px] p-8 md:p-16">
        <h2 className="text-4xl font-black mb-12 text-center text-zinc-950 dark:text-white">The Staking Journey</h2>
        <div className="grid md:grid-cols-4 gap-12">
          {[
            { step: "01", title: "Whitelist", desc: "Complete KYC and verify your wallet for access." },
            { step: "02", title: "Escrow", desc: "Select your tier and lock assets for 9 months." },
            { step: "03", title: "Compound", desc: "Reinvest your yields every 7 days for max growth." },
            { step: "04", title: "Harvest", desc: "Withdraw rewards or final principal at maturity." }
          ].map((item, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/10 dark:bg-emerald-500/20 border-2 border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto text-emerald-500 font-black text-3xl">
                {item.step}
              </div>
              <h4 className="text-2xl font-black text-zinc-950 dark:text-white">{item.title}</h4>
              <p className="text-zinc-800 dark:text-zinc-100 font-bold text-sm px-4 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
