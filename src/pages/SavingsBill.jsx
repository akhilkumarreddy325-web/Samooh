import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  Sparkles,
  MapPin,
  Calendar,
  Building,
  QrCode
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const DEFAULT_INVOICE = {
  invoiceNo: 'INV-2026-8842',
  date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  storeName: 'Sri Lakshmi Kirana & General Store',
  storeAddress: 'Door No 42, Road No 12, Banjara Hills, Hyderabad (500034)',
  clusterHub: 'Hyderabad South-West Wholesale Cluster #4',
  items: [
    {
      id: 'prod_001',
      name: 'Sona Masoori Rice (25kg Bag)',
      category: 'Grains & Pulses',
      retailPrice: 1450,
      wholesalePrice: 1180,
      qty: 10,
      lineRetail: 14500,
      lineWholesale: 11800,
      lineSavings: 2700
    },
    {
      id: 'prod_006',
      name: 'Freedom Sunflower Oil (15L Tin)',
      category: 'Oils & Dairy',
      retailPrice: 1950,
      wholesalePrice: 1620,
      qty: 5,
      lineRetail: 9750,
      lineWholesale: 8100,
      lineSavings: 1650
    },
    {
      id: 'prod_010',
      name: 'Guntur Red Chilli Powder (5kg Pack)',
      category: 'Spices & Condiments',
      retailPrice: 1750,
      wholesalePrice: 1390,
      qty: 4,
      lineRetail: 7000,
      lineWholesale: 5560,
      lineSavings: 1440
    },
    {
      id: 'prod_018',
      name: 'Surf Excel Easy Wash Carton (1kg x 20)',
      category: 'Personal Care',
      retailPrice: 2800,
      wholesalePrice: 2250,
      qty: 3,
      lineRetail: 8400,
      lineWholesale: 6750,
      lineSavings: 1650
    }
  ],
  totalRetailCost: 39650,
  totalWholesaleCost: 32210,
  totalSavings: 7440,
  overallSavingsPct: '18.8',
  totalItemsCount: 22,
  taxGst: 1611,
  finalPayable: 33821
};

