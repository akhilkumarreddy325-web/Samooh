import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  submitSupplierSupportRequest, 
  getSupplierSupportRequests, 
  CONFIGURED_SUPPORT_PHONE 
} from '../services/supportService';

const SUPPLIER_ISSUE_TYPES = [
  { key: 'orderIssue', fallback: 'Order issue', value: 'Order issue' },
  { key: 'retailerQuery', fallback: 'Retailer query', value: 'Retailer query' },
  { key: 'inventoryIssue', fallback: 'Inventory issue', value: 'Inventory issue' },
  { key: 'stockIssue', fallback: 'Stock issue', value: 'Stock issue' },
  { key: 'pricingIssue', fallback: 'Pricing issue', value: 'Pricing issue' },
  { key: 'moqIssue', fallback: 'MOQ issue', value: 'MOQ issue' },
  { key: 'paymentIssue', fallback: 'Payment issue', value: 'Payment issue' },
  { key: 'deliveryIssue', fallback: 'Delivery issue', value: 'Delivery issue' },
  { key: 'productIssue', fallback: 'Product issue', value: 'Product issue' },
  { key: 'accountIssue', fallback: 'Account issue', value: 'Account issue' },
  { key: 'technicalIssue', fallback: 'Technical issue', value: 'Technical issue' },
  { key: 'platformIssue', fallback: 'Platform issue', value: 'Platform issue' },
  { key: 'other', fallback: 'Other', value: 'Other' }
];

export default function SupplierHelpSupportModal({ isOpen, onClose }) {
  const { theme, user, firebaseUser, currentSupplier, t } = useApp();

  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [orderOrPoolId, setOrderOrPoolId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  // History state
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Authenticated supplier identification (prioritizes Firebase Auth UID or active supplier account)
  const supplierId = firebaseUser?.uid || currentSupplier?.id || user?.id || 'sup_01';
  const supplierName = currentSupplier?.name || currentSupplier?.contactPerson || user?.ownerName || 'Wholesale Supplier Partner';
  const supplierEmail = currentSupplier?.email || firebaseUser?.email || user?.email || '';

  // Load previous requests when modal opens
  useEffect(() => {
    if (isOpen && supplierId) {
      loadHistory();
    }
  }, [isOpen, supplierId]);

  const loadHistory = async () => {
    setLoadingRequests(true);
    try {
      const history = await getSupplierSupportRequests(supplierId);
      setRequests(history);
    } catch (_) {
      // Non-blocking fallback
    } finally {
      setLoadingRequests(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError(t('describeIssue') || 'Please describe your issue or query.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await submitSupplierSupportRequest({
        supplierId,
        supplierName,
        supplierEmail,
        issueType: issueType || 'Other',
        description: description.trim(),
        orderOrPoolId: orderOrPoolId.trim()
      });

      setSubmitSuccess(true);
      setDescription('');
      setIssueType('');
      setOrderOrPoolId('');
      await loadHistory();
    } catch (err) {
      setError(err?.message || 'Could not submit your query. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNew = () => {
    setSubmitSuccess(false);
    setError('');
    setDescription('');
    setIssueType('');
    setOrderOrPoolId('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            RESOLVED
          </span>
        );
      case 'IN REVIEW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
            IN REVIEW
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            OPEN
          </span>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supplier-help-support-title"
    >
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg w-full max-w-lg overflow-hidden shadow-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between bg-slate-50/60 dark:bg-slate-900/50">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-md bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="supplier-help-support-title" className="text-base font-bold text-slate-900 dark:text-white">
                  {t('helpSupport') || 'Help & Support'}
                </h2>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                  SUPPLIER
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('supplierHelpSubtitle') || 'Have a question, issue, or problem? Tell us how we can help.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
            aria-label="Close Supplier Help & Support dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Success State View */}
          {submitSuccess ? (
            <div className="p-5 rounded-lg border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-900/50 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {t('supplierQuerySubmittedTitle') || 'Your query has been submitted.'}
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                  {t('supplierQuerySubmittedDesc') || 'Our support team will review it.'}
                </p>
              </div>
              <div className="pt-2 flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={handleResetForNew}
                  className="px-3 py-1.5 rounded-md border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-slate-700 transition"
                >
                  {t('submitAnother') || 'Submit Another Query'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistory(true)}
                  className="px-3 py-1.5 rounded-md bg-emerald-800 text-white text-xs font-medium hover:bg-emerald-900 transition"
                >
                  {t('viewMyRequests') || 'View My Requests'}
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Error Banner */}
              {error && (
                <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Issue Type Dropdown */}
              <div>
                <label 
                  htmlFor="supplier-issue-select"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t('issueType') || 'Issue Type'}{' '}
                  <span className="text-slate-400 font-normal">{t('issueAboutOptional') || '(optional)'}</span>
                </label>
                <select
                  id="supplier-issue-select"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-800 transition"
                >
                  <option value="">{t('selectCategoryPrompt') || 'Select a category...'}</option>
                  {SUPPLIER_ISSUE_TYPES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {t(cat.key) || cat.fallback}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order / Pool ID (Optional) */}
              <div>
                <label 
                  htmlFor="supplier-order-ref"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t('orderOrPoolId') || 'Order / Pool ID (optional)'}
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="supplier-order-ref"
                    type="text"
                    value={orderOrPoolId}
                    onChange={(e) => setOrderOrPoolId(e.target.value)}
                    placeholder={t('orderOrPoolIdPlaceholder') || 'e.g. ord_901 or pool_01'}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-800 transition"
                  />
                </div>
              </div>

              {/* Message Box */}
              <div>
                <label 
                  htmlFor="supplier-message-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t('describeIssue') || 'Describe your issue or query'}
                </label>
                <textarea
                  id="supplier-message-input"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('supplierDescribePlaceholder') || 'Please explain your question, issue, or problem...'}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md p-2.5 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-800 resize-none transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className="px-4 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? (t('submitting') || 'Submitting...') : (t('submitQuery') || 'Submit Query')}</span>
                </button>
              </div>
            </form>
          )}

          {/* Need Immediate Help? Section */}
          <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-start space-x-3 text-xs">
            <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                {t('needImmediateHelp') || 'Need immediate help?'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                {t('callSupport') || 'Call Support'}:{' '}
                {CONFIGURED_SUPPORT_PHONE ? (
                  <strong className="text-slate-700 dark:text-slate-200 font-medium">
                    {CONFIGURED_SUPPORT_PHONE}
                  </strong>
                ) : (
                  <span className="text-slate-500 italic">
                    {t('supportContactSoon') || 'Support contact will be available soon'}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Issue History Section ("My Requests") */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 py-1 hover:text-slate-900 dark:hover:text-white transition"
            >
              <div className="flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('myRequests') || 'My Requests'}</span>
                {requests.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                    {requests.length}
                  </span>
                )}
              </div>
              {showHistory ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {showHistory && (
              <div className="mt-2.5 space-y-2 max-h-44 overflow-y-auto pr-0.5">
                {loadingRequests ? (
                  <p className="text-[11px] text-slate-400 py-2 text-center">{t('loadingRequests') || 'Loading requests...'}</p>
                ) : requests.length > 0 ? (
                  requests.map((req) => (
                    <div 
                      key={req.id}
                      className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                            {req.issueType || 'General'}
                          </span>
                          {req.orderOrPoolId && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {req.orderOrPoolId}
                            </span>
                          )}
                        </div>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {req.description}
                      </p>
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 pt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : 'Recently submitted'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 py-2 text-center">
                    {t('noRequestsYet') || 'No support requests submitted yet.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {t('cancel') || 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
