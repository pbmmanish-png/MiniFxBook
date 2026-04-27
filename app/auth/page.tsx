"use client";

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Mail, Lock, ArrowRight, AlertCircle, Loader2, User, Target } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Nayi state forgot password ke liye
  
  // States for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [experience, setExperience] = useState('Beginner');
  
  // States for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isForgotPassword) {
        // Handle Forgot Password
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          // Redirect URL setup (apne project ka live URL ya localhost yahan dal sakte hain)
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        
        setMessage('Password reset link sent! Please check your email.');
        
      } else if (isLogin) {
        // Handle Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Login successful, redirect to dashboard
        router.push('/');
        
      } else {
        // Handle Sign Up with Extra User Details (Metadata)
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              experience_level: experience
            }
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
          {/* Logo updated to use image instead of icon (Bug 8 Fix applied here as well) */}
          <img src="/logo3.png" alt="Minitrade Logo" className="w-8 h-8 object-contain" />
          <span className="text-3xl font-bold tracking-tight text-slate-900">
            MiniFxBook<span className="text-blue-600 font-black">+</span>
          </span>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {isForgotPassword 
            ? 'Reset your password' 
            : isLogin 
              ? 'Sign in to your account' 
              : 'Start your trading journey'}
        </h2>
        
        {/* Hide Signup/Login toggle when in Forgot Password mode */}
        {!isForgotPassword && (
          <p className="mt-2 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }} 
              className="font-bold text-blue-600 hover:text-blue-500 transition-colors"
            >
              {isLogin ? 'Sign up for free' : 'Log in here'}
            </button>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleAuth}>
            
            {/* Error & Success Messages */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0"/>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {message && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md animate-in fade-in">
                <p className="text-sm text-green-700 font-medium">{message}</p>
              </div>
            )}

            {/* Extra Fields (Only show when Signing Up AND not in forgot password mode) */}
            {!isLogin && !isForgotPassword && (
              <>
                {/* Full Name Input */}
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required={!isLogin && !isForgotPassword}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 bg-slate-50 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Experience Level Dropdown */}
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Trading Experience</label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Target className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 bg-slate-50 outline-none transition-all appearance-none"
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

            {/* Email Input (Always Visible) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email address</label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 bg-slate-50 outline-none transition-all"
                  placeholder="trader@example.com"
                />
              </div>
            </div>
            

            {/* Password Input (Hidden in Forgot Password mode) */}
            {!isForgotPassword && (
              <div className="animate-in fade-in">
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required={!isForgotPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 bg-slate-50 outline-none transition-all"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
                
                {/* Forgot Password Link (Only in Login mode) */}
                {isLogin && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(null); setMessage(null); }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'} 
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Back to Login Link (Only in Forgot Password mode) */}
            {isForgotPassword && (
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setError(null); setMessage(null); }}
                  className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  &larr; Back to login
                </button>
              </div>
            )}
            
          </form>
        </div>
      </div>
    </div>
  );
}