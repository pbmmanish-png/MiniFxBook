"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, Shield, Zap, ArrowRight, BookOpen, 
  BarChart2, Menu, X, Target, BrainCircuit, CheckCircle 
} from 'lucide-react';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLandingLoading, setIsLandingLoading] = useState(true);

  // Pre-loader logic: 1.5 second ke baad logo hat jayega
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLandingLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 🟢 CUSTOM LOGO LOADING SCREEN
  if (isLandingLoading) {
    return (
      <div className="fixed inset-0 bg-[#F8FAFC] z-[9999] flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center gap-6">
          {/* Logo Pulse Animation */}
          <img 
            src="/logo3.png" 
            alt="Loading..." 
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain animate-pulse drop-shadow-xl" 
          />
          {/* Loading Indicator */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-200 overflow-x-hidden">
      
      {/* 🌐 NAVBAR */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/logo3.png" 
              alt="Minitrade Logo" 
              className="h-8 sm:h-9 w-auto object-contain" 
            />
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              100% Free
            </span>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth" className="font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link href="/auth" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all hover:shadow-lg flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-700">Features</Link>
            <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-700">How it Works</Link>
            <div className="h-px bg-slate-100 my-2"></div>
            <Link href="/auth" className="text-lg font-bold text-slate-700">Log in</Link>
            <Link href="/auth" className="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-center shadow-md">
              Get Started for Free
            </Link>
          </div>
        )}
      </header>

      {/* 🚀 HERO SECTION */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center flex flex-col items-center relative">
        {/* Background glow effect */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-400/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-xs md:text-sm mb-6 md:mb-8 z-10">
          <Zap className="w-3 h-3 md:w-4 md:h-4 text-amber-500 fill-amber-500" />
          The Ultimate Trading Journal
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl z-10">
          Master Your Psychology. <br className="hidden sm:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Elevate Your Trading.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mb-8 md:mb-10 leading-relaxed z-10 px-4">
          Log your trades, analyze your performance, and discover your true edge. 
          Stop gambling and start treating your trading like a professional business.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center z-10 px-4">
          <Link href="/auth" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 md:px-8 md:py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all md:hover:-translate-y-1 text-base md:text-lg flex items-center justify-center gap-2 w-full sm:w-auto">
            Start Journaling for Free <ArrowRight className="w-5 h-5"/>
          </Link>
          <Link href="#demo" className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3.5 md:px-8 md:py-4 rounded-xl font-bold transition-all text-base md:text-lg flex items-center justify-center w-full sm:w-auto">
            View Live Demo
          </Link>
        </div>

        {/* Hero Image Preview */}
        <div className="mt-16 md:mt-20 w-full relative px-4 sm:px-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent z-10"></div>
          <div className="bg-white border border-slate-200 rounded-t-xl md:rounded-t-3xl shadow-2xl overflow-hidden flex flex-col items-center p-1.5 md:p-2 pt-3 md:pt-4">
             <div className="w-full max-w-5xl h-[250px] sm:h-[350px] md:h-[400px] bg-slate-50 rounded-lg md:rounded-xl border border-slate-100 flex items-center justify-center relative overflow-hidden">
                <BarChart2 className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-20 text-blue-600"/>
             </div>
          </div>
        </div>
      </section>

      {/* 🛠️ HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How MiniFxBook Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Three simple steps to transition from an emotional gambler to a data-driven professional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-600/0 via-blue-600 to-blue-600/0 opacity-30"></div>

            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 z-10">
                <Target className="w-8 h-8 text-white"/>
              </div>
              <h3 className="text-xl font-bold mb-3">1. Execute & Log</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Take your trades and instantly log them with our rapid-entry modal. Record your setup, R:R, and execution checklist.</p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 z-10">
                <BrainCircuit className="w-8 h-8 text-white"/>
              </div>
              <h3 className="text-xl font-bold mb-3">2. Document Psychology</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Go beyond the numbers. Log your emotions, mistakes (like FOMO or revenge trading), and lessons learned for each setup.</p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 z-10">
                <TrendingUp className="w-8 h-8 text-white"/>
              </div>
              <h3 className="text-xl font-bold mb-3">3. Analyze & Scale</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Let our analytics engine reveal your true edge. See exactly which setups work and scale your profitability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ✨ FEATURES SECTION */}
      <section id="features" className="py-20 md:py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to succeed</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Built by traders, for traders. We provide the tools to help you identify what works and eliminate what doesn't.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-2xl hover:border-blue-200 transition-colors group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-blue-600"/>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3">Detailed Trade Logging</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Record your entry, exit, setup, and most importantly, your psychological state and mistakes.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-2xl hover:border-green-200 transition-colors group">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-600"/>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3">Advanced Analytics</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Visualize your equity curve, win rate, and expectancy. See exactly where your edge lies.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-2xl hover:border-purple-200 transition-colors group">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-purple-600"/>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3">Identify Costly Mistakes</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Our system tracks how much FOMO, revenge trading, and hesitation are actually costing you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to find your edge?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join today. No credit card required, 100% free for all traders.</p>
          <Link href="/auth" className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold shadow-lg transition-all hover:scale-105 text-lg">
            Create Free Account <CheckCircle className="w-5 h-5"/>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <img 
              src="/logo3.png" 
              alt="Minitrade Logo" 
              className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" 
            />
          </div>
          <p className="text-sm">© {new Date().getFullYear()} MiniFxBook. All rights reserved.</p>
        </div>
      </footer>
      
    </div>
  );
}