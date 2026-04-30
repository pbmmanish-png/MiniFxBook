"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, Shield, Zap, ArrowRight, BookOpen, 
  BarChart2, Menu, X, Target, BrainCircuit, CheckCircle,
  Activity, PieChart, Sparkles, Crosshair, Sun, Moon
} from 'lucide-react';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLandingLoading, setIsLandingLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  
  // 🌙 Local State for Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Scroll effect for navbar glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check Local Storage for Theme on Mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('minitrade-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
    // Pre-loader timer
    const timer = setTimeout(() => setIsLandingLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Theme Toggle Function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('minitrade-theme', newTheme ? 'dark' : 'light');
  };

  // 🟢 CLEAN WHITE LOADING SCREEN (Adapts to Dark Mode)
  if (isLandingLoading) {
    return (
      <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#030712]' : 'bg-white'}`}>
        <div className="relative flex flex-col items-center gap-6">
          <img 
            src="/icon.png" // Use your square icon or logo3.png here
            alt="Loading Minitrade..." 
            className={`w-24 h-24 object-contain animate-pulse ${isDarkMode ? 'brightness-0 invert' : ''}`} 
          />
          <div className={`w-40 h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
            <div className="h-full bg-blue-600 rounded-full animate-[loading-bar_1.5s_infinite_linear] w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-[#030712] text-slate-800 dark:text-slate-300 font-sans selection:bg-blue-100 dark:selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-500">
        
        {/* 🛸 FROSTED PILL NAVBAR */}
        <header className="fixed top-4 left-0 w-full z-50 px-4 md:px-6">
          <div className={`max-w-6xl mx-auto transition-all duration-500 rounded-full px-6 py-3 flex items-center justify-between ${scrolled ? 'bg-white/70 dark:bg-[#0A0A0B]/70 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)]' : 'bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm'}`}>
            <div className="flex items-center gap-3 relative z-10">
              <img src="/logo3.png" alt="Minitrade" className="h-7 w-auto object-contain dark:brightness-0 dark:invert transition-all" />
            </div>
            
            <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-500 dark:text-slate-400">
              <Link href="#features" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Features</Link>
              <Link href="#deep-dive" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Analytics</Link>
              <div className="h-4 w-px bg-slate-300 dark:bg-white/20"></div>
              <span className="flex items-center gap-2 text-violet-600 dark:text-violet-400 bg-violet-100/50 dark:bg-violet-500/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-violet-200 dark:border-violet-500/30">
                <Sparkles className="w-3 h-3"/> Free
              </span>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button onClick={toggleTheme} className="p-2 md:p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full transition-all shadow-sm">
                {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
              </button>

              <Link href="/auth" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Sign In</Link>
              <Link href="/auth" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:scale-105">
                Launch App
              </Link>
            </div>

            <div className="md:hidden flex items-center gap-3 relative z-50">
              <button onClick={toggleTheme} className="p-2 text-slate-800 dark:text-white">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 text-slate-800 dark:text-white">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu with Close Button */}
          <div className={`fixed top-4 left-4 right-4 bg-white/98 dark:bg-[#0A0A0B]/98 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 z-[60] transition-all duration-300 origin-top shadow-2xl ${isMobileMenuOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col gap-6 mt-8">
              <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-slate-900 dark:text-white">Features</Link>
              <Link href="#deep-dive" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</Link>
              <div className="h-px bg-slate-100 dark:bg-white/10 w-full my-2"></div>
              <Link href="/auth" className="text-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-xl text-center border border-slate-200 dark:border-white/10 shadow-sm">Sign In</Link>
              <Link href="/auth" className="text-xl font-bold text-white bg-slate-900 dark:bg-blue-600 px-6 py-4 rounded-xl text-center shadow-md">Launch App</Link>
            </div>
          </div>
        </header>

        {/* 🚀 HERO SECTION WITH FLOATING CARDS */}
        {/* Mobile par height issues aur padding fix ki gayi hai */}
        <section className="relative pt-32 md:pt-52 pb-10 md:pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 z-10 md:min-h-screen overflow-hidden">
          
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 transition-colors duration-500"></div>
          
          {/* Left Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs tracking-widest uppercase mb-6 animate-fade-in-up shadow-sm">
              <Zap className="w-3 h-3 fill-blue-600 dark:fill-blue-400" /> Professional Trade Journal
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-6 transition-colors duration-500">
              Visualize Your <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Trading Edge.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-lg leading-relaxed transition-colors duration-500">
              Stop losing data in spreadsheets. Log executions, analyze psychology, and track custom checklists in a beautifully designed, lightning-fast workspace.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/auth" className="px-8 py-4 bg-blue-600 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg transition-all hover:bg-blue-700 dark:hover:bg-slate-200 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1 flex items-center justify-center gap-2">
                Create Free Account <ArrowRight className="w-5 h-5"/>
              </Link>
            </div>
          </div>

          {/* Right - Floating Cards Cluster */}
          {/* Centering aur sizing issue fix kar di gayi hai */}
          <div className="w-full lg:w-1/2 relative h-[400px] sm:h-[450px] md:h-[500px] mt-8 lg:mt-0 flex items-center justify-center perspective-1000">
            
            <div className="relative w-full max-w-[320px] sm:max-w-[420px] md:max-w-[500px] h-[340px] sm:h-[450px] mx-auto">
              
              {/* Card 1: Main Dashboard (Center) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-72 bg-white/90 dark:bg-[#12141A]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl animate-float-medium z-30 transition-colors duration-500">
                 <div className="flex justify-between items-center mb-4 sm:mb-5">
                   <div className="flex items-center gap-2 sm:gap-3">
                     <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400"><BarChart2 className="w-4 h-4 sm:w-5 sm:h-5"/></div>
                     <div>
                       <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm transition-colors">NAS100 Long</p>
                       <p className="text-[9px] sm:text-[10px] text-slate-400">10:30 AM EST</p>
                     </div>
                   </div>
                   <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs sm:text-sm transition-colors">+$840.50</span>
                 </div>
                 <div className="space-y-3 sm:space-y-4">
                   <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-2.5 sm:p-3 border border-slate-100 dark:border-white/5 transition-colors">
                     <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold mb-1">Emotion Logged</p>
                     <p className="text-xs sm:text-sm text-slate-700 dark:text-white font-medium transition-colors">Calm, Followed Plan 🎯</p>
                   </div>
                   <button className="w-full py-1.5 sm:py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-lg text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors">View Analysis</button>
                 </div>
              </div>

              {/* Card 2: Win Rate (Top Left) */}
              <div className="absolute top-[0px] sm:top-[20px] left-[-10px] sm:left-[-15px] w-40 sm:w-48 bg-white/90 dark:bg-[#12141A]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl animate-float-slow -rotate-6 z-20 transition-colors duration-500">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 dark:text-emerald-400"/>
                  <span className="font-bold text-slate-700 dark:text-white text-xs sm:text-sm transition-colors">Win Rate</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1 transition-colors">68%</p>
                <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium transition-colors">+5% this week</p>
              </div>

              {/* Card 3: Execution Checklist (Bottom Right) */}
              <div className="absolute bottom-[-10px] sm:bottom-[20px] right-[-10px] sm:right-[-15px] w-48 sm:w-56 bg-white/90 dark:bg-[#12141A]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl animate-float-fast rotate-3 z-40 transition-colors duration-500">
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Pre-Trade Checklist</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 dark:text-emerald-400"/><span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium">15m Trend Aligned</span></div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 dark:text-emerald-400"/><span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium">Risk &lt; 1%</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div><span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">Wait for candle close</span></div>
                </div>
              </div>

              {/* Card 4: Expectancy (Top Right) */}
              <div className="absolute top-[40px] sm:top-[60px] right-[-5px] sm:right-[-25px] w-32 sm:w-40 bg-blue-50/90 dark:bg-blue-600/20 backdrop-blur-xl border border-blue-100 dark:border-blue-500/30 rounded-2xl p-3 sm:p-4 shadow-xl animate-float-medium rotate-12 z-10 transition-colors duration-500">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400 mb-2 transition-colors"/>
                <p className="text-[9px] sm:text-[10px] text-blue-400 uppercase font-bold">Expectancy</p>
                <p className="text-lg sm:text-xl font-black text-blue-700 dark:text-white transition-colors">+$124</p>
              </div>

            </div>
          </div>
        </section>

        {/* 📊 DEEP DIVE: SPLIT SECTIONS */}
        <section id="deep-dive" className="py-24 bg-slate-50 dark:bg-[#0A0A0B] border-y border-slate-200 dark:border-white/5 overflow-hidden transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6 space-y-32">
            
            {/* Section 1: Detailed Logging */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="w-12 h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-sm mb-6 transition-colors">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Journaling, reimagined.</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
                  Standard journals only track numbers. Minitrade tracks the human behind the trade. Log your exact entry/exit points, but more importantly, document your emotions, specific mistakes (like FOMO or revenge trading), and pre-trade execution checklists.
                </p>
                <ul className="space-y-4 pt-4">
                  {['Custom pre-trade checklists', 'Emotion & Mistake tracking', 'Detailed setup notes & lessons'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium transition-colors">
                      <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400"/> {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Visual Mockup */}
              <div className="w-full lg:w-1/2 relative">
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 blur-3xl rounded-full opacity-50 -z-10 transition-colors"></div>
                <div className="bg-white dark:bg-[#12141A] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none rotate-2 hover:rotate-0 transition-all duration-500">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-black text-xl text-slate-900 dark:text-white">XAUUSD</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-full uppercase">Winner</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 transition-colors">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Mistake Logged</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300 mt-1">🚨 FOMO (Entered too early)</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 transition-colors">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Emotions</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300 mt-1">Anxious, Impatient</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Advanced Analytics */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="w-12 h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-sm mb-6 transition-colors">
                  <PieChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400"/>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Data that makes you profitable.</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
                  Raw data is useless without context. Our analytics engine breaks down your performance to show you exactly where your edge lies. Compare long vs short trades, calculate true expectancy, and visualize your equity curve growing over time.
                </p>
                <ul className="space-y-4 pt-4">
                  {['Interactive Equity Curve', 'Long vs Short performance metrics', 'Expectancy & Profit Factor calculation'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium transition-colors">
                      <CheckCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400"/> {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Visual Mockup */}
              <div className="w-full lg:w-1/2 relative">
                <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 blur-3xl rounded-full opacity-50 -z-10 transition-colors"></div>
                <div className="bg-white dark:bg-[#12141A] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none -rotate-2 hover:rotate-0 transition-all duration-500">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400"/> Long vs Short</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-lg text-blue-600 dark:text-blue-400"><TrendingUp className="w-5 h-5"/></div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white transition-colors">Long Positions</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">42 trades</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">+$2,450.00</p>
                        <p className="text-xs font-bold text-slate-400">72% Win Rate</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 dark:bg-orange-500/20 p-2 rounded-lg text-orange-600 dark:text-orange-400"><TrendingUp className="w-5 h-5 rotate-180"/></div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white transition-colors">Short Positions</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">18 trades</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-lg text-red-600 dark:text-red-400">-$340.00</p>
                        <p className="text-xs font-bold text-slate-400">44% Win Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ⚡ BENTO GRID FEATURES */}
        <section id="features" className="py-24 bg-white dark:bg-[#030712] relative z-10 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight transition-colors">Built for Professional Traders.</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto transition-colors">Everything you need to treat your trading like a business, organized in a lightning-fast, distraction-free environment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-3xl hover:border-blue-200 dark:hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5">
                <Activity className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-6"/>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">Lightning Fast Entry</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">Log trades in seconds with our optimized modal. Don't let journaling interrupt your trading session.</p>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-3xl hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
                <Crosshair className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-6"/>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">Custom Trading Rules</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">Set up your personalized pre-trade checklists to enforce discipline and prevent impulsive entries.</p>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-3xl hover:border-purple-200 dark:hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/5">
                <BrainCircuit className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-6"/>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">Psychological Review</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">Dedicated sections to document what worked, what didn't, and define focus areas for your next session.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 🛠️ HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-24 bg-slate-900 dark:bg-[#050505] text-white transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-black mb-6">The Methodology.</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">Three simple steps to transition from an emotional gambler to a data-driven, consistently profitable professional.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-600/0 via-blue-500 to-blue-600/0 opacity-30"></div>

              <div className="relative flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-slate-800 border-4 border-slate-900 dark:border-[#050505] rounded-full flex items-center justify-center mb-6 shadow-xl z-10 group-hover:bg-blue-600 transition-colors duration-300">
                  <span className="text-2xl font-black">1</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Execute & Log</h3>
                <p className="text-slate-400 leading-relaxed">Take your trades and instantly log them. Record your setup, P&L, and verify your execution checklist.</p>
              </div>

              <div className="relative flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-slate-800 border-4 border-slate-900 dark:border-[#050505] rounded-full flex items-center justify-center mb-6 shadow-xl z-10 group-hover:bg-blue-600 transition-colors duration-300">
                  <span className="text-2xl font-black">2</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Review Psychology</h3>
                <p className="text-slate-400 leading-relaxed">Go beyond the numbers. Log your emotions, flag mistakes like FOMO, and write down actionable lessons.</p>
              </div>

              <div className="relative flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-slate-800 border-4 border-slate-900 dark:border-[#050505] rounded-full flex items-center justify-center mb-6 shadow-xl z-10 group-hover:bg-blue-600 transition-colors duration-300">
                  <span className="text-2xl font-black">3</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Analyze & Scale</h3>
                <p className="text-slate-400 leading-relaxed">Let our analytics engine reveal your true edge. Identify which setups make money, and scale your size safely.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 bg-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto px-6 text-center text-white relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Ready to find your edge?</h2>
            <p className="text-blue-100 mb-12 text-xl max-w-2xl mx-auto">Join the new standard of trade journaling today. No credit cards, no subscriptions. 100% free for all traders.</p>
            <Link href="/auth" className="inline-flex items-center gap-3 bg-white text-blue-600 hover:bg-slate-50 px-10 py-5 rounded-full font-black shadow-2xl transition-all hover:scale-105 hover:shadow-blue-900/50 text-lg">
              Create Your Free Account <ArrowRight className="w-6 h-6"/>
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-10 relative z-10 bg-white dark:bg-[#030712] border-t border-transparent dark:border-white/10 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <img src="/logo3.png" alt="Minitrade" className="h-6 object-contain opacity-60 hover:opacity-100 dark:brightness-0 dark:invert transition-all" />
            </div>
            <p>© {new Date().getFullYear()} Minitrade.ai Platform. Built for the disciplined.</p>
          </div>
        </footer>

        {/* 🪄 ANIMATIONS CSS */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) rotate(-6deg); }
            50% { transform: translateY(-20px) rotate(-4deg); }
          }
          @keyframes float-medium {
            0%, 100% { transform: translateY(0) translateX(-50%) rotate(0deg); }
            50% { transform: translateY(-15px) translateX(-50%) rotate(1deg); }
          }
          @keyframes float-fast {
            0%, 100% { transform: translateY(0) rotate(3deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          
          .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
          .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
          .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        `}} />
      </div>
    </div>
  );
}