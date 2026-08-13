import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Store, LineChart, Layers, ShieldCheck, ShoppingBag, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { theme, t } = useApp();

  const navItems = [
    { labelKey: 'dashboard', path: '/', icon: LayoutDashboard },
    { labelKey: 'opportunities', path: '/opportunities', icon: Sparkles, badge: 'AI' },
    { labelKey: 'customDemand', path: '/builder', icon: ShoppingBag, badge: 'NEW' },
    { labelKey: 'savingsBill', path: '/invoice', icon: FileText },
    { labelKey: 'insights', path: '/insights', icon: Store },
    { labelKey: 'impact', path: '/impact', icon: LineChart },
  ];

  return (
    <aside className={`w-64 border-r flex flex-col justify-between p-4 flex-shrink-0 min-h-screen transition-colors duration-300 ${
      theme === 'light'
        ? 'bg-white/80 border-slate-200/80 backdrop-blur-xl shadow-[4px_0_24px_rgba(0,0,0,0.02)]'
        : 'bg-[#0B1020] border-slate-800/80'
    }`}>
      <div>
        {/* Brand Logo Header */}
        <div className="flex items-center space-x-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md flex items-center justify-center">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
              theme === 'light' ? 'bg-white' : 'bg-[#0B1020]'
            }`}>
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h1 className={`text-xl font-extrabold tracking-tight flex items-center ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              {t('brandName')} <span className="text-indigo-600 text-xs ml-1 font-semibold">{t('brandBadge')}</span>
            </h1>
            <p className={`text-[10px] font-medium ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {t('brandSubtitle')}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          <div className={`px-3 text-[10px] font-bold uppercase tracking-wider mb-2 ${
            theme === 'light' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {t('mainPlatform')}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? theme === 'light'
                        ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm font-bold'
                        : 'bg-accentBlue/10 text-accentBlue border border-accentBlue/20 shadow-glow-blue font-bold'
                      : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{t(item.labelKey)}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                    theme === 'light'
                      ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                      : 'bg-accentPurple/20 text-accentPurple border border-accentPurple/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer Card */}
      <div className={`p-3.5 rounded-xl border text-xs glass-panel ${
        theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-[#131A2A] border-slate-800'
      }`}>
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{t('engineLive')}</span>
        </div>
        <p className={`text-[11px] leading-tight ${
          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {t('retailersActive')} • Branch <code className="text-blue-600 dark:text-accentBlue text-[10px]">feature/custom-demand</code>
        </p>
      </div>
    </aside>
  );
}
