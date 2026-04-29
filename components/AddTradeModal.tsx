"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ArrowRight } from 'lucide-react';
import { FiDollarSign, FiCalendar, FiClock, FiPlus, FiX, FiTrendingUp, FiTrendingDown, FiCheckSquare } from 'react-icons/fi';
import { supabase } from '@/lib/supabase'; // Apna supabase path check karein

interface AddTradeModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userChecklist: string[];
}

export default function AddTradeModal({ onClose, onSuccess, userId, userChecklist }: AddTradeModalProps) {
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [exitDate, setExitDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit } = useForm({
    defaultValues: {
      symbol: 'XAUUSD',
      quantity: 0,
      entryPrice: 0.00,
      exitPrice: '',
      pnl: 0,
      result: 'WIN',
      notes: '',
      checklist: {},
    },
  });

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    
    const newTrade = {
      user_id: userId,
      pair: data.symbol.toUpperCase(),
      direction: direction,
      lot_size: Number(data.quantity),
      entry_price: Number(data.entryPrice),
      exit_price: data.exitPrice ? Number(data.exitPrice) : null,
      trade_date: entryDate.toISOString().split('T')[0],
      pnl: Number(data.pnl),
      result: data.result,
      setup_notes: data.notes,
      risk_reward: 0,
      mistake: 'None' 
    };

    const { error } = await supabase.from('user_journal').insert([newTrade]);

    setIsSaving(false);
    
    if (error) {
      alert("Error saving trade: " + error.message);
    } else {
      onSuccess();
      onClose();
    }
  };

  // Common Input Class to maintain consistency
  const inputClassName = "w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:ring-blue-500/30 outline-none font-bold text-slate-800 dark:text-white text-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600";
  const labelClassName = "text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block tracking-widest";

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-[#030712]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      
      {/* 🚀 MODAL CARD */}
      <div className="relative bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-3xl max-h-[95vh] flex flex-col border border-slate-200 dark:border-white/10 overflow-hidden transition-colors duration-500">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <FiPlus className="text-xl" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Log Execution</h1>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 p-2.5 rounded-full transition-all"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <form id="tradeForm" onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 md:p-8 flex-1 custom-scrollbar">
          
          {/* Long / Short Toggle */}
          <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl mb-8">
            <button 
              type="button" 
              onClick={() => setDirection('LONG')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${direction === 'LONG' ? 'bg-white dark:bg-[#12141A] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <FiTrendingUp className="text-lg"/> Long Position
            </button>
            <button 
              type="button" 
              onClick={() => setDirection('SHORT')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${direction === 'SHORT' ? 'bg-white dark:bg-[#12141A] text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200/50 dark:border-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <FiTrendingDown className="text-lg"/> Short Position
            </button>
          </div>

          {/* Form fields grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label className={labelClassName}>Symbol</label>
              <input type="text" {...register('symbol')} placeholder="E.G. XAUUSD" className={`${inputClassName} uppercase`} />
            </div>
            <div>
              <label className={labelClassName}>Quantity (Lots)</label>
              <input type="number" step="any" {...register('quantity')} placeholder="0.00" className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Entry Price</label>
              <input type="number" step="any" {...register('entryPrice')} placeholder="0.0000" className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Exit Price</label>
              <input type="number" step="any" {...register('exitPrice')} placeholder="Optional" className={inputClassName} />
            </div>

            {/* Date pickers */}
            <div>
              <label className={labelClassName}>Entry Date & Time</label>
              <DatePicker 
                selected={entryDate} 
                onChange={(date: Date | null) => date && setEntryDate(date)} 
                showTimeSelect 
                dateFormat="MMM d, yyyy h:mm aa" 
                customInput={<input type="text" readOnly className={`${inputClassName} cursor-pointer`} />} 
              />
            </div>
            <div>
              <label className={labelClassName}>Exit Date & Time</label>
              <DatePicker 
                selected={exitDate} 
                onChange={(date: Date | null) => setExitDate(date)} 
                placeholderText="Optional" 
                showTimeSelect 
                dateFormat="MMM d, yyyy h:mm aa" 
                customInput={<input type="text" readOnly className={`${inputClassName} cursor-pointer`} />} 
              />
            </div>

            {/* Dashboard Stats Fields */}
            <div>
              <label className={labelClassName}>Net P&L ($)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiDollarSign className="text-slate-400 dark:text-slate-500" />
                </div>
                <input type="number" step="any" required {...register('pnl')} placeholder="0.00" className={`${inputClassName} pl-10`} />
              </div>
            </div>
            <div>
              <label className={labelClassName}>Result</label>
              <select {...register('result')} className={`${inputClassName} appearance-none cursor-pointer`}>
                <option value="WIN">Winner 🎯</option>
                <option value="LOSS">Loss ❌</option>
                <option value="BREAKEVEN">Break-even ⚪</option>
              </select>
            </div>
          </div>

          {/* Dynamic Checklist Panel */}
          {userChecklist && userChecklist.length > 0 && (
            <div className="mb-8 border border-slate-200 dark:border-white/10 rounded-2xl p-6 bg-slate-50/50 dark:bg-white/[0.02]">
              <h2 className="text-xs font-bold text-slate-800 dark:text-white mb-5 uppercase tracking-widest flex items-center gap-2">
                <FiCheckSquare className="text-blue-500"/> Pre-Trade Checklist
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userChecklist.map((item, index) => (
                  <label key={index} className="flex items-start gap-3 group cursor-pointer p-2 hover:bg-white dark:hover:bg-white/5 rounded-lg transition-colors">
                    <input 
                      type="checkbox" 
                      {...register(`checklist.item_${index}` as any)} 
                      className="mt-0.5 w-4 h-4 accent-blue-600 rounded border-slate-300 dark:border-slate-600 cursor-pointer" 
                    />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="mb-2">
            <label className={labelClassName}>Trade Rationale & Notes</label>
            <textarea 
              {...register('notes')} 
              rows={3} 
              className={`${inputClassName} resize-none`} 
              placeholder="Why did you take this trade? Any specific observations..."
            ></textarea>
          </div>
        </form>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 shrink-0 transition-colors">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-3 text-slate-700 dark:text-slate-300 font-bold bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 transition-all text-sm"
          >
            Cancel
          </button>
          <button 
            form="tradeForm" 
            type="submit" 
            disabled={isSaving} 
            className="px-8 py-3 text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isSaving ? (
              <>Saving Data...</>
            ) : (
              <>Save Execution <ArrowRight className="w-4 h-4"/></>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
}