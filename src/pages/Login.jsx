import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { signInWithGoogle, getUserProfile, initializeUserProfile } from '../services/authService';
import LoginBackgroundVideo from '../components/LoginBackgroundVideo';

export default function Login() {
  const navigate = useNavigate();

  // Authentication State Management
  const [authStatus, setAuthStatus] = useState('IDLE'); // 'IDLE' | 'AUTHENTICATING' | 'VERIFYING' | 'SUCCESS' | 'ERROR'
  const [authError, setAuthError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleGoogleSignIn = async () => {
    setAuthStatus('AUTHENTICATING');
    setAuthError('');
    setStatusMessage('Connecting to Google Identity Service...');

    try {
      const res = await signInWithGoogle();
      
      if (res.redirecting) {
        setStatusMessage('Redirecting to Google authentication...');
        return;
      }

      if (!res.success) {
        setAuthStatus('ERROR');
        setAuthError(res.error || 'Google sign-in could not be completed. Please try again.');
        return;
      }

      const fbUser = res.user;
      setAuthStatus('VERIFYING');
      setStatusMessage(`Authenticated as ${fbUser.displayName || fbUser.email}. Checking account...`);

      // Query Firestore users/{uid} for onboarding status
      const profile = await getUserProfile(fbUser.uid);

      if (profile && profile.onboardingCompleted) {
        setAuthStatus('SUCCESS');
        const role = profile.role || 'retailer';
        setStatusMessage(`Welcome back, ${profile.storeName || profile.name || fbUser.displayName}!`);
        
        setTimeout(() => {
          if (role === 'supplier') {
            navigate('/supplier');
          } else {
            navigate('/');
          }
        }, 500);
      } else {
        // Initialize user stub if needed and route to Onboarding
        await initializeUserProfile(fbUser);
        setAuthStatus('SUCCESS');
        setStatusMessage('Account verified. Redirecting to business setup...');
        
        setTimeout(() => {
          navigate('/onboarding');
        }, 500);
      }
    } catch (err) {
      console.error('[Samooh Login] Sign-in exception:', err);
      setAuthStatus('ERROR');
      setAuthError(err.message || 'We could not sign you in with Google right now. Please try again.');
    }
  };

  const isLoading = authStatus === 'AUTHENTICATING' || authStatus === 'VERIFYING';

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Cinematic Documentary Background Video (Kirana stores, Mandi warehouse, Logistics, Staples) */}
      <LoginBackgroundVideo />

      {/* Top Brand Bar */}
      <header className="relative z-10 max-w-md mx-auto w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-950/40 backdrop-blur-md border border-white/10 text-white shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold tracking-tight text-white">Samooh</span>
            <span className="text-[10px] text-slate-300 block font-medium">B2B Wholesale Procurement</span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-medium">Google OAuth 2.0</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-md mx-auto w-full my-auto py-6 sm:py-8">
        <div 
          className="rounded-[22px] p-7 sm:p-9 text-center space-y-6 transition-all duration-200"
          style={{
            background: 'rgba(255, 255, 255, 0.74)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.55)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.14)'
          }}
        >
          {/* Logo & Headline */}
          <div className="space-y-2.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center mx-auto shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Sign In to Samooh
            </h1>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Collective procurement & wholesale pooling for local Kirana retailers and verified suppliers across India.
            </p>
          </div>

          {/* Error Banner */}
          {authStatus === 'ERROR' && authError && (
            <div className="p-3.5 rounded-xl bg-rose-50/95 border border-rose-200 text-rose-800 text-xs text-left flex items-start space-x-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Authentication Issue</span>
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* Status Message (During Auth / Redirect) */}
          {(isLoading || authStatus === 'SUCCESS') && statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-50/95 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center space-x-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-800" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Single Google Sign-In Action */}
          <div className="pt-1">
            <button
              type="button"
              id="google-signin-button"
              disabled={isLoading || authStatus === 'SUCCESS'}
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center space-x-3 disabled:opacity-60 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-800" />
                  <span>Signing in with Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="font-semibold text-slate-800">
                    Continue with Google
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Secure Trust Indicators */}
          <div className="pt-4 border-t border-slate-900/10 text-[11px] text-slate-600 space-y-2">
            <div className="flex items-center justify-center space-x-1.5 text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
              <span className="font-medium">Enterprise encrypted B2B authentication</span>
            </div>
            <p className="text-slate-500">
              By signing in, you access the verified Samooh wholesale procurement network.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-slate-200/90 drop-shadow">
        Samooh • Group Procurement & Logistics Platform for Indian Retailers
      </footer>
    </div>
  );
}
