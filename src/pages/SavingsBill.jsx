import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Printer, 
  Download, 
  Truck, 
  ArrowLeft, 
  MapPin,
  Calendar,
  Building,
  QrCode,
  MessageCircle,
  FileSpreadsheet,
  X,
  ShieldCheck
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
      retailPrice: 1120,
      wholesalePrice: 845,
      qty: 5,
      lineRetail: 5600,
      lineWholesale: 4225,
      lineSavings: 1375
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
  totalRetailCost: 20100,
  totalWholesaleCost: 16025,
  totalSavings: 4075,
  overallSavingsPct: '20.3',
  totalItemsCount: 15,
  taxGst: 801,
  finalPayable: 16826
};

export default function SavingsBill() {
  const { theme, t, activeInvoice, user } = useApp();
  const navigate = useNavigate();

  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waSentToast, setWaSentToast] = useState(false);

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
    alert(`Downloading PDF Receipt for ${invoice.invoiceNo}...`);
  };

  const handleExportCSV = () => {
    const headers = ["Invoice No", "Date", "Store Name", "Cluster Hub", "Item ID", "Product Name", "Category", "Retail Price (INR)", "Wholesale Price (INR)", "Qty", "Total Retail", "Total Wholesale", "Line Savings"];
    const rows = (invoice.items || []).map(item => [
      `"${invoice.invoiceNo}"`,
      `"${invoice.date}"`,
      `"${invoice.storeName}"`,
      `"${invoice.clusterHub}"`,
      `"${item.id}"`,
      `"${item.name}"`,
      `"${item.category || 'General'}"`,
      item.retailPrice,
      item.wholesalePrice,
      item.qty,
      item.lineRetail,
      item.lineWholesale,
      item.lineSavings
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Samooh_Invoice_${invoice.invoiceNo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppMessageText = () => {
    return `Samooh Wholesale - Procurement Invoice
Invoice No: ${invoice.invoiceNo}
Billed Store: ${invoice.storeName}
Date: ${invoice.date}
Cluster Hub: ${invoice.clusterHub}

Itemized Breakdown (${invoice.totalItemsCount || invoice.items.length} Units):
${(invoice.items || []).map(i => `• ${i.name} (x${i.qty}) - ₹${i.lineWholesale.toLocaleString()}`).join('\n')}

Retail Benchmark: ₹${(invoice.totalRetailCost || 0).toLocaleString()}
Samooh Wholesale: ₹${(invoice.totalWholesaleCost || 0).toLocaleString()}
Net Savings: ₹${(invoice.totalSavings || 0).toLocaleString()} (${invoice.overallSavingsPct}% Margin)
Amount Payable: ₹${(invoice.finalPayable || 0).toLocaleString()}`;
  };

  const handleSimulateWhatsAppSend = () => {
    setShowWhatsAppModal(false);
    setWaSentToast(true);
    setTimeout(() => {
      setWaSentToast(false);
    }, 4500);
  };

  const handleOpenRealWhatsApp = () => {
    const text = encodeURIComponent(getWhatsAppMessageText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Toast Notification Simulation Banner */}
      {waSentToast && (
        <div className="fixed top-4 right-4 z-50 p-3.5 rounded-md bg-emerald-800 text-white shadow-lg border border-emerald-700 flex items-center space-x-3">
          <MessageCircle className="w-5 h-5 text-white flex-shrink-0" />
          <div>
            <h4 className="text-xs font-semibold">WhatsApp Order Alert Sent</h4>
            <p className="text-[11px] text-emerald-100">Notification delivered to registered store contact</p>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg p-5 shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-sm flex items-center">
                <MessageCircle className="w-4 h-4 text-emerald-700 mr-2" />
                Share via WhatsApp
              </h3>
              <button onClick={() => setShowWhatsAppModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="text-xs space-y-3 mb-4">
              <p className="text-slate-500">Summary sent to the registered store owner:</p>
              <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">
                {getWhatsAppMessageText()}
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={handleSimulateWhatsAppSend} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-600">Simulate</button>
              <button onClick={handleOpenRealWhatsApp} className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-xs font-medium">Open WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => navigate('/builder')}
          className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 flex items-center space-x-1.5 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Demand Builder</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium shadow-sm transition flex items-center space-x-1.5"
            title="Send WhatsApp Order Alert"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Alert</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('printInvoiceBtn')}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('downloadPdfBtn')}</span>
          </button>
        </div>
      </div>

      {/* Main Printable Invoice Card */}
      <div className="rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-5 sm:p-8 shadow-sm">
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-700 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Samooh <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">Wholesale Invoice</span>
            </h1>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
              Kirana Wholesale Procurement Platform
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              {t('invoiceNo')}: <strong className="text-slate-900 dark:text-white">{invoice.invoiceNo}</strong>
            </span>
            <div className="text-xs mt-1 flex items-center md:justify-end text-slate-500">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {t('billingDate')}: <strong className="ml-1 text-slate-800 dark:text-slate-200">{invoice.date}</strong>
            </div>
          </div>
        </div>

        {/* Store & Cluster Info Banner */}
        <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              {t('storeDetails')}
            </span>
            <h4 className="text-sm font-semibold mt-0.5 text-slate-900 dark:text-white">
              {invoice.storeName}
            </h4>
            <p className="mt-0.5 flex items-center text-slate-500">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
              {invoice.storeAddress}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              {t('clusterHubLabel')}
            </span>
            <h4 className="text-sm font-semibold mt-0.5 text-slate-800 dark:text-slate-200 flex items-center">
              <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {invoice.clusterHub}
            </h4>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              4 Kirana Stores Pooled in Cluster
            </span>
          </div>
        </div>

        {/* Itemized Price Comparison Table */}
        <div className="my-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('itemizedBreakdown')} ({invoice.items.length} Products)
            </h3>
          </div>

          <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">{t('productDescription')}</th>
                  <th className="py-2.5 px-3 text-center">{t('qtyOrdered')}</th>
                  <th className="py-2.5 px-3 text-right">{t('unitRetailPriceShort')}</th>
                  <th className="py-2.5 px-3 text-right">{t('unitWholesalePriceShort')}</th>
                  <th className="py-2.5 px-3 text-right">{t('totalRetailCost')}</th>
                  <th className="py-2.5 px-3 text-right">{t('totalGroupCost')}</th>
                  <th className="py-2.5 px-3 text-right">{t('itemSavings')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                      <span className="block text-[10px] text-slate-400">{item.category}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                      {item.qty}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 line-through">
                      ₹{item.retailPrice.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-emerald-800 dark:text-emerald-400">
                      ₹{item.wholesalePrice.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 line-through">
                      ₹{item.lineRetail.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                      ₹{item.lineWholesale.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-800 dark:text-emerald-400">
                      ₹{item.lineSavings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary & Total Savings Highlight */}
        <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Dispatch Status Timeline */}
          <div className="p-4 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center text-slate-800 dark:text-slate-200">
                <Truck className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                {t('dispatchStatus')}
              </h4>

              <div className="space-y-3 relative pl-4 border-l-2 border-emerald-700">
                <div className="relative">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 absolute -left-[21px] top-1" />
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-white">{t('statusStep1')}</h5>
                  <p className="text-[11px] text-slate-500">Demand aggregated across 4 Kirana partners.</p>
                </div>
                <div className="relative">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 absolute -left-[21px] top-1" />
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-white">{t('statusStep2')}</h5>
                  <p className="text-[11px] text-slate-500">Unlocked wholesale tier rates.</p>
                </div>
                <div className="relative">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 absolute -left-[21px] top-1" />
                  <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t('statusStep3')} (In Transit)</h5>
                  <p className="text-[11px] text-slate-500">Deccan Wholesale Logistics Hub dispatch assigned.</p>
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center space-x-2">
                <QrCode className="w-6 h-6 text-slate-500" />
                <span>Verified commercial wholesale invoice</span>
              </div>
              <span className="font-mono text-slate-400">REF: 8f9a2c</span>
            </div>
          </div>

          {/* Financial Calculation Box */}
          <div className="p-4 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5 text-xs">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1.5">
              {t('summaryHeading')}
            </h4>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{t('subtotalRetail')}</span>
              <span className="line-through">₹{invoice.totalRetailCost.toLocaleString()}</span>
            </div>

            <div className="flex justify-between font-semibold text-emerald-800 dark:text-emerald-400">
              <span>{t('samoohGroupDiscount')}</span>
              <span>- ₹{invoice.totalSavings.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{t('subtotalWholesale')}</span>
              <span className="font-medium text-slate-900 dark:text-white">₹{invoice.totalWholesaleCost.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{t('taxGst')}</span>
              <span>+ ₹{invoice.taxGst.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{t('logisticsDeliveryFee')}</span>
              <span className="text-emerald-800 dark:text-emerald-400 font-medium">₹0 (Pooled Free Delivery)</span>
            </div>

            {/* Total Payable Box */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-sm">
              <span className="text-slate-900 dark:text-white">
                {t('finalPayableAmount')}
              </span>
              <span className="text-base text-slate-900 dark:text-white">
                ₹{invoice.finalPayable.toLocaleString()}
              </span>
            </div>

            {/* Total Savings Highlight Badge */}
            <div className="mt-2 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider block text-emerald-800">
                {t('totalSavedHighlight')}
              </span>
              <span className="text-lg font-bold block mt-0.5">
                ₹{invoice.totalSavings.toLocaleString()} ({invoice.overallSavingsPct}% OFF)
              </span>
            </div>
          </div>
        </div>

        {/* Guarantee Badge Banner */}
        <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center space-x-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-800 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">
              {t('guaranteeBadgeTitle')}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('guaranteeBadgeDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
