"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Apne supabase client ka path check karein

export default function UserProfileSidebar() {
  const [user, setUser] = useState<{ fullName: string; email: string; initial: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getUserData() {
      // 1. Supabase se current session aur user data fetch karein
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 2. User metadata se 'full_name' aur email extract karein
        const { full_name } = session.user.user_metadata;
        const email = session.user.email || 'user@example.com';
        
        // Agar full name set nahi hai (optional), fallback user name ke liye email use karein
        const displayName = full_name || email.split('@')[0]; 
        
        setUser({
          fullName: displayName,
          email: email,
          // Avatar ke liye initial letter
          initial: displayName.charAt(0).toUpperCase() || 'U',
        });
      }
      setIsLoading(false);
    }

    getUserData();

    // Auth state changes ko listen karein (jaise logout pe data clear ho)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        getUserData(); // Reload data on new session
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        {/* Spinner ki jagah aapka Pulse karta hua Logo */}
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <img src="/logo3.png" className="w-8 h-8 object-contain animate-pulse" alt="loading" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
          <div className="h-2 w-28 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Data milne par render karein
  if (!user) return null; // Agar user login nahi hai, toh kuch na dikhayein

  return (
    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
      {/* 🟢 AVATAR WITH DYNAMIC INITIAL */}
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg shadow-sm border border-blue-200">
        {user.initial}
      </div>
      
      {/* 🟢 USER INFO (DYAAMIC NAME & EMAIL) */}
      <div className="flex-1 overflow-hidden">
        {/* Real Full Name */}
        <p className="font-semibold text-sm text-slate-800 tracking-tight leading-tight">
          {user.fullName}
        </p>
        
        {/* Real Email */}
        <p className="text-xs text-slate-500 truncate" title={user.email}>
          {user.email}
        </p>
      </div>
    </div>
  );
}