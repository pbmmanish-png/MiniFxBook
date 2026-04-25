import { useState } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FiDollarSign, FiCalendar, FiClock, FiPlus, FiX, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { supabase } from '@/lib/supabase'; // Apna supabase path check karein

interface AddTradeModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userChecklist: string[]; // <-- Ye add karein
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
      checklist: {
        higherTimeframe: true,
        riskLimits: false,
        tradingPlan: false,
        keyLevels: false,
        economicCalendar: false,
      },
    },
  });

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    
    // Form data ko Supabase database columns ke hisab se map karna
    const newTrade = {
      user_id: userId,
      pair: data.symbol.toUpperCase(),
      direction: direction,
      lot_size: Number(data.quantity),
      entry_price: Number(data.entryPrice),
      exit_price: data.exitPrice ? Number(data.exitPrice) : null,
      trade_date: entryDate.toISOString().split('T')[0], // YYYY-MM-DD format
      pnl: Number(data.pnl),
      result: data.result,
      setup_notes: data.notes,
      risk_reward: 0, // Optional or you can add a field later
      mistake: 'None' 
    };

    const { error } = await supabase.from('user_journal').insert([newTrade]);

    setIsSaving(false);
    
    if (error) {
      alert("Error saving trade: " + error.message);
    } else {
      onSuccess(); // Dashboard ko refresh karega
      onClose();   // Modal band karega
    }
  };

  

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col border border-slate-100 overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
              <FiPlus className="text-xl" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Add Trade</h1>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-red-500 bg-slate-50 p-2 rounded-full transition">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <form id="tradeForm" onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 flex-1">
          
          {/* Long / Short Toggle (Jaise image me tha) */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              type="button" 
              onClick={() => setDirection('LONG')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${direction === 'LONG' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FiTrendingUp /> Long
            </button>
            <button 
              type="button" 
              onClick={() => setDirection('SHORT')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${direction === 'SHORT' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FiTrendingDown /> Short
            </button>
          </div>

          {/* Form fields grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 block tracking-wider">SYMBOL</label>
              <input type="text" {...register('symbol')} placeholder="E.G. XAUUSD" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 uppercase text-sm" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 block tracking-wider">QUANTITY (LOTS)</label>
              <input type="number" step="any" {...register('quantity')} placeholder="0" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 text-sm" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 block tracking-wider">ENTRY PRICE</label>
              <input type="number" step="any" {...register('entryPrice')} placeholder="0.00" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 text-sm" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 block tracking-wider">EXIT PRICE</label>
              <input type="number" step="any" {...register('exitPrice')} placeholder="Optional" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 text-sm" />
            </div>

            {/* Date pickers */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 block tracking-wider">ENTRY DATE</label>
              <DatePicker selected={entryDate} onChange={(date: Date | null) => date && setEntryDate(date)} showTimeSelect dateFormat="MMM d, yyyy h:mm aa" customInput={<input type="text" readOnly className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 text-sm cursor-pointer" />} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 block tracking-wider">EXIT DATE</label>
              <DatePicker selected={exitDate} onChange={(date: Date | null) => setExitDate(date)} placeholderText="Optional" showTimeSelect dateFormat="MMM d, yyyy h:mm aa" customInput={<input type="text" readOnly className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 text-sm cursor-pointer" />} />
            </div>

            {/* Dashboard Stats ke liye PnL aur Result zaroori hain */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 block tracking-wider">Net P&L ($)</label>
              <input type="number" step="any" required {...register('pnl')} placeholder="0.00" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 text-sm" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 block tracking-wider">RESULT</label>
              <select {...register('result')} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 text-sm">
                <option value="WIN">WIN ✅</option>
                <option value="LOSS">LOSS ❌</option>
                <option value="BREAKEVEN">BREAKEVEN ⚪</option>
              </select>
            </div>
          </div>

          {/* Dynamic Checklist Panel */}
          {userChecklist && userChecklist.length > 0 && (
            <div className="mb-6 border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-widest">Pre-Trade Checklist (Optional)</h2>
              <div className="space-y-3">
                {userChecklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <input 
                      type="checkbox" 
                      id={`chk-${index}`} 
                      {...register(`checklist.item_${index}` as any)} 
                      className="w-5 h-5 accent-blue-600 rounded border-slate-300 focus:ring-blue-300 cursor-pointer" 
                    />
                    <label 
                      htmlFor={`chk-${index}`} 
                      className="text-sm font-medium text-slate-600 cursor-pointer group-hover:text-slate-900 transition-colors"
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="mb-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 block tracking-wider">NOTES</label>
            <textarea {...register('notes')} rows={3} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 text-sm" placeholder="Trade rationale, entry/exit notes..."></textarea>
          </div>
        </form>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-white shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition text-sm">
            Cancel
          </button>
          <button form="tradeForm" type="submit" disabled={isSaving} className="px-10 py-2.5 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition text-sm disabled:opacity-70">
            {isSaving ? 'Saving...' : 'Save Trade'}
          </button>
        </div>
      </div>
    </div>
  );
}