"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import LandingPage from '../components/LandingPage';
import DashboardApp from '../components/DashboardApp';
import { Activity } from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. App load hote hi current session check karo
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 2. Auth state me koi bhi change ho (Login/Logout), usey turant pakdo
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Jab tak check ho raha hai, loading spinner dikhao
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-center text-blue-600">
        <Activity className="animate-spin w-10 h-10" />
      </div>
    );
  }

  // Agar session hai (user logged in hai), toh Dashboard dikhao
  if (session) {
    return <DashboardApp />;
  }

  // Warna default Landing Page dikhao
  return <LandingPage />;
}