import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';

import Dashboard from './pages/Dashboard';
import Opportunities from './pages/Opportunities';
import Insights from './pages/Insights';
import Impact from './pages/Impact';
import CustomDemandBuilder from './pages/CustomDemandBuilder';
import SavingsBill from './pages/SavingsBill';
import OrderProcessing from './pages/OrderProcessing';
import Login from './pages/Login';
import PreviousOrders from './pages/PreviousOrders';

function MainLayout() {
  const { theme } = useApp();
  const location = useLocation();
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Standalone Full-Screen Login View
  if (location.pathname === '/login') {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-slate-100/90 text-slate-900'
          : 'bg-[#0B1020] text-slate-100'
      }`}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${
      theme === 'light'
        ? 'bg-slate-100/90 text-slate-900'
        : 'bg-[#0B1020] text-slate-100'
    }`}>
      {/* Left Sidebar Navigation */}
      <Sidebar 
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav 
          isLiveApi={isLiveApi}
          onToggleApi={() => setIsLiveApi(!isLiveApi)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/builder" element={<CustomDemandBuilder />} />
            <Route path="/orders" element={<PreviousOrders />} />
            <Route path="/processing" element={<OrderProcessing />} />
            <Route path="/invoice" element={<SavingsBill />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/impact" element={<Impact />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
