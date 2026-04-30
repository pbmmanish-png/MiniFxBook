"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, User, Target, Sun, Moon, CheckCircle, BarChart2 } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // 🌙 Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // States for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [experience, setExperience] = useState('Beginner');
  
  // States for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Load theme from local storage
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('minitrade-theme');
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('minitrade-theme', newTheme ? 'dark' : 'light');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        setMessage('Password reset link sent! Please check your email.');
        
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
        
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, experience_level: experience },
            emailRedirectTo: `${window.location.origin}/verified`
          }
        });
        if (error) throw error;
        
        if (data.session) {
          router.push('/dashboard');
        } else {
          setMessage('Registration successful! Please check your email to verify your account.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  // Render nothing until mounted to avoid hydration errors with theme
  if (!mounted) return null;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#030712] font-sans selection:bg-blue-100 dark:selection:bg-blue-500/30 transition-colors duration-500 relative overflow-hidden">
        
        {/* 🌟 THEME TOGGLE BUTTON (Absolute Top Right) */}
        <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50">
          <button onClick={toggleTheme} className="p-2 md:p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full transition-all shadow-sm backdrop-blur-md">
            {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
        </div>

        {/* 🎨 LEFT PANEL (Visible only on PC) - Fills the empty space */}
        <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-slate-50 dark:bg-[#0A0A0B] border-r border-slate-200 dark:border-white/5 flex-col justify-between p-12 xl:p-16 relative overflow-hidden transition-colors duration-500">
          {/* Background Gradient */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

          <div className="relative z-10">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <img src="/logo3.png" alt="Minitrade Logo" className="h-10 xl:h-12 object-contain dark:brightness-0 dark:invert transition-all" />
            </Link>
          </div>

          <div className="relative z-10 max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
              Master your psychology. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Discover your edge.</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10">
              The institutional-grade journaling platform designed to eliminate emotional bias and scale your profitability.
            </p>

            <div className="space-y-5">
              {[
                { icon: BarChart2, text: 'Advanced performance analytics & equity curves' },
                { icon: CheckCircle, text: 'Custom pre-trade execution checklists' },
                { icon: Target, text: 'Deep psychological & emotion tracking' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm transition-colors">
                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()} Minitrade.ai Platform</p>
          </div>
        </div>

        {/* 🔐 RIGHT PANEL (Auth Form) */}
        <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 transition-colors duration-500">
          
          <div className="w-full max-w-[400px]">
            
            {/* Mobile Only Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/">
                <img src="/logo3.png" alt="Minitrade Logo" className="h-12 sm:h-14 object-contain dark:brightness-0 dark:invert transition-all" />
              </Link>
            </div>

            <div className="text-center lg:text-left mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
                {isForgotPassword ? 'Reset password' : isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              
              {!isForgotPassword && (
                <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }} 
                    className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors underline underline-offset-2"
                  >
                    {isLogin ? 'Sign up for free' : 'Log in here'}
                  </button>
                </p>
              )}
            </div>

            <div className="bg-white/60 dark:bg-[#12141A]/60 lg:bg-transparent lg:dark:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none py-6 px-5 sm:p-8 lg:p-0 shadow-2xl shadow-slate-200/50 lg:shadow-none dark:shadow-none rounded-3xl lg:rounded-none border border-slate-200 lg:border-transparent dark:border-white/10 lg:dark:border-transparent transition-colors duration-500">
              <form className="space-y-4 sm:space-y-5" onSubmit={handleAuth}>
                
                {/* Error & Success Messages */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 sm:p-4 rounded-xl flex gap-3 animate-in fade-in transition-colors">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"/>
                    <p className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}
                {message && (
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 sm:p-4 rounded-xl flex gap-3 animate-in fade-in transition-colors">
                    <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300">{message}</p>
                  </div>
                )}

                {/* Extra Fields for Sign Up */}
                {!isLogin && !isForgotPassword && (
                  <>
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 transition-colors">Full Name</label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          required={!isLogin && !isForgotPassword}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="block w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 transition-colors">Trading Experience</label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Target className="h-4 w-4 text-slate-400" />
                        </div>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="block w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="Beginner">Beginner (0-1 years)</option>
                          <option value="Intermediate">Intermediate (1-3 years)</option>
                          <option value="Advanced">Advanced (3+ years)</option>
                          <option value="Professional">Professional</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 transition-colors">Email Address</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400"
                      placeholder="trader@example.com"
                    />
                  </div>
                </div>
                
                {/* Password Input */}
                {!isForgotPassword && (
                  <div className="animate-in fade-in">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Password</label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => { setIsForgotPassword(true); setError(null); setMessage(null); }}
                          className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        required={!isForgotPassword}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400"
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-3 sm:pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-3 sm:py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/20 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-[#0A0A0B] disabled:opacity-70 transition-all hover:scale-[1.02]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <>
                        {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'} 
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {isForgotPassword && (
                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(false); setError(null); setMessage(null); }}
                      className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                      &larr; Back to login
                    </button>
                  </div>
                )}
                
              </form>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}