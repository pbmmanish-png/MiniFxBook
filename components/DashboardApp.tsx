"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserProfileSidebar from './UserProfileSidebar';
import { 
  Activity, BarChart2, List, Plus, X, Target, Trash2, 
  Clock, CalendarDays, BrainCircuit, ChevronLeft, ChevronRight,
  LayoutDashboard, BookOpen, LineChart, Globe, Cpu, History, 
  Users, Search, Bell, Settings, ChevronDown, User, Scale, 
  Sparkles, Circle, DollarSign, RefreshCw, Trophy, TrendingUp, TrendingDown, Edit3, Save, AlertTriangle, Tag, Star, CheckSquare, MessageSquare, ListTodo, Menu
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AddTradeModal from './AddTradeModal';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trades' | 'journal' | 'performance' | 'profile'>('dashboard');
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Filters State
  const [perfTimeFilter, setPerfTimeFilter] = useState('All Time');
  const [journalFilter, setJournalFilter] = useState('All'); // All, Journaled, Pending
  
  const [trades, setTrades] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    trade_date: new Date().toISOString().split('T')[0], pair: 'XAUUSD', direction: 'LONG', lot_size: '0.01', trading_session: 'New York Open', entry_price: '', exit_price: '', pnl: '', result: 'WIN', risk_reward: '', setup_notes: '', mistake: 'None'
  });
  const [searchQuery, setSearchQuery] = useState('');
  // Search query ke hisab se trades ko filter karna
  const filteredTrades = trades.filter(trade => 
    trade.pair.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // --- PROFILE TAB STATES ---
  
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const handleAddChecklist = () => {
    if (newChecklistItem.trim() && checklist.length < 10) {
      setChecklist([...checklist, newChecklistItem.trim()]);
      setNewChecklistItem('');
    }
  };

  const handleRemoveChecklist = (indexToRemove: number) => {
    setChecklist(checklist.filter((_, index) => index !== indexToRemove));
  };
  const [profileName, setProfileName] = useState(''); // Fetch ke time isme user ka current name set kar lein

  const handleUpdateName = async () => {
    const { error } = await supabase.auth.updateUser({ data: { full_name: profileName } });
    if (!error) alert("Profile Name Updated!");
  };

  // Profile UI me add karein (Jahan Display Settings hai, uske theek upar):
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
    <h3 className="font-bold text-slate-800 mb-1">Edit Profile Info</h3>
    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
    <div className="flex gap-2 mt-2">
      <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm" />
      <button onClick={handleUpdateName} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Update</button>
    </div>
  </div>

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    // User ke metadata me ye custom settings save kar rahe hain
    const { error } = await supabase.auth.updateUser({
      data: {
        trading_checklist: checklist,
        currency_preference: currency
      }
    });
    setIsSavingProfile(false);
    
    if (error) alert("Error saving profile: " + error.message);
    else alert("Profile updated successfully! ✅");
  };
  // Journal Tab States
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [isEditingJournal, setIsEditingJournal] = useState(false);
  const [journalFormData, setJournalFormData] = useState<any>({});
  const [checklist, setChecklist] = useState([
  'Checked higher timeframe',
  'Risk within limits',
  'Fits my trading plan',
  'Key levels identified',
  'Economic calendar checked'
]);

  const [stats, setStats] = useState({ 
    totalTrades: 0, winRate: 0, netPnl: 0, avgRr: 0,
    avgWin: 0, avgLoss: 0, bestTrade: 0, worstTrade: 0, profitFactor: '0.00',
    topPair: '-', topPairPnl: 0
  });
  const [equityCurve, setEquityCurve] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { 
      router.push('/'); // (Agar '/' par redirect karna hai toh)
      return; 
    }
    setUserId(session.user.id);
    fetchTrades(session.user.id);
    
    // 👇 NAYA: User ka profile data (metadata) fetch karna 👇
    if (session.user.user_metadata) {
      if (session.user.user_metadata.trading_checklist) {
        setChecklist(session.user.user_metadata.trading_checklist);
      }
      if (session.user.user_metadata.currency_preference) {
        setCurrency(session.user.user_metadata.currency_preference);
      }
    }
  };

  const fetchTrades = async (uid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('user_journal')
      .select('*')
      .eq('user_id', uid)
      .order('trade_date', { ascending: false });

    if (data) {
      setTrades(data);
      calculateStats(data);
    }
    setIsLoading(false);
  };

  const calculateStats = (data: any[]) => {
    if (data.length === 0) {
      setStats({ 
        totalTrades: 0, winRate: 0, netPnl: 0, avgRr: 0,
        avgWin: 0, avgLoss: 0, bestTrade: 0, worstTrade: 0, profitFactor: '0.00',
        topPair: '-', topPairPnl: 0
      });
      setEquityCurve([]);
      return;
    }
    
    const total = data.length;
    const wins = data.filter(t => t.result === 'WIN').length;
    const winningTrades = data.filter(t => Number(t.pnl) > 0);
    const losingTrades = data.filter(t => Number(t.pnl) < 0);
    
    const pnl = data.reduce((acc, curr) => acc + Number(curr.pnl), 0);
    const rrSum = data.reduce((acc, curr) => acc + Number(curr.risk_reward || 0), 0);
    const grossProfit = winningTrades.reduce((sum, t) => sum + Number(t.pnl), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + Number(t.pnl), 0));

    // Top Performer Calculate (Kisme sabse zyada profit hua)
    const pairData: {[key: string]: number} = {};
    data.forEach(t => {
      pairData[t.pair] = (pairData[t.pair] || 0) + Number(t.pnl);
    });
    const topPairEntry = Object.entries(pairData).sort((a,b) => b[1] - a[1])[0];

    setStats({ 
      totalTrades: total, 
      winRate: Math.round((wins / total) * 100), 
      netPnl: pnl, 
      avgRr: Number((rrSum / total).toFixed(2)),
      avgWin: winningTrades.length ? grossProfit / winningTrades.length : 0,
      avgLoss: losingTrades.length ? grossLoss / losingTrades.length : 0,
      bestTrade: Math.max(...data.map(t => Number(t.pnl))),
      worstTrade: Math.min(...data.map(t => Number(t.pnl))),
      profitFactor: grossLoss === 0 ? (grossProfit > 0 ? '∞' : '0.00') : (grossProfit / grossLoss).toFixed(2),
      topPair: topPairEntry ? topPairEntry[0] : '-',
      topPairPnl: topPairEntry ? topPairEntry[1] : 0
    });

    let runningEquity = 0;
    const curveData = [...data].reverse().map((t, index) => {
      runningEquity += Number(t.pnl);
      return { trade: `Trade ${index+1}`, date: t.trade_date, equity: Number(runningEquity.toFixed(2)) };
    });
    setEquityCurve(curveData);
  };

  const renderMiniCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-1"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTrades = trades.filter(t => t.trade_date === dateStr);
      const dayPnl = dayTrades.reduce((sum, t) => sum + Number(t.pnl), 0);
      
      let bgClass = 'bg-slate-50 border border-slate-100 text-slate-500 hover:border-blue-300';
      if (dayTrades.length > 0) {
        if (dayPnl > 0) bgClass = 'bg-green-100 border border-green-200 text-green-700 font-bold';
        else if (dayPnl < 0) bgClass = 'bg-red-100 border border-red-200 text-red-700 font-bold';
        else bgClass = 'bg-slate-200 border border-slate-300 text-slate-700 font-bold';
      }

      days.push(
        <div key={day} title={dayTrades.length > 0 ? `PnL: $${dayPnl.toFixed(2)}` : 'No trades'} className={`aspect-square flex items-center justify-center rounded text-[10px] sm:text-xs cursor-pointer transition-colors ${bgClass}`}>
          {day}
        </div>
      );
    }
    
    return days;
  };

  const handleInputChange = (e: any) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSaveTrade = async (e: any) => {
    e.preventDefault();
    setIsSaving(true);
    
    const { error } = await supabase.from('user_journal').insert([{
      user_id: userId, 
      ...formData, 
      lot_size: Number(formData.lot_size), 
      entry_price: Number(formData.entry_price), 
      exit_price: Number(formData.exit_price), 
      pnl: Number(formData.pnl), 
      risk_reward: Number(formData.risk_reward)
    }]);

    setIsSaving(false);
    if (!error) {
      setIsModalOpen(false);
      fetchTrades(userId!); 
    } else { 
      alert("Error saving trade: " + error.message); 
    }
  };

  const handleDelete = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this trade?")) {
      await supabase.from('user_journal').delete().eq('id', id);
      fetchTrades(userId!);
    }
  };
  const handleSelectTrade = (trade: any) => {
    setSelectedTrade(trade);
    setJournalFormData(trade); // Edit form ke liye data prepopulate karein
    setIsEditingJournal(false); // Default view mode
  };

  const toggleChecklist = (item: string) => {
    const currentList = journalFormData.execution_checklist || [];
    const updatedList = currentList.includes(item)
      ? currentList.filter((i: string) => i !== item)
      : [...currentList, item];

    setJournalFormData({ ...journalFormData, execution_checklist: updatedList });
  };

  const handleUpdateJournal = async () => {
    if (!selectedTrade) return;
    // Supabase me naye aur purane dono data ko update karna
    const { error } = await supabase
      .from('user_journal')
      .update({
        // Purani fields
        setup_notes: journalFormData.setup_notes,
        exit_price: journalFormData.exit_price ? Number(journalFormData.exit_price) : null,
        risk_reward: journalFormData.risk_reward ? Number(journalFormData.risk_reward) : null,
        
        // Video UI wali fields
        post_trade_notes: journalFormData.post_trade_notes,
        emotions: journalFormData.emotions,
        lessons: journalFormData.lessons,
        tags: journalFormData.tags,
        rating: journalFormData.rating ? Number(journalFormData.rating) : 5,
        execution_checklist: journalFormData.execution_checklist || [],
        
        // Nayi Bug 9 wali fields
        mistake_made: journalFormData.mistake_made,
        worked_well: journalFormData.worked_well,
        didnt_work: journalFormData.didnt_work,
        improve: journalFormData.improve,
        focus_area: journalFormData.focus_area
      })
      .eq('id', selectedTrade.id);

    if (!error) {
      // Dashboard data refresh karein (taki main list me update dikhe)
      if (userId) fetchTrades(userId);
      
      // Right tab me selected trade ka UI turant update karne ke liye naya data set karein
      setSelectedTrade({ ...selectedTrade, ...journalFormData });
      
      // Agar aapne edit mode toggle use kiya hai toh use band karne ke liye (optional)
      if (typeof setIsEditingJournal === 'function') {
        setIsEditingJournal(false);
      }
      
      alert("Journal saved successfully! ✅");
    } else {
      alert("Error updating journal: " + error.message);
    }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };


  // 🟢 CUSTOM LOGO LOADING SCREEN
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Logo with smooth pulse animation */}
          <img 
            src="/logo3.png" // Agar file ka naam logo3.png rakha tha toh yahan logo3.png kar dein
            alt="Minitrade Loading..." 
            className="w-16 h-16 object-contain animate-pulse" 
          />
          {/* Optional loading text */}
          <span className="text-slate-400 text-sm font-bold tracking-widest uppercase animate-pulse">
            Loading...
          </span>
        </div>
      </div>
    );
  }
  // Time Filter Logic for Performance Tab
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
      return true; // All Time
    });
  };

  const perfTrades = getFilteredPerformanceTrades();
  
  
  // ... (Apne baki metrics ko trades.filter ki jagah perfTrades.filter kar dein)
  // --- PERFORMANCE TAB CALCULATIONS ---
  const winRateDecimal = stats.winRate / 100;
  const lossRateDecimal = 1 - winRateDecimal;
  const expectancy = (winRateDecimal * stats.avgWin) - (lossRateDecimal * Math.abs(stats.avgLoss));

  const longTrades = trades.filter(t => t.direction === 'LONG');
  const shortTrades = trades.filter(t => t.direction === 'SHORT');
  
  const longPnl = longTrades.reduce((acc, t) => acc + Number(t.pnl), 0);
  const shortPnl = shortTrades.reduce((acc, t) => acc + Number(t.pnl), 0);
  
  const longWinRate = longTrades.length ? Math.round((longTrades.filter(t => t.result === 'WIN').length / longTrades.length) * 100) : 0;
  const shortWinRate = shortTrades.length ? Math.round((shortTrades.filter(t => t.result === 'WIN').length / shortTrades.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex overflow-hidden">
      
      {/* 🟢 SIDEBAR */}
      {/* 📱 MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* 🟢 SIDEBAR (Responsive Slide-in) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-slate-200 flex flex-col h-screen transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center">
            <img 
              src="/logo3.png" 
              alt="Minitrade Logo" 
              className="h-10 w-auto sm:h-9 object-contain" 
            />
          </div>
          {/* Mobile close button */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100">
          <div 
            onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} 
            className={`cursor-pointer rounded-xl transition-all ${activeTab === 'profile' ? 'ring-2 ring-blue-400 shadow-sm' : 'hover:opacity-80'}`}
            title="View Profile"
          >
            <UserProfileSidebar />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 mt-2">Menu</p>
          
          <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <LayoutDashboard className="w-4 h-4"/> Dashboard
          </button>
          
          <button onClick={() => { setActiveTab('trades'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'trades' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <List className="w-4 h-4"/> Trades
          </button>
          
          <button onClick={() => { setActiveTab('journal'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'journal' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <BookOpen className="w-4 h-4"/> Journal
          </button>

          <div>
            <button onClick={() => setIsAnalysisOpen(!isAnalysisOpen)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'performance' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <div className="flex items-center gap-3"><BarChart2 className="w-4 h-4"/> Analysis</div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isAnalysisOpen ? 'rotate-180' : ''}`}/>
            </button>
            {isAnalysisOpen && (
              <div className="pl-10 pr-3 py-1 space-y-1">
                <button onClick={() => { setActiveTab('performance'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 text-sm ${activeTab === 'performance' ? 'text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-900'}`}>Performance</button>
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100">
             Logout
           </button>
        </div>
      </aside>

      {/* 🟢 MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu for Mobile */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            
            <h1 className="text-lg md:text-xl font-bold text-slate-800 capitalize">
              {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'trades' ? 'Trades' : activeTab === 'journal' ? 'Journal' : activeTab === 'profile' ? 'Profile' : 'Analysis'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4"/> Add Trade
            </button>
          </div>
        </header>


        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
          
          {/* 📊 TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300 pb-10">
              
              {/* ROW 1: Top 4 Main Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-semibold text-slate-500 uppercase">Total P&L</p>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Total</span>
                  </div>
                  <h3 className={`text-3xl font-bold mb-1 ${stats.netPnl >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                    {stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toFixed(2)}
                  </h3>
                  <p className="text-xs text-slate-400">{stats.totalTrades} Trades</p>
                </div>
                
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-2"><p className="text-sm font-semibold text-slate-500 uppercase">Realized</p></div>
                  <h3 className={`text-3xl font-bold mb-1 ${stats.netPnl >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                    {stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toFixed(2)}
                  </h3>
                  <p className="text-xs text-slate-400">{stats.totalTrades} trades</p>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-2"><p className="text-sm font-semibold text-slate-500 uppercase">Win Rate</p></div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.winRate}%</h3>
                </div>
              </div>

              {/* ROW 2: Chart & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Performance Chart / Overview */}
                <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-sm min-h-[300px] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-slate-700">Performance Overview</h4>
                  </div>
                  <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <h2 className={`text-5xl font-bold ${stats.netPnl >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
                      {stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toFixed(2)}
                    </h2>
                  </div>
                </div>

                {/* Recent Activity (Last 5 Trades) */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col max-h-[300px]">
                  <h4 className="font-semibold text-slate-700 mb-4 flex justify-between items-center">
                    Recent Activity <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Last 5</span>
                  </h4>
                  <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                    {trades.slice(0, 5).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Clock className="w-8 h-8 mb-2 opacity-50"/>
                        <p className="text-sm font-medium">No recent trades</p>
                      </div>
                    ) : (
                      trades.slice(0, 5).map(trade => (
                        <div key={trade.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{trade.pair} <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${trade.direction === 'LONG' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{trade.direction}</span></p>
                            <p className="text-[10px] text-slate-400 font-medium">{trade.trade_date}</p>
                          </div>
                          <span className={`font-mono font-bold text-sm ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trade.pnl >= 0 ? '+' : ''}${Number(trade.pnl).toFixed(2)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ROW 3: Quick Stats, Top Performer, Monthly Calendar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Quick Stats Grid */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500"/> Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Win</p>
                      <p className="text-sm font-bold text-green-600">${stats.avgWin.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Loss</p>
                      <p className="text-sm font-bold text-red-600">${stats.avgLoss.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Best Trade</p>
                      <p className="text-sm font-bold text-blue-600">${stats.bestTrade.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Worst Trade</p>
                      <p className="text-sm font-bold text-orange-600">${stats.worstTrade.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Profit Factor</p>
                      <p className={`text-base font-bold ${Number(stats.profitFactor) > 1 ? 'text-green-600' : 'text-red-600'}`}>{stats.profitFactor}</p>
                    </div>
                  </div>
                </div>

                {/* Top Performer Card */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col">
                  <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500"/> Top Performer</h4>
                  <div className="flex-1 flex flex-col items-center justify-center bg-amber-50/50 border border-amber-100 rounded-lg p-4 text-center">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Best Pair</p>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">{stats.topPair}</h2>
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                      <TrendingUp className="w-4 h-4"/> +${stats.topPairPnl.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Monthly P&L Calendar */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-indigo-500"/> This Month</h4>
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <div key={i} className="text-center text-[10px] font-bold text-slate-400">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {renderMiniCalendar()}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 📝 TAB 2: TRADES (Ledger) */}
          {activeTab === 'trades' && (
            <div className="max-w-[1400px] mx-auto animate-in fade-in duration-300">
              
              {/* Table Header Controls */}
              <div className="bg-white border border-slate-200 p-4 rounded-t-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col">
                  <h3 className="font-bold text-slate-800 text-lg">Trade History</h3>
                  <span className="text-slate-400 text-xs font-medium">Showing {filteredTrades.length} of {trades.length} trades</span>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Search Box */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search pair (e.g. XAUUSD)" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                  
                  {/* Add Trade Button */}
                  <button onClick={() => setIsModalOpen(true)} className="hidden sm:flex px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors items-center gap-2 shadow-sm whitespace-nowrap">
                    <Plus className="w-4 h-4"/> Add Trade
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white border-x border-b border-slate-200 rounded-b-xl overflow-x-auto shadow-sm">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                      <th className="px-6 py-4">DATE</th>
                      <th className="px-6 py-4">SYMBOL</th>
                      <th className="px-6 py-4">DIRECTION</th>
                      <th className="px-6 py-4">ENTRY / EXIT</th>
                      <th className="px-6 py-4">RESULT</th>
                      <th className="px-6 py-4 text-right">NET P&L</th>
                      <th className="px-6 py-4 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTrades.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-16 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <Search className="w-10 h-10 mb-3 opacity-20" />
                            <p className="font-medium">No trades found.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTrades.map(trade => (
                        <tr key={trade.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 text-slate-500 font-medium text-xs">{trade.trade_date}</td>
                          <td className="px-6 py-4 font-bold text-slate-800">{trade.pair}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${trade.direction === 'LONG' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                              {trade.direction === 'LONG' ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>} {trade.direction}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-slate-700 font-medium">{trade.entry_price || '-'}</span>
                              <span className="text-[10px] text-slate-400">→ {trade.exit_price || '-'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${trade.result === 'WIN' ? 'bg-green-100 text-green-700' : trade.result === 'LOSS' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                              {trade.result}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-right font-mono font-bold text-base ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trade.pnl >= 0 ? '+' : ''}${Number(trade.pnl).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => handleDelete(trade.id)} 
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete Trade"
                            >
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 📊 TAB 3: PERFORMANCE / ANALYSIS */}
          {activeTab === 'performance' && (
            <div className="max-w-[1400px] mx-auto animate-in fade-in duration-300 space-y-6 pb-10">
              
              {/* Date Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All Time', 'This Year', '90 Days', '30 Days', '7 Days'].map((f) => (
                  <button 
                    key={f} 
                    onClick={() => setPerfTimeFilter(f)} 
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${perfTimeFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Top Metrics: Profit Factor & Expectancy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-center items-center text-center">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Profit Factor</h4>
                  <h2 className={`text-4xl font-black mb-1 ${Number(stats.profitFactor) > 1 ? 'text-green-600' : Number(stats.profitFactor) === 0 ? 'text-slate-800' : 'text-red-600'}`}>
                    {stats.profitFactor}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{Number(stats.profitFactor) > 1 ? 'Profitable System' : 'Needs Work'}</p>
                </div>
                
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-center items-center text-center">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Expectancy</h4>
                  <h2 className={`text-4xl font-black mb-1 ${expectancy > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {expectancy > 0 ? '+' : ''}${expectancy.toFixed(2)}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Average P&L per trade</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Quick Stats Grid */}
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500"/> Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avg Win</p>
                      <p className="text-lg font-black text-green-600">${stats.avgWin.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avg Loss</p>
                      <p className="text-lg font-black text-red-600">${stats.avgLoss.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Best Trade</p>
                      <p className="text-lg font-black text-blue-600">${stats.bestTrade.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Worst Trade</p>
                      <p className="text-lg font-black text-orange-600">${stats.worstTrade.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Equity Curve (Spans 2 columns) */}
                <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-bold text-slate-800">Equity Curve</h4>
                      <p className="text-xs font-medium text-slate-500">Cumulative P&L progression over time</p>
                    </div>
                    <div className="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                      <button className="px-3 py-1 text-xs font-bold bg-white text-blue-600 rounded shadow-sm">Equity</button>
                      <button className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700">Drawdown</button>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-h-[250px] w-full">
                    {equityCurve.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="trade" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                            itemStyle={{ color: '#0f172a' }}
                          />
                          <Area type="monotone" dataKey="equity" stroke="#2563eb" strokeWidth={3} fill="url(#colorBlue)" activeDot={{ r: 6, strokeWidth: 0 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <LineChart className="w-8 h-8 mb-2 opacity-30"/>
                        <span className="font-bold text-sm">Add trades to generate equity curve</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Long vs Short Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Target className="w-4 h-4 text-purple-500"/> Long vs Short</h4>
                  
                  <div className="space-y-4">
                    {/* Long Stats */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><TrendingUp className="w-5 h-5"/></div>
                        <div>
                          <p className="font-bold text-slate-800">Long Positions</p>
                          <p className="text-xs font-medium text-slate-500">{longTrades.length} trades</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono font-black text-lg ${longPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{longPnl >= 0 ? '+' : ''}${longPnl.toFixed(2)}</p>
                        <p className="text-xs font-bold text-slate-400">{longWinRate}% Win Rate</p>
                      </div>
                    </div>

                    {/* Short Stats */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><TrendingDown className="w-5 h-5"/></div>
                        <div>
                          <p className="font-bold text-slate-800">Short Positions</p>
                          <p className="text-xs font-medium text-slate-500">{shortTrades.length} trades</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono font-black text-lg ${shortPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{shortPnl >= 0 ? '+' : ''}${shortPnl.toFixed(2)}</p>
                        <p className="text-xs font-bold text-slate-400">{shortWinRate}% Win Rate</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col">
                  <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500"/> Top Symbols</h4>
                  {stats.topPair !== '-' ? (
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center font-black text-xs">#1</div>
                          <div>
                            <p className="font-black text-slate-800 text-lg">{stats.topPair}</p>
                            <p className="text-xs font-bold text-amber-600">Most Profitable</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-black text-xl text-green-600">+${stats.topPairPnl.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                      <BarChart2 className="w-8 h-8 mb-2 opacity-30"/>
                      <span className="font-medium text-sm">No symbol data yet</span>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          )}

          {/* 📓 TAB 4: JOURNAL */}
          {activeTab === 'journal' && (
            <div className="max-w-[1400px] mx-auto animate-in fade-in duration-300 flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 pb-6">
              
              {/* Left Column: Trade List (Hides on Mobile when trade is selected) */}
              <div className={`w-full lg:w-1/3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden h-full ${selectedTrade ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-100 flex flex-col gap-3 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-600"/> Trade Journal</h3>
                  </div>
                  {/* Journal Filters */}
                  <div className="flex gap-2 bg-slate-200 p-1 rounded-lg">
                    {['All', 'Journaled', 'Pending'].map(f => (
                      <button 
                        key={f} 
                        onClick={() => setJournalFilter(f)} 
                        className={`flex-1 py-1 text-xs font-bold rounded shadow-sm transition-all ${journalFilter === f ? 'bg-white text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
                  {trades.filter(t => {
                    if (journalFilter === 'Pending') return !t.post_trade_notes;
                    if (journalFilter === 'Journaled') return t.post_trade_notes;
                    return true;
                  }).map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => handleSelectTrade(t)}
                      className="p-4 border border-slate-200 bg-white rounded-xl cursor-pointer hover:border-blue-300"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">{t.pair}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${t.post_trade_notes ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {t.post_trade_notes ? 'Journaled' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{t.trade_date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Detailed View (Shows on Mobile when trade is selected) */}
              <div className={`flex-1 bg-slate-50 border border-slate-200 rounded-xl shadow-sm flex-col h-full overflow-hidden relative ${!selectedTrade ? 'hidden lg:flex' : 'flex'}`}>
                {!selectedTrade ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                    <BookOpen className="w-16 h-16 text-slate-300 mb-4"/>
                    <h3 className="text-xl font-bold text-slate-700">Select a trade</h3>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col h-full">
                    <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex justify-between items-center shadow-sm z-10">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedTrade(null)} className="lg:hidden p-2 bg-slate-100 rounded-lg text-slate-600">
                           <X className="w-4 h-4"/> {/* Back button for mobile */}
                        </button>
                        <h2 className="text-xl font-black text-slate-800">{selectedTrade.pair}</h2>
                      </div>
                      <button onClick={handleUpdateJournal} className="px-6 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-md">
                        Save
                      </button>
                    </div>

                    <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                      {/* Old Fields */}
                      <textarea value={journalFormData.setup_notes || ''} onChange={(e) => setJournalFormData({...journalFormData, setup_notes: e.target.value})} className="w-full min-h-[80px] p-3 border rounded-lg" placeholder="Pre-Trade Analysis..."/>
                      <textarea value={journalFormData.post_trade_notes || ''} onChange={(e) => setJournalFormData({...journalFormData, post_trade_notes: e.target.value})} className="w-full min-h-[80px] p-3 border rounded-lg" placeholder="Post-Trade Review..."/>
                      
                      {/* NEW FIELDS (Bug 9) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-4">
                            <textarea value={journalFormData.mistake_made || ''} onChange={(e) => setJournalFormData({...journalFormData, mistake_made: e.target.value})} className="w-full min-h-[80px] p-3 border border-red-200 bg-red-50 focus:bg-white rounded-lg text-sm" placeholder="🚨 Mistake Made..."/>
                            <textarea value={journalFormData.worked_well || ''} onChange={(e) => setJournalFormData({...journalFormData, worked_well: e.target.value})} className="w-full min-h-[80px] p-3 border border-green-200 bg-green-50 focus:bg-white rounded-lg text-sm" placeholder="✅ What Worked Well..."/>
                            <textarea value={journalFormData.didnt_work || ''} onChange={(e) => setJournalFormData({...journalFormData, didnt_work: e.target.value})} className="w-full min-h-[80px] p-3 border border-orange-200 bg-orange-50 focus:bg-white rounded-lg text-sm" placeholder="❌ What Didn't Work..."/>
                         </div>
                         <div className="space-y-4">
                            <textarea value={journalFormData.improve || ''} onChange={(e) => setJournalFormData({...journalFormData, improve: e.target.value})} className="w-full min-h-[80px] p-3 border border-blue-200 bg-blue-50 focus:bg-white rounded-lg text-sm" placeholder="📈 What To Improve..."/>
                            <textarea value={journalFormData.focus_area || ''} onChange={(e) => setJournalFormData({...journalFormData, focus_area: e.target.value})} className="w-full min-h-[80px] p-3 border border-purple-200 bg-purple-50 focus:bg-white rounded-lg text-sm" placeholder="🎯 Focus Area For Next Trade..."/>
                         </div>
                      </div>

                      {/* EXECUTION CHECKLIST (Bug 5 Fixed) */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Execution Checklist</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          {['Checked higher timeframe', 'Fits my trading plan', 'Economic calendar checked', 'Risk within limits', 'Key levels identified'].map(item => (
                            <div key={item} className="flex items-center gap-3 p-3 bg-slate-50 border rounded-lg cursor-pointer" onClick={() => toggleChecklist(item)}>
                              <input 
                                type="checkbox" 
                                checked={(journalFormData.execution_checklist || []).includes(item)}
                                readOnly
                                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                              />
                              <span className="text-sm font-medium text-slate-700">{item}</span>
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
            <div className="max-w-[1000px] mx-auto animate-in fade-in duration-300 space-y-6 pb-12">
              
              <div className="flex justify-between items-center bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Profile & Settings</h2>
                  <p className="text-sm text-slate-500">Manage your trading rules and application preferences.</p>
                </div>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  <Save className="w-4 h-4"/> {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Banners */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-4">
                  <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-600 h-fit"><Sparkles className="w-6 h-6"/></div>
                  <div>
                    <h3 className="text-indigo-900 font-bold text-lg">AI-Powered Trading Reports</h3>
                    <p className="text-indigo-700 text-sm">Get personalized insights and analysis based on your trading patterns.</p>
                  </div>
                </div>
                <button className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2">
                  <Cpu className="w-4 h-4"/> Upgrade to Pro
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pre-Trade Checklist (Dynamic) */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">Pre-Trade Checklist</h3>
                      <p className="text-sm text-slate-500">Define up to 10 rules. These will be auto-applied to your Add Trade form.</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{checklist.length}/10 Items</span>
                    <button onClick={() => setChecklist([])} className="text-xs font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors"><RefreshCw className="w-3 h-3"/> Clear All</button>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto mb-4">
                    {checklist.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4 italic">No items in your checklist.</p>
                    ) : (
                      checklist.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg group border border-transparent transition-colors">
                          <Circle className="w-4 h-4 text-blue-400 shrink-0" strokeWidth={3}/>
                          <span className="text-sm text-slate-700 font-medium flex-1">{item}</span>
                          <button onClick={() => handleRemoveChecklist(index)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"><X className="w-4 h-4"/></button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add New Item Input */}
                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <input 
                      type="text" 
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                      placeholder="E.g. Trend is in my favor..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button onClick={handleAddChecklist} disabled={checklist.length >= 10 || !newChecklistItem.trim()} className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
                      <Plus className="w-4 h-4"/>
                    </button>
                  </div>
                </div>

                {/* Settings & Rules */}
                <div className="space-y-6">
                  {/* Display Settings */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-1">Display Settings</h3>
                    <p className="text-sm text-slate-500 mb-6">Your preferred currency for calculating P&L.</p>
                    
                    <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
                      <div className="bg-blue-50 p-3 rounded-full text-blue-600"><DollarSign className="w-5 h-5"/></div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Base Currency</p>
                        <select 
                          value={currency} 
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                        >
                          <option value="USD">USD ($) - US Dollar</option>
                          <option value="EUR">EUR (€) - Euro</option>
                          <option value="GBP">GBP (£) - British Pound</option>
                          <option value="INR">INR (₹) - Indian Rupee</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Trading Rules Placeholder */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-1">Trading Rules</h3>
                    <p className="text-sm text-slate-500 mb-6">Set your hard limits and risk parameters.</p>
                    
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <Scale className="w-8 h-8 text-slate-300 mb-2" strokeWidth={1.5}/>
                      <h4 className="font-semibold text-slate-700 text-sm mb-1">No trading rules configured</h4>
                      <p className="text-xs text-slate-500">Coming soon in the next update</p>
                    </div>
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
          userChecklist={checklist} // <-- YE NAYI LINE ADD KAREIN
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
             setIsModalOpen(false);
             fetchTrades(userId);
          }} 
        />
      )}
    </div>
  );
}