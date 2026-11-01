import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  Sparkles, 
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ForgeFlowLogo } from '../components/ForgeFlowLogo';
import { LoginBeansAnimation } from '../components/LoginBeansAnimation';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();

  const [identifier, setIdentifier] = useState('superadmin');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillSuperAdmin = () => {
    setIdentifier('superadmin');
    setPassword('Admin@123456');
    setError(null);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-slate-900 dark:bg-[#070b12] text-slate-100 font-sans select-none">
      
      {/* Interactive Three.js 3D Scatter Beans Canvas Background */}
      <LoginBeansAnimation />

      {/* Top Bar Quick Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-3">
        <div className="flex items-center p-1 rounded-lg bg-white/10 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 dark:border-slate-700/80 text-xs">
          <button
            onClick={() => setTheme('light')}
            title="Light Mode"
            className={`p-1.5 rounded transition ${theme === 'light' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-300 hover:text-white'}`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            title="Dark Mode"
            className={`p-1.5 rounded transition ${theme === 'dark' ? 'bg-slate-900 text-blue-400 shadow-sm' : 'text-slate-300 hover:text-white'}`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            title="System Default"
            className={`p-1.5 rounded transition ${theme === 'system' ? 'bg-cyan-500/30 text-cyan-200 shadow-sm' : 'text-slate-300 hover:text-white'}`}
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Glassmorphism Authentication Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-7 shadow-2xl shadow-black/40 text-slate-900 dark:text-slate-100 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <ForgeFlowLogo size={46} showText={false} />
          <div>
            <h1 className="text-2xl font-black tracking-tight font-mono text-slate-900 dark:text-white flex items-center justify-center space-x-2">
              <span>ForgeFlow</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono font-semibold">
                ERP
              </span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
              Manufacturing Operations & Subcontract Ledger
            </p>
          </div>
        </div>

        {/* Evaluator Quick Demo Fill Callout */}
        <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 border border-blue-500/20 text-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5 text-blue-700 dark:text-cyan-400 font-semibold font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Checker / Evaluator Access</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
              ID: <strong className="text-slate-900 dark:text-white">superadmin</strong> • Pass: <strong className="text-slate-900 dark:text-white">Admin@123456</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillSuperAdmin}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-[11px] font-semibold transition shadow-sm flex items-center space-x-1 flex-shrink-0"
          >
            <Sparkles className="w-3 h-3 text-cyan-300" />
            <span>Auto Fill</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Username / Email */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-mono">
              Username or Plant Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="superadmin or admin@forgeflow.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono text-xs transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold font-mono">
                Security Password
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Bcrypt Encrypted
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono text-xs transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-60 cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-cyan-300" />
                <span>AUTHENTICATE & ENTER COCKPIT</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Audit Notice */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            JWT RFC 7519 • HMAC-SHA256 • Role-Based Access Control
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            Apex Auto Components Ltd. • Production Facility Bhosari MIDC
          </p>
        </div>

      </div>

    </div>
  );
};