export default function SavingsBill() {
  const { theme, t, activeInvoice, user } = useApp();
  const navigate = useNavigate();

  const invoice = activeInvoice ? {
    ...activeInvoice,
    storeName: activeInvoice.storeName || user?.storeName || 'Sri Lakshmi Kirana & General Store',
    storeAddress: activeInvoice.storeAddress || user?.address || 'Door No 42, Road No 12, Banjara Hills, Hyderabad',
    clusterHub: activeInvoice.clusterHub || user?.clusterHub || 'Hyderabad South-West Wholesale Cluster #4'
  } : {
    ...DEFAULT_INVOICE,
    storeName: user?.storeName || DEFAULT_INVOICE.storeName,
    storeAddress: user?.address || DEFAULT_INVOICE.storeAddress,
    clusterHub: user?.clusterHub || DEFAULT_INVOICE.clusterHub
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert(`Downloading Official PDF Receipt for ${invoice.invoiceNo}...`);
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => navigate('/builder')}
          className={`px-3 py-2 rounded-xl border text-xs font-semibold transition flex items-center space-x-1.5 w-fit ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
              : 'bg-[#131A2A] border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Demand Builder</span>
        </button>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handlePrint}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                : 'bg-[#131A2A] border-slate-800 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Printer className="w-4 h-4 text-blue-500" />
            <span>{t('printInvoiceBtn')}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{t('downloadPdfBtn')}</span>
          </button>
        </div>
      </div>

      {/* Main Printable Invoice Card */}
      <div className={`glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border shadow-2xl transition-all duration-300 ${
        theme === 'light'
          ? 'bg-white border-slate-200/90 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
          : 'bg-[#131A2A] border-slate-700/80 text-white'
      }`}>
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-sm">
                S
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-blue-600 dark:text-accentBlue">
                Samooh <span className="text-purple-600 text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">Group Invoice</span>
              </h1>
            </div>
            <p className={`text-xs mt-1.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Collective Kirana Wholesale Procurement Platform
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-600 dark:text-accentPurple font-bold">
              {t('invoiceNo')}: <strong className="text-sm text-slate-900 dark:text-white">{invoice.invoiceNo}</strong>
            </span>
            <div className={`text-xs mt-1 flex items-center md:justify-end ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              <Calendar className="w-3.5 h-3.5 mr-1 text-blue-500" />
              {t('billingDate')}: <strong className={`ml-1 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{invoice.date}</strong>
            </div>
          </div>
        </div>

        {/* Store & Cluster Info Banner */}
        <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl border bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className={`text-[10px] uppercase font-bold tracking-wider block ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('storeDetails')}
            </span>
            <h4 className={`text-sm font-bold mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {invoice.storeName}
            </h4>
            <p className={`mt-0.5 flex items-center ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <MapPin className="w-3.5 h-3.5 mr-1 text-blue-500 flex-shrink-0" />
              {invoice.storeAddress}
            </p>
          </div>

          <div>
            <span className={`text-[10px] uppercase font-bold tracking-wider block ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('clusterHubLabel')}
            </span>
            <h4 className="text-sm font-bold mt-1 text-purple-600 dark:text-accentPurple flex items-center">
              <Building className="w-4 h-4 mr-1 text-purple-500" />
              {invoice.clusterHub}
            </h4>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
              ✓ 4 Kirana Stores Pooled in Cluster
            </span>
          </div>
        </div>

        {/* Itemized Price Comparison Table */}
        <div className="my-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
              {t('itemizedBreakdown')} ({invoice.items.length} Products)
            </h3>
            <span className="text-[10px] text-slate-400 sm:hidden">Swipe right →</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase tracking-wider border-b ${
                theme === 'light' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900/90 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="p-3.5">{t('productDescription')}</th>
                  <th className="p-3.5 text-center">{t('qtyOrdered')}</th>
                  <th className="p-3.5 text-right">{t('unitRetailPriceShort')}</th>
                  <th className="p-3.5 text-right">{t('unitWholesalePriceShort')}</th>
                  <th className="p-3.5 text-right">{t('totalRetailCost')}</th>
                  <th className="p-3.5 text-right">{t('totalGroupCost')}</th>
                  <th className="p-3.5 text-right">{t('itemSavings')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-slate-800/70'}`}>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className={theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                    <td className="p-3.5 font-bold">
                      <span className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{item.name}</span>
                      <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{item.category}</span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-blue-600 dark:text-accentBlue">
                      {item.qty}
                    </td>
                    <td className="p-3.5 text-right text-slate-400 line-through">
                      ₹{item.retailPrice.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-emerald-600 dark:text-accentGreen">
                      ₹{item.wholesalePrice.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right text-slate-400 line-through">
                      ₹{item.lineRetail.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-white">
                      ₹{item.lineWholesale.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{item.lineSavings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary & Total Savings Highlight */}
        <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dispatch Status Timeline */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>
                <Truck className="w-4 h-4 text-blue-500 mr-1.5" />
                {t('dispatchStatus')}
              </h4>

              <div className="space-y-3 relative pl-4 border-l-2 border-emerald-500">
                <div className="relative">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 absolute -left-[23px] top-0.5 ring-4 ring-emerald-500/20" />
                  <h5 className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{t('statusStep1')} ✓</h5>
                  <p className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Demand aggregated across 4 Kirana partners.</p>
                </div>
                <div className="relative">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 absolute -left-[23px] top-0.5 ring-4 ring-emerald-500/20" />
                  <h5 className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{t('statusStep2')} ✓</h5>
                  <p className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Unlocked Tier-1 bulk wholesale prices.</p>
                </div>
                <div className="relative">
                  <span className="w-3 h-3 rounded-full bg-blue-500 absolute -left-[23px] top-0.5 ring-4 ring-blue-500/20 animate-pulse" />
                  <h5 className="text-xs font-bold text-blue-600 dark:text-accentBlue">{t('statusStep3')} (Active)</h5>
                  <p className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Assigned to Deccan Wholesale Logistics Truck #HYD-42.</p>
                </div>
              </div>
            </div>

            {/* QR Code Verification Snippet */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                <span className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Scan QR to verify blockchain wholesale receipt
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">HASH: 8f9a2c...</span>
            </div>
          </div>

          {/* Financial Calculation Box */}
          <div className={`p-6 rounded-2xl border space-y-3 text-xs ${
            theme === 'light' ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border-b border-emerald-200 dark:border-emerald-500/20 pb-2">
              {t('summaryHeading')}
            </h4>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{t('subtotalRetail')}</span>
              <span className="line-through">₹{invoice.totalRetailCost.toLocaleString()}</span>
            </div>

            <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400">
              <span>{t('samoohGroupDiscount')}</span>
              <span>- ₹{invoice.totalSavings.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{t('subtotalWholesale')}</span>
              <span className="font-bold">₹{invoice.totalWholesaleCost.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{t('taxGst')}</span>
              <span>+ ₹{invoice.taxGst.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
              <span>{t('logisticsDeliveryFee')}</span>
              <span>₹0 (FREE)</span>
            </div>

            {/* Total Payable Box */}
            <div className="pt-3 border-t border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between">
              <span className={`text-sm font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {t('finalPayableAmount')}
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ₹{invoice.finalPayable.toLocaleString()}
              </span>
            </div>

            {/* Total Savings Highlight Badge */}
            <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-widest block opacity-90">
                {t('totalSavedHighlight')}
              </span>
              <span className="text-2xl font-black tracking-tight block">
                ₹{invoice.totalSavings.toLocaleString()} ({invoice.overallSavingsPct}% OFF)
              </span>
            </div>
          </div>
        </div>

        {/* Guarantee Badge Banner */}
        <div className={`p-4 rounded-2xl border flex items-center space-x-4 ${
          theme === 'light'
            ? 'bg-purple-50/80 border-purple-200 text-purple-900'
            : 'bg-accentPurple/10 border-accentPurple/20 text-slate-200'
        }`}>
          <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-accentPurple flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-purple-700 dark:text-accentPurple uppercase tracking-wider">
              {t('guaranteeBadgeTitle')}
            </h4>
            <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-purple-800' : 'text-slate-300'}`}>
              {t('guaranteeBadgeDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
