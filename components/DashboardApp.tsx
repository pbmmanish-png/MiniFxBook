"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Activity, BarChart2, List, Plus, X, Target, Trash2, 
  Clock, CalendarDays, BrainCircuit, LayoutDashboard, 
  BookOpen, LineChart, Search, Bell, User, 
  Circle, DollarSign, Trophy, TrendingUp, 
  TrendingDown, Save, Menu, Shield, Zap, Sun, Moon, CheckCircle, star
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AddTradeModal from './AddTradeModal';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trades' | 'journal' | 'performance' | 'profile'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // 1. Normal state banayein (default light mode yaani false)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 2. Page load hote hi browser (localStorage) se theme check karein
  useEffect(() => {
    const savedTheme = localStorage.getItem('minitrade-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  // 3. Theme change karne wala function jo browser me data save karega
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('minitrade-theme', newTheme ? 'dark' : 'light');
  };
  
  // Filters State
  const [perfTimeFilter, setPerfTimeFilter] = useState('All Time');
  const [journalFilter, setJournalFilter] = useState('All');
  
  const [trades, setTrades] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTrades = trades.filter(trade => trade.pair.toLowerCase().includes(searchQuery.toLowerCase()));

  // Profile / Settings States
  const [checklist, setChecklist] = useState(['Checked higher timeframe', 'Risk within limits', 'Fits my trading plan', 'Key levels identified', 'Economic calendar checked']);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileName, setProfileName] = useState(''); 

  // Journal States
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [journalFormData, setJournalFormData] = useState<any>({});

  // Stats States
  const [stats, setStats] = useState({ totalTrades: 0, winRate: 0, netPnl: 0, avgRr: 0, avgWin: 0, avgLoss: 0, bestTrade: 0, worstTrade: 0, profitFactor: '0.00', topPair: '-', topPairPnl: 0 });
  const [equityCurve, setEquityCurve] = useState<any[]>([]);

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/'); return; }
    
    setUserId(session.user.id);
    if (session.user.user_metadata) {
      setProfileName(session.user.user_metadata.full_name || 'Trader');
      if (session.user.user_metadata.trading_checklist) setChecklist(session.user.user_metadata.trading_checklist);
      if (session.user.user_metadata.currency_preference) setCurrency(session.user.user_metadata.currency_preference);
    }
    fetchTrades(session.user.id);
  };

  const fetchTrades = async (uid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.from('user_journal').select('*').eq('user_id', uid).order('trade_date', { ascending: false });
    if (data) { setTrades(data); calculateStats(data); }
    setIsLoading(false);
  };

  const calculateStats = (data: any[]) => {
    if (data.length === 0) {
      setStats({ totalTrades: 0, winRate: 0, netPnl: 0, avgRr: 0, avgWin: 0, avgLoss: 0, bestTrade: 0, worstTrade: 0, profitFactor: '0.00', topPair: '-', topPairPnl: 0 });
      setEquityCurve([]); return;
    }
    const total = data.length;
    const wins = data.filter(t => t.result === 'WIN').length;
    const winningTrades = data.filter(t => Number(t.pnl) > 0);
    const losingTrades = data.filter(t => Number(t.pnl) < 0);
    const pnl = data.reduce((acc, curr) => acc + Number(curr.pnl), 0);
    const rrSum = data.reduce((acc, curr) => acc + Number(curr.risk_reward || 0), 0);
    const grossProfit = winningTrades.reduce((sum, t) => sum + Number(t.pnl), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + Number(t.pnl), 0));
    
    const pairData: {[key: string]: number} = {};
    data.forEach(t => { pairData[t.pair] = (pairData[t.pair] || 0) + Number(t.pnl); });
    const topPairEntry = Object.entries(pairData).sort((a,b) => b[1] - a[1])[0];

    setStats({ 
      totalTrades: total, winRate: Math.round((wins / total) * 100), netPnl: pnl, avgRr: Number((rrSum / total).toFixed(2)),
      avgWin: winningTrades.length ? grossProfit / winningTrades.length : 0, avgLoss: losingTrades.length ? grossLoss / losingTrades.length : 0,
      bestTrade: Math.max(...data.map(t => Number(t.pnl))), worstTrade: Math.min(...data.map(t => Number(t.pnl))),
      profitFactor: grossLoss === 0 ? (grossProfit > 0 ? '∞' : '0.00') : (grossProfit / grossLoss).toFixed(2),
      topPair: topPairEntry ? topPairEntry[0] : '-', topPairPnl: topPairEntry ? topPairEntry[1] : 0
    });

    let runningEquity = 0;
    const curveData = [...data].reverse().map((t, index) => {
      runningEquity += Number(t.pnl);
      return { trade: `T${index+1}`, date: t.trade_date, equity: Number(runningEquity.toFixed(2)) };
    });
    setEquityCurve(curveData);
  };

  const getFilteredPerformanceTrades = () => {
    const now = new Date();
    return trades.filter(t => {
      if (!t.trade_date) return true;
      const tradeDate = new Date(t.trade_date);
      const diffDays = (now.getTime() - tradeDate.getTime()) / (1000 * 3600 * 24);
      if (perfTimeFilter === '7 Days') return diffDays <= 7;
      if (perfTimeFilter === '30 Days') return diffDays <= 30;
      if (perfTimeFilter === '90 Days') return diffDays <= 90;
      if (perfTimeFilter === 'This Year') return tradeDate.getFullYear() === now.getFullYear();
      return true;
    });
  };
  const perfTrades = getFilteredPerformanceTrades();
  const winRateDecimal = stats.winRate / 100;
  const lossRateDecimal = 1 - winRateDecimal;
  const expectancy = (winRateDecimal * stats.avgWin) - (lossRateDecimal * Math.abs(stats.avgLoss));
  const longTrades = perfTrades.filter(t => t.direction === 'LONG');
  const shortTrades = perfTrades.filter(t => t.direction === 'SHORT');
  const longPnl = longTrades.reduce((acc, t) => acc + Number(t.pnl), 0);
  const shortPnl = shortTrades.reduce((acc, t) => acc + Number(t.pnl), 0);
  const longWinRate = longTrades.length ? Math.round((longTrades.filter(t => t.result === 'WIN').length / longTrades.length) * 100) : 0;
  const shortWinRate = shortTrades.length ? Math.round((shortTrades.filter(t => t.result === 'WIN').length / shortTrades.length) * 100) : 0;

  const handleDelete = async (id: string) => {
    if(window.confirm("Delete this trade?")) { await supabase.from('user_journal').delete().eq('id', id); fetchTrades(userId!); }
  };

  const handleSelectTrade = (trade: any) => { setSelectedTrade(trade); setJournalFormData(trade); };
  
  const toggleChecklist = (item: string) => {
    const currentList = journalFormData.execution_checklist || [];
    const updatedList = currentList.includes(item) ? currentList.filter((i: string) => i !== item) : [...currentList, item];
    setJournalFormData({ ...journalFormData, execution_checklist: updatedList });
  };

  const handleUpdateJournal = async () => {
    if (!selectedTrade) return;
    const { error } = await supabase.from('user_journal').update({
        setup_notes: journalFormData.setup_notes, post_trade_notes: journalFormData.post_trade_notes,
        emotions: journalFormData.emotions, lessons: journalFormData.lessons,
        rating: journalFormData.rating ? Number(journalFormData.rating) : 5,
        execution_checklist: journalFormData.execution_checklist || [],
        mistake_made: journalFormData.mistake_made, worked_well: journalFormData.worked_well,
        didnt_work: journalFormData.didnt_work, improve: journalFormData.improve, focus_area: journalFormData.focus_area
      }).eq('id', selectedTrade.id);
    if (!error) {
      if (userId) fetchTrades(userId);
      setSelectedTrade({ ...selectedTrade, ...journalFormData });
      alert("Journal saved successfully! ✅");
    } else alert("Error updating journal: " + error.message);
  };

  const handleAddChecklist = () => { if (newChecklistItem.trim() && checklist.length < 10) { setChecklist([...checklist, newChecklistItem.trim()]); setNewChecklistItem(''); } };
  const handleRemoveChecklist = (indexToRemove: number) => { setChecklist(checklist.filter((_, index) => index !== indexToRemove)); };
  const handleUpdateName = async () => { const { error } = await supabase.auth.updateUser({ data: { full_name: profileName } }); if (!error) alert("Profile Name Updated!"); };
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    const { error } = await supabase.auth.updateUser({ data: { trading_checklist: checklist, currency_preference: currency } });
    setIsSavingProfile(false);
    if (!error) alert("Profile updated successfully! ✅");
  };
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/auth'); };

  const renderMiniCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) { days.push(<div key={`empty-${i}`} className="p-1"></div>); }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTrades = trades.filter(t => t.trade_date === dateStr);
      const dayPnl = dayTrades.reduce((sum, t) => sum + Number(t.pnl), 0);
      let bgClass = 'bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-500 dark:text-slate-400';
      if (dayTrades.length > 0) {
        bgClass = dayPnl > 0 ? 'bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold' : dayPnl < 0 ? 'bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 font-bold' : 'bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold';
      }
      days.push(<div key={day} title={dayTrades.length > 0 ? `PnL: $${dayPnl.toFixed(2)}` : 'No trades'} className={`aspect-square flex items-center justify-center rounded-md md:rounded-lg text-[10px] md:text-xs cursor-pointer transition-colors ${bgClass}`}>{day}</div>);
    }
    return days;
  };

  if (isLoading) {
    return (
      <div className={`flex h-screen items-center justify-center ${isDarkMode ? 'bg-[#030712]' : 'bg-[#F8FAFC]'}`}>
        <div className="flex flex-col items-center gap-4">
          <img src="/logo3.png" alt="Loading" className={`w-14 h-14 md:w-16 md:h-16 object-contain animate-pulse ${isDarkMode ? 'brightness-0 invert' : ''}`} />
          <span className="text-slate-400 text-xs md:text-sm font-bold tracking-widest uppercase animate-pulse">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] text-slate-800 dark:text-slate-300 font-sans flex overflow-hidden selection:bg-blue-100 dark:selection:bg-blue-500/30 transition-colors duration-500 relative z-0">
        
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-500/10 dark:bg-blue-600/10 blur-[100px] md:blur-[120px] rounded-full pointer-events-none -z-10 transition-colors duration-500"></div>

        {/* 📱 MOBILE MENU OVERLAY */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-[#030712]/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* 🟢 FLOATING SIDEBAR (Premium Style) */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] md:w-[280px] p-3 md:p-4 h-screen transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="h-full bg-white dark:bg-[#0A0A0B] border border-slate-200/60 dark:border-white/10 rounded-2xl md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden transition-colors duration-500">
            
            {/* Logo area */}
            <div className="p-5 md:p-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
              <img src="/logo3.png" alt="Minitrade" className="h-7 md:h-8 w-auto object-contain dark:brightness-0 dark:invert transition-all" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1.5 md:space-y-2 custom-scrollbar">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 md:px-4 mb-3 md:mb-4 mt-2">Menu</p>
              
              <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
                <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5"/> Dashboard
              </button>
              <button onClick={() => { setActiveTab('trades'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all ${activeTab === 'trades' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
                <List className="w-4 h-4 md:w-5 md:h-5"/> Trade Ledger
              </button>
              <button onClick={() => { setActiveTab('journal'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all ${activeTab === 'journal' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
                <BookOpen className="w-4 h-4 md:w-5 md:h-5"/> Journal
              </button>
              <button onClick={() => { setActiveTab('performance'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all ${activeTab === 'performance' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
                <BarChart2 className="w-4 h-4 md:w-5 md:h-5"/> Analytics
              </button>
            </nav>

            <div className="p-3 md:p-4 border-t border-slate-100 dark:border-white/5">
              <div onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`p-2.5 md:p-3 bg-slate-50 dark:bg-white/5 rounded-xl md:rounded-2xl border ${activeTab === 'profile' ? 'border-blue-300 dark:border-blue-500/50 ring-2 ring-blue-100 dark:ring-blue-500/20' : 'border-slate-100 dark:border-white/5'} flex items-center gap-3 cursor-pointer hover:border-blue-200 dark:hover:border-blue-500/30 transition-all mb-3`}>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-sm">
                  {profileName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-white truncate transition-colors">{profileName}</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase transition-colors">Settings</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* 🟢 MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* PREMIUM HEADER */}
          <header className="h-16 md:h-24 px-4 md:px-8 flex items-center justify-between shrink-0 z-10 transition-colors duration-500">
            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1.5 md:p-2 -ml-1 text-slate-500 dark:text-slate-400 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg shadow-sm"><Menu className="w-5 h-5" /></button>
              <div>
                <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight capitalize transition-colors">
                  {activeTab === 'dashboard' ? 'Overview' : activeTab === 'trades' ? 'Ledger' : activeTab === 'journal' ? 'Journal' : activeTab === 'profile' ? 'Settings' : 'Analytics'}
                </h1>
                <p className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block transition-colors">Track, analyze, and scale your edge.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {/* LIVE SESSION BADGE */}
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 rounded-full transition-colors">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Live Session</span>
              </div>

              {/* THEME TOGGLE BUTTON */}
              <button 
  onClick={toggleTheme} 
  className="p-2 md:p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full transition-all shadow-sm"
>
  {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
</button>

              <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105">
                <Plus className="w-4 h-4"/> <span className="hidden sm:block">Log Execution</span><span className="sm:hidden">Log</span>
              </button>
            </div>
          </header>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-10 z-10 custom-scrollbar">
            
            {/* 📊 TAB 1: DASHBOARD (Bento Grid) */}
            {activeTab === 'dashboard' && (
              <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-300">
                
                {/* ROW 1: Bento Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 p-5 md:p-6 rounded-3xl md:rounded-[2rem] shadow-xl shadow-blue-600/20 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Activity className="w-4 h-4 md:w-5 md:h-5 text-white"/></div>
                      <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] md:text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">All Time</span>
                    </div>
                    <div className="relative z-10">
                      <p className="text-white/80 text-xs md:text-sm font-medium mb-1">Net P&L</p>
                      <h3 className="text-3xl md:text-4xl font-black tracking-tight">{stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toFixed(2)}</h3>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#12141A] p-5 md:p-6 rounded-3xl md:rounded-[2rem] border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-col justify-between transition-colors duration-500">
                    <div className="flex justify-between items-start mb-4"><div className="p-2 bg-emerald-50 dark:bg-emerald-500/20 rounded-xl"><Target className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400"/></div></div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium mb-1 transition-colors">Win Rate</p>
                      <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{stats.winRate}%</h3>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#12141A] p-5 md:p-6 rounded-3xl md:rounded-[2rem] border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-col justify-between transition-colors duration-500">
                    <div className="flex justify-between items-start mb-4"><div className="p-2 bg-purple-50 dark:bg-purple-500/20 rounded-xl"><Shield className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400"/></div></div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium mb-1 transition-colors">Profit Factor</p>
                      <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{stats.profitFactor}</h3>
                    </div>
                  </div>

                  <div className="col-span-2 lg:col-span-1 bg-white dark:bg-[#12141A] p-5 md:p-6 rounded-3xl md:rounded-[2rem] border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-col justify-between transition-colors duration-500">
                    <div className="flex justify-between items-start mb-4"><div className="p-2 bg-orange-50 dark:bg-orange-500/20 rounded-xl"><BarChart2 className="w-4 h-4 md:w-5 md:h-5 text-orange-600 dark:text-orange-400"/></div></div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium mb-1 transition-colors">Expectancy</p>
                      <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{expectancy > 0 ? '+' : ''}${expectancy.toFixed(2)}</h3>
                    </div>
                  </div>
                </div>

                {/* ROW 2: Chart & Recent */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 p-5 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm flex flex-col min-h-[300px] md:min-h-[380px] transition-colors duration-500">
                    <div className="flex justify-between items-center mb-6 md:mb-8">
                      <div>
                        <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white transition-colors">Equity Curve</h4>
                        <p className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors">Account growth trajectory</p>
                      </div>
                    </div>
                    <div className="flex-1 w-full relative">
                      {equityCurve.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={equityCurve} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isDarkMode ? '#3b82f6' : '#2563eb'} stopOpacity={isDarkMode ? 0.3 : 0.2}/>
                                <stop offset="95%" stopColor={isDarkMode ? '#3b82f6' : '#2563eb'} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#ffffff10' : '#f1f5f9'} />
                            <XAxis dataKey="trade" stroke={isDarkMode ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} dy={10} fontWeight={600} />
                            <YAxis stroke={isDarkMode ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} fontWeight={600}/>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: isDarkMode ? '1px solid #ffffff10' : 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', fontWeight: 'bold', backgroundColor: isDarkMode ? '#12141A' : '#ffffff', color: isDarkMode ? '#ffffff' : '#0f172a' }} itemStyle={{ color: isDarkMode ? '#60a5fa' : '#2563eb' }}/>
                            <Area type="monotone" dataKey="equity" stroke={isDarkMode ? '#3b82f6' : '#2563eb'} strokeWidth={3} fill="url(#colorEquity)" activeDot={{ r: 5, strokeWidth: 0, fill: isDarkMode ? '#3b82f6' : '#2563eb' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10 transition-colors"><LineChart className="w-8 h-8 mb-2 opacity-30"/><span className="font-bold text-xs md:text-sm">Add trades to generate chart</span></div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 p-5 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm flex flex-col max-h-[350px] md:max-h-[450px] transition-colors duration-500">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                      <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white transition-colors">Recent Executions</h4>
                      <button onClick={() => setActiveTab('trades')} className="text-[10px] md:text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3 py-1.5 rounded-full transition-colors">View All</button>
                    </div>
                    <div className="flex-1 space-y-2 md:space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                      {trades.slice(0, 6).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400"><Clock className="w-8 h-8 mb-2 opacity-30"/><p className="text-xs md:text-sm font-bold">No recent trades</p></div>
                      ) : (
                        trades.slice(0, 6).map(trade => (
                          <div key={trade.id} onClick={() => {handleSelectTrade(trade); setActiveTab('journal');}} className="group flex items-center justify-between p-3 md:p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100/80 dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 rounded-2xl transition-colors cursor-pointer">
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${trade.direction === 'LONG' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'}`}>
                                {trade.direction === 'LONG' ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm transition-colors">{trade.pair}</p>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">{trade.trade_date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-mono font-black text-xs md:text-sm ${trade.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} transition-colors`}>
                                {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
                              </p>
                              <span className={`inline-block mt-1 text-[8px] md:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${trade.result === 'WIN' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'} transition-colors`}>
                                {trade.result}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* ROW 3: Top Performer & Calendar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 p-5 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm flex flex-col transition-colors duration-500">
                    <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2 transition-colors"><Trophy className="w-4 h-4 md:w-5 md:h-5 text-amber-500"/> Top Performer</h4>
                    {stats.topPair !== '-' ? (
                      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-100/50 dark:border-amber-500/20 rounded-2xl p-5 md:p-6 text-center transition-colors">
                        <p className="text-[10px] md:text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1 md:mb-2 transition-colors">Most Profitable Pair</p>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 md:mb-4 transition-colors">{stats.topPair}</h2>
                        <span className="inline-flex items-center gap-1 bg-white dark:bg-black/20 text-emerald-600 dark:text-emerald-400 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-black shadow-sm transition-colors">
                          <TrendingUp className="w-3 h-3 md:w-4 md:h-4"/> +${stats.topPairPnl.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 transition-colors"><BarChart2 className="w-6 h-6 md:w-8 md:h-8 mb-2 opacity-30"/><span className="font-bold text-xs md:text-sm">No data yet</span></div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 p-5 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm transition-colors duration-500">
                    <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2 transition-colors"><CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 dark:text-indigo-400"/> Activity Calendar</h4>
                    <div className="bg-slate-50 dark:bg-white/5 p-3 md:p-4 rounded-2xl border border-slate-100 dark:border-white/10 transition-colors">
                      <div className="grid grid-cols-7 gap-1.5 md:gap-2 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (<div key={i} className="text-center text-[9px] md:text-[10px] font-black text-slate-400 uppercase">{d}</div>))}
                      </div>
                      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                        {renderMiniCalendar()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 📝 TAB 2: TRADES (Ledger) */}
            {activeTab === 'trades' && (
              <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
                <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 p-4 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] transition-colors duration-500">
                  
                  {/* Ledger Search Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6 shrink-0">
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-lg md:text-xl transition-colors">Trade Ledger</h3>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors">{filteredTrades.length} Records Found</span>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input type="text" placeholder="Search pairs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 md:pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs md:text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto custom-scrollbar border border-slate-100 dark:border-white/5 rounded-2xl transition-colors">
                    <table className="w-full text-left text-xs md:text-sm whitespace-nowrap">
                      <thead className="bg-slate-50/80 dark:bg-white/5 sticky top-0 backdrop-blur-sm z-10 border-b border-slate-100 dark:border-white/10 transition-colors">
                        <tr className="text-slate-400 dark:text-slate-500 uppercase text-[9px] md:text-[10px] font-black tracking-widest">
                          <th className="px-4 md:px-6 py-3 md:py-4 rounded-tl-2xl">Date</th><th className="px-4 md:px-6 py-3 md:py-4">Symbol</th><th className="px-4 md:px-6 py-3 md:py-4">Direction</th>
                          <th className="px-4 md:px-6 py-3 md:py-4">Entry / Exit</th><th className="px-4 md:px-6 py-3 md:py-4">Result</th><th className="px-4 md:px-6 py-3 md:py-4 text-right">Net P&L</th><th className="px-4 md:px-6 py-3 md:py-4 text-center rounded-tr-2xl">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/80 dark:divide-white/5 transition-colors">
                        {filteredTrades.length === 0 ? (
                          <tr><td colSpan={7} className="p-10 md:p-16 text-center text-slate-400 font-bold"><div className="flex flex-col items-center"><Search className="w-6 h-6 md:w-8 md:h-8 mb-3 opacity-30"/>No trades found.</div></td></tr>
                        ) : (
                          filteredTrades.map(trade => (
                            <tr key={trade.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group bg-white dark:bg-transparent">
                              <td className="px-4 md:px-6 py-3 md:py-4 text-slate-500 dark:text-slate-400 font-bold text-[10px] md:text-xs transition-colors">{trade.trade_date}</td>
                              <td className="px-4 md:px-6 py-3 md:py-4 font-black text-slate-900 dark:text-white transition-colors">{trade.pair}</td>
                              <td className="px-4 md:px-6 py-3 md:py-4"><span className={`inline-flex items-center gap-1 px-2.5 md:px-3 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-colors ${trade.direction === 'LONG' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}>{trade.direction === 'LONG' ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>} {trade.direction}</span></td>
                              <td className="px-4 md:px-6 py-3 md:py-4"><div className="flex flex-col"><span className="text-slate-800 dark:text-slate-200 font-bold transition-colors">{trade.entry_price || '-'}</span><span className="text-[9px] md:text-[10px] text-slate-400 font-bold transition-colors">→ {trade.exit_price || '-'}</span></div></td>
                              <td className="px-4 md:px-6 py-3 md:py-4"><span className={`px-2.5 md:px-3 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase transition-colors ${trade.result === 'WIN' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : trade.result === 'LOSS' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'}`}>{trade.result}</span></td>
                              <td className={`px-4 md:px-6 py-3 md:py-4 text-right font-mono font-black text-sm md:text-base transition-colors ${trade.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{trade.pnl >= 0 ? '+' : ''}${Number(trade.pnl).toFixed(2)}</td>
                              <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                <button onClick={() => handleDelete(trade.id)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"><Trash2 className="w-4 h-4"/></button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 📊 TAB 3: PERFORMANCE / ANALYSIS */}
            {activeTab === 'performance' && (
              <div className="max-w-7xl mx-auto animate-in fade-in duration-300 space-y-4 md:space-y-6 pb-10">
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {['All Time', 'This Year', '90 Days', '30 Days', '7 Days'].map((f) => (
                    <button key={f} onClick={() => setPerfTimeFilter(f)} className={`px-4 md:px-5 py-1.5 md:py-2 text-[10px] md:text-xs font-black rounded-xl whitespace-nowrap transition-all ${perfTimeFilter === f ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white'}`}>{f}</button>
                  ))}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 p-4 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm transition-colors"><p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1.5 md:mb-2">Avg Winning Trade</p><h2 className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 transition-colors">${stats.avgWin.toFixed(2)}</h2></div>
                  <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 p-4 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm transition-colors"><p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1.5 md:mb-2">Avg Losing Trade</p><h2 className="text-2xl md:text-3xl font-black text-red-600 dark:text-red-400 transition-colors">${stats.avgLoss.toFixed(2)}</h2></div>
                  <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 p-4 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm transition-colors"><p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1.5 md:mb-2">Largest Profit</p><h2 className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400 transition-colors">${stats.bestTrade.toFixed(2)}</h2></div>
                  <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 p-4 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm transition-colors"><p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1.5 md:mb-2">Largest Drawdown</p><h2 className="text-2xl md:text-3xl font-black text-orange-600 dark:text-orange-400 transition-colors">${stats.worstTrade.toFixed(2)}</h2></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 p-5 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm transition-colors duration-500">
                    <h4 className="font-black text-slate-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2 transition-colors"><Target className="w-4 h-4 md:w-5 md:h-5 text-purple-500 dark:text-purple-400"/> Strategy Deep Dive</h4>
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center justify-between p-4 md:p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3 md:gap-4"><div className="bg-blue-100 dark:bg-blue-500/20 p-2 md:p-3 rounded-xl text-blue-600 dark:text-blue-400 transition-colors"><TrendingUp className="w-4 h-4 md:w-5 md:h-5"/></div><div><p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm transition-colors">Long Executions</p><p className="text-[10px] md:text-xs font-bold text-slate-400">{longTrades.length} total trades</p></div></div>
                        <div className="text-right"><p className={`font-mono font-black text-lg md:text-xl transition-colors ${longPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{longPnl >= 0 ? '+' : ''}${longPnl.toFixed(2)}</p><p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors">{longWinRate}% Win Rate</p></div>
                      </div>
                      <div className="flex items-center justify-between p-4 md:p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3 md:gap-4"><div className="bg-orange-100 dark:bg-orange-500/20 p-2 md:p-3 rounded-xl text-orange-600 dark:text-orange-400 transition-colors"><TrendingDown className="w-4 h-4 md:w-5 md:h-5"/></div><div><p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm transition-colors">Short Executions</p><p className="text-[10px] md:text-xs font-bold text-slate-400">{shortTrades.length} total trades</p></div></div>
                        <div className="text-right"><p className={`font-mono font-black text-lg md:text-xl transition-colors ${shortPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{shortPnl >= 0 ? '+' : ''}${shortPnl.toFixed(2)}</p><p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors">{shortWinRate}% Win Rate</p></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 p-5 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm flex flex-col transition-colors duration-500">
                    <h4 className="font-black text-slate-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2 transition-colors"><Star className="w-4 h-4 md:w-5 md:h-5 text-amber-500 dark:text-amber-400"/> Top Performing Assets</h4>
                    {stats.topPair !== '-' ? (
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between p-5 md:p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-100/50 dark:border-amber-500/20 rounded-2xl transition-colors">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-200 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl flex items-center justify-center font-black text-base md:text-lg shadow-sm transition-colors">#1</div>
                            <div><p className="font-black text-slate-900 dark:text-white text-xl md:text-2xl transition-colors">{stats.topPair}</p><p className="text-[10px] md:text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest transition-colors">Primary Edge</p></div>
                          </div>
                          <div className="text-right"><p className="font-mono font-black text-xl md:text-2xl text-emerald-600 dark:text-emerald-400 transition-colors">+${stats.topPairPnl.toFixed(2)}</p></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 transition-colors"><BarChart2 className="w-6 h-6 md:w-8 md:h-8 mb-2 opacity-30"/><span className="font-bold text-xs md:text-sm">Not enough data</span></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 📓 TAB 4: JOURNAL */}
            {activeTab === 'journal' && (
              <div className="max-w-7xl mx-auto animate-in fade-in duration-300 flex flex-col lg:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] gap-4 md:gap-6 pb-6">
                
                <div className={`w-full lg:w-1/3 bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 rounded-3xl md:rounded-[2rem] shadow-sm flex flex-col overflow-hidden h-full transition-colors duration-500 ${selectedTrade ? 'hidden lg:flex' : 'flex'}`}>
                  <div className="p-5 md:p-6 border-b border-slate-100 dark:border-white/5 flex flex-col gap-3 md:gap-4 transition-colors">
                    <h3 className="font-black text-slate-900 dark:text-white text-lg md:text-xl flex items-center gap-2 transition-colors"><BookOpen className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400"/> Review Logs</h3>
                    <div className="flex gap-2 bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl border border-slate-100 dark:border-white/5 transition-colors">
                      {['All', 'Journaled', 'Pending'].map(f => (
                        <button key={f} onClick={() => setJournalFilter(f)} className={`flex-1 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all ${journalFilter === f ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>{f}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 bg-slate-50/50 dark:bg-black/20 custom-scrollbar transition-colors">
                    {trades.filter(t => { if (journalFilter === 'Pending') return !t.post_trade_notes; if (journalFilter === 'Journaled') return t.post_trade_notes; return true; }).map(t => (
                      <div key={t.id} onClick={() => handleSelectTrade(t)} className={`p-4 md:p-5 bg-white dark:bg-[#12141A] border rounded-2xl cursor-pointer transition-all ${selectedTrade?.id === t.id ? 'border-blue-400 dark:border-blue-500 shadow-md ring-2 ring-blue-50 dark:ring-blue-500/10' : 'border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-2 md:mb-3">
                          <span className="font-black text-slate-900 dark:text-white text-base md:text-lg transition-colors">{t.pair}</span>
                          <span className={`text-[8px] md:text-[9px] px-2 md:px-2.5 py-1 rounded-full font-black uppercase tracking-widest transition-colors ${t.post_trade_notes ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'}`}>{t.post_trade_notes ? 'Logged' : 'Review'}</span>
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold transition-colors">{t.trade_date}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`flex-1 bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 rounded-3xl md:rounded-[2rem] shadow-sm flex-col h-full overflow-hidden relative transition-colors duration-500 ${!selectedTrade ? 'hidden lg:flex' : 'flex'}`}>
                  {!selectedTrade ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-10 bg-slate-50/50 dark:bg-black/20 transition-colors">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/10 mb-4 md:mb-6 transition-colors"><BookOpen className="w-6 h-6 md:w-8 md:h-8 text-slate-300 dark:text-slate-600"/></div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-2 transition-colors">Select an Execution</h3>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">Choose a trade from the ledger to document your psychology and lessons.</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col h-full">
                      <div className="p-5 md:p-6 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#12141A] shrink-0 flex justify-between items-center z-10 transition-colors">
                        <div className="flex items-center gap-3 md:gap-4">
                          <button onClick={() => setSelectedTrade(null)} className="lg:hidden p-2 md:p-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-white transition-colors"><X className="w-4 h-4 md:w-5 md:h-5"/></button>
                          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white transition-colors">{selectedTrade.pair} <span className="text-xs md:text-sm font-bold text-slate-400 dark:text-slate-500 ml-1 md:ml-2">Review</span></h2>
                        </div>
                        <button onClick={handleUpdateJournal} className="px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs md:text-sm shadow-[0_4px_15px_rgba(37,99,235,0.2)] transition-all hover:scale-105">Save Log</button>
                      </div>

                      <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-4 md:space-y-6 bg-slate-50/50 dark:bg-black/20 custom-scrollbar transition-colors">
                        <div className="space-y-3 md:space-y-4">
                          <textarea value={journalFormData.setup_notes || ''} onChange={(e) => setJournalFormData({...journalFormData, setup_notes: e.target.value})} className="w-full min-h-[80px] md:min-h-[100px] p-4 md:p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-xs md:text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-colors" placeholder="Pre-Trade Rationale... Why did you take this setup?"/>
                          <textarea value={journalFormData.post_trade_notes || ''} onChange={(e) => setJournalFormData({...journalFormData, post_trade_notes: e.target.value})} className="w-full min-h-[80px] md:min-h-[100px] p-4 md:p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-xs md:text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-colors" placeholder="Post-Trade Review... How did it play out?"/>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                           <div className="space-y-3 md:space-y-4">
                              <textarea value={journalFormData.mistake_made || ''} onChange={(e) => setJournalFormData({...journalFormData, mistake_made: e.target.value})} className="w-full min-h-[80px] md:min-h-[100px] p-4 md:p-5 border border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 focus:bg-white dark:focus:bg-white/5 rounded-2xl text-xs md:text-sm font-bold text-slate-800 dark:text-white placeholder:text-red-400 dark:placeholder:text-red-500/50 outline-none focus:ring-2 focus:ring-red-400 transition-colors" placeholder="🚨 Mistake Made (e.g., FOMO, Late Entry)"/>
                              <textarea value={journalFormData.worked_well || ''} onChange={(e) => setJournalFormData({...journalFormData, worked_well: e.target.value})} className="w-full min-h-[80px] md:min-h-[100px] p-4 md:p-5 border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 focus:bg-white dark:focus:bg-white/5 rounded-2xl text-xs md:text-sm font-bold text-slate-800 dark:text-white placeholder:text-emerald-500 dark:placeholder:text-emerald-500/50 outline-none focus:ring-2 focus:ring-emerald-400 transition-colors" placeholder="✅ What Worked Well..."/>
                              <textarea value={journalFormData.didnt_work || ''} onChange={(e) => setJournalFormData({...journalFormData, didnt_work: e.target.value})} className="w-full min-h-[80px] md:min-h-[100px] p-4 md:p-5 border border-orange-200 dark:border-orange-500/20 bg-orange-50/50 dark:bg-orange-500/5 focus:bg-white dark:focus:bg-white/5 rounded-2xl text-xs md:text-sm font-bold text-slate-800 dark:text-white placeholder:text-orange-400 dark:placeholder:text-orange-500/50 outline-none focus:ring-2 focus:ring-orange-400 transition-colors" placeholder="❌ What Didn't Work..."/>
                           </div>
                           <div className="space-y-3 md:space-y-4">
                              <textarea value={journalFormData.improve || ''} onChange={(e) => setJournalFormData({...journalFormData, improve: e.target.value})} className="w-full min-h-[80px] md:min-h-[100px] p-4 md:p-5 border border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5 focus:bg-white dark:focus:bg-white/5 rounded-2xl text-xs md:text-sm font-bold text-slate-800 dark:text-white placeholder:text-blue-400 dark:placeholder:text-blue-500/50 outline-none focus:ring-2 focus:ring-blue-400 transition-colors" placeholder="📈 What To Improve..."/>
                              <textarea value={journalFormData.focus_area || ''} onChange={(e) => setJournalFormData({...journalFormData, focus_area: e.target.value})} className="w-full min-h-[80px] md:min-h-[100px] p-4 md:p-5 border border-purple-200 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-500/5 focus:bg-white dark:focus:bg-white/5 rounded-2xl text-xs md:text-sm font-bold text-slate-800 dark:text-white placeholder:text-purple-400 dark:placeholder:text-purple-500/50 outline-none focus:ring-2 focus:ring-purple-400 transition-colors" placeholder="🎯 Focus Area For Next Trade..."/>
                           </div>
                        </div>

                        <div className="bg-white dark:bg-[#12141A] border border-slate-200 dark:border-white/10 rounded-2xl p-5 md:p-6 shadow-sm transition-colors">
                          <label className="text-[9px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 md:mb-4 block transition-colors">Execution Checklist Verification</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            {checklist.map(item => (
                              <div key={item} className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 rounded-xl cursor-pointer transition-colors" onClick={() => toggleChecklist(item)}>
                                <input type="checkbox" checked={(journalFormData.execution_checklist || []).includes(item)} readOnly className="w-4 h-4 md:w-5 md:h-5 accent-blue-600 rounded cursor-pointer" />
                                <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 👤 TAB 5: PROFILE */}
            {activeTab === 'profile' && (
              <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-4 md:space-y-6 pb-12">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white dark:bg-[#12141A] p-6 md:p-8 border border-slate-200/60 dark:border-white/10 rounded-3xl md:rounded-[2rem] shadow-sm transition-colors duration-500">
                  <div><h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white transition-colors">Workspace Settings</h2><p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">Configure your personal trading parameters.</p></div>
                  <button onClick={handleSaveProfile} disabled={isSavingProfile} className="bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold text-xs md:text-sm shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-70"><Save className="w-4 h-4"/> {isSavingProfile ? 'Saving...' : 'Apply Changes'}</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 rounded-3xl md:rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col transition-colors duration-500">
                    <div className="mb-4 md:mb-6"><h3 className="font-black text-slate-900 dark:text-white text-base md:text-lg mb-1 transition-colors">Pre-Trade Rules</h3><p className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors">Your custom checklist for trade entry.</p></div>
                    <div className="flex justify-between items-center mb-3 md:mb-4"><span className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full transition-colors">{checklist.length}/10 Rules</span><button onClick={() => setChecklist([])} className="text-[10px] md:text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full transition-colors">Clear</button></div>
                    <div className="space-y-2 md:space-y-3 flex-1 overflow-y-auto mb-4 md:mb-6 max-h-[250px] md:max-h-[300px] custom-scrollbar">
                      {checklist.length === 0 ? <p className="text-xs md:text-sm text-slate-400 text-center py-6 font-bold">No rules configured.</p> : checklist.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl md:rounded-2xl group border border-slate-100 dark:border-white/5 transition-colors"><Circle className="w-3 h-3 md:w-4 md:h-4 text-blue-500 shrink-0" strokeWidth={4}/><span className="text-xs md:text-sm text-slate-800 dark:text-white font-bold flex-1 transition-colors">{item}</span><button onClick={() => handleRemoveChecklist(index)} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1.5 md:p-2 bg-white dark:bg-black/20 rounded-lg shadow-sm"><X className="w-3 h-3 md:w-4 md:h-4"/></button></div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()} placeholder="E.g. Daily trend is bullish..." className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs md:text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                      <button onClick={handleAddChecklist} disabled={checklist.length >= 10 || !newChecklistItem.trim()} className="bg-slate-900 dark:bg-blue-600 text-white px-3 md:px-4 rounded-xl hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors disabled:opacity-50"><Plus className="w-4 h-4 md:w-5 md:h-5"/></button>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 rounded-3xl md:rounded-[2rem] p-6 md:p-8 shadow-sm transition-colors duration-500">
                      <h3 className="font-black text-slate-900 dark:text-white text-base md:text-lg mb-1 transition-colors">Trader Profile</h3>
                      <p className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 md:mb-6 transition-colors">Update your display name.</p>
                      <label className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block transition-colors">Full Name</label>
                      <div className="flex flex-col sm:flex-row gap-2 md:gap-3"><input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs md:text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" /><button onClick={handleUpdateName} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold hover:bg-blue-600 dark:hover:bg-slate-200 transition-colors w-full sm:w-auto">Update</button></div>
                    </div>

                    <div className="bg-white dark:bg-[#12141A] border border-slate-200/60 dark:border-white/10 rounded-3xl md:rounded-[2rem] p-6 md:p-8 shadow-sm transition-colors duration-500">
                      <h3 className="font-black text-slate-900 dark:text-white text-base md:text-lg mb-1 transition-colors">Preferences</h3>
                      <p className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 md:mb-6 transition-colors">Base currency for calculations.</p>
                      <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl transition-colors"><div className="bg-white dark:bg-[#12141A] shadow-sm p-2.5 md:p-3 rounded-xl text-blue-600 dark:text-blue-400 transition-colors"><DollarSign className="w-4 h-4 md:w-5 md:h-5"/></div><div className="flex-1"><p className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 transition-colors">Base Currency</p><select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full text-xs md:text-sm font-black text-slate-900 dark:text-white bg-transparent outline-none cursor-pointer transition-colors"><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="INR">INR (₹)</option></select></div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* 🟢 MODAL: ADD TRADE */}
        {isModalOpen && userId && (
          <AddTradeModal 
            userId={userId} 
            userChecklist={checklist}
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => { setIsModalOpen(false); fetchTrades(userId); }} 
          />
        )}
      </div>
    </div>
  );
}

