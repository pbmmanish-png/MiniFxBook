import Link from 'next/link';
import { LineChart, TrendingUp, Shield, Zap, ArrowRight, BookOpen, BarChart2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-200">
      
      {/* 🌐 NAVBAR */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <LineChart className="w-6 h-6"/>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Minitrade<span className="text-blue-600 font-black">.ai</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/auth" className="hidden md:block font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link href="/auth" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all hover:shadow-lg flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>
      </header>

      {/* 🚀 HERO SECTION */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-sm mb-8 animate-fade-in-up">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          The Ultimate Trading Journal
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6 max-w-4xl">
          Master Your Psychology. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Elevate Your Trading.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
          Log your trades, analyze your performance, and discover your true edge. 
          Stop gambling and start treating your trading like a professional business.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/auth" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 text-lg flex items-center justify-center gap-2">
            Start Journaling for Free <ArrowRight className="w-5 h-5"/>
          </Link>
          <Link href="#demo" className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold transition-all text-lg flex items-center justify-center">
            View Live Demo
          </Link>
        </div>

        {/* Hero Image / Dashboard Mockup Preview */}
        <div className="mt-20 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent z-10"></div>
          <div className="bg-white border border-slate-200 rounded-t-2xl md:rounded-t-3xl shadow-2xl overflow-hidden flex flex-col items-center p-2 pt-4">
             <div className="w-full max-w-5xl h-[400px] bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                {/* Aap yahan apne dashboard ka actual screenshot laga sakte hain baad me */}
                <div className="text-center text-slate-400">
                  <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                  <p className="font-semibold">Dashboard Preview Appears Here</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ✨ FEATURES SECTION */}
      <section id="features" className="py-24 bg-white border-y border-slate-200 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to succeed</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Built by traders, for traders. We provide the tools to help you identify what works and eliminate what doesn't.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-blue-600"/>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Detailed Trade Logging</h3>
              <p className="text-slate-600 leading-relaxed">Record your entry, exit, setup, and most importantly, your psychological state and mistakes.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-green-600"/>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Advanced Analytics</h3>
              <p className="text-slate-600 leading-relaxed">Visualize your equity curve, win rate, and risk-to-reward ratio. See exactly where your edge lies.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-purple-600"/>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Identify Costly Mistakes</h3>
              <p className="text-slate-600 leading-relaxed">Our system tracks how much FOMO, revenge trading, and hesitation are actually costing you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <LineChart className="w-6 h-6 text-blue-500"/>
            <span className="text-xl font-bold tracking-tight text-white">Minitrade<span className="text-blue-500">.ai</span></span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Minitrade.ai. All rights reserved.</p>
        </div>
      </footer>
      
    </div>
  );
}