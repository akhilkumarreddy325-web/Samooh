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
  ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  submitSupportRequest, 
  getRetailerSupportRequests, 
  CONFIGURED_SUPPORT_PHONE 
} from '../services/supportService';

const CATEGORIES = [
  'Stock / Quantity',
  'Payment',
  'Order',
  'Supplier',
  'Delivery',
  'Product',
  'Account',
  'Other'
];

export default function RetailerHelpSupportModal({ isOpen, onClose }) {
  const { theme, user, firebaseUser } = useApp();

  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  // History state
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const retailerId = firebaseUser?.uid || user?.id || 'usr_001';
  const retailerName = user?.storeName || user?.ownerName || 'Kirana Store';

  // Load previous requests when modal opens
  useEffect(() => {
    if (isOpen && retailerId) {
      loadHistory();
    }
  }, [isOpen, retailerId]);

  const loadHistory = async () => {
    setLoadingRequests(true);
    try {
      const history = await getRetailerSupportRequests(retailerId);
      setRequests(history);
    } catch (_) {
      // Non-blocking
    } finally {
      setLoadingRequests(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please describe your issue or query.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await submitSupportRequest({
        retailerId,
        retailerName,
        category: category || 'Other',
        message: message.trim()
      });

      setSubmitSuccess(true);
      setMessage('');
      setCategory('');
      await loadHistory();
    } catch (err) {
      setError(err?.message || 'Could not submit your issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNew = () => {
    setSubmitSuccess(false);
    setError('');
    setMessage('');
    setCategory('');
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
      aria-labelledby="help-support-title"
    >
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg w-full max-w-lg overflow-hidden shadow-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between bg-slate-50/60 dark:bg-slate-900/50">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-md bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 id="help-support-title" className="text-base font-bold text-slate-900 dark:text-white">
                Help & Support
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Having an issue? Tell us what happened and we'll help.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
            aria-label="Close Help & Support dialog"
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
                  Your issue has been submitted.
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                  We'll review your query and get back to you.
                </p>
              </div>
              <div className="pt-2 flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={handleResetForNew}
                  className="px-3 py-1.5 rounded-md border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-slate-700 transition"
                >
                  Submit Another Query
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistory(true)}
                  className="px-3 py-1.5 rounded-md bg-emerald-800 text-white text-xs font-medium hover:bg-emerald-900 transition"
                >
                  View My Requests
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

              {/* Category Dropdown */}
              <div>
                <label 
                  htmlFor="support-category-select"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  What's the issue about? <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <select
                  id="support-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-800 transition"
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Box */}
              <div>
                <label 
                  htmlFor="support-message-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Describe your issue or query
                </label>
                <textarea
                  id="support-message-input"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or query..."
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md p-2.5 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-800 resize-none transition"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="px-4 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Issue'}</span>
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
                Need immediate help?
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                Call Support:{' '}
                {CONFIGURED_SUPPORT_PHONE ? (
                  <strong className="text-slate-700 dark:text-slate-200 font-medium">
                    {CONFIGURED_SUPPORT_PHONE}
                  </strong>
                ) : (
                  <span className="text-slate-500 italic">
                    Support contact will be available soon
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Optional Issue History Section ("My Requests") */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 py-1 hover:text-slate-900 dark:hover:text-white transition"
            >
              <div className="flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>My Requests</span>
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
                  <p className="text-[11px] text-slate-400 py-2 text-center">Loading requests...</p>
                ) : requests.length > 0 ? (
                  requests.map((req) => (
                    <div 
                      key={req.id}
                      className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          {req.category || 'General'}
                        </span>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {req.message}
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
                    No support requests submitted yet.
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
