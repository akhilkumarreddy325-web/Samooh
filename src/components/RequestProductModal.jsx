import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, PackageSearch } from 'lucide-react';
import { submitProductRequest } from '../services/productRequestService';
import { getSectorById } from '../data/businessSectors';
import { useApp } from '../context/AppContext';

export default function RequestProductModal({ isOpen, onClose, sectorId = 'grocery' }) {
  const { user, firebaseUser } = useApp();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentSector = getSectorById(sectorId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please describe the product you are looking for.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const activeUid = firebaseUser?.uid || user?.id || 'onboarding_user';
      const res = await submitProductRequest({
        requestedBy: activeUid,
        sectorId: sectorId,
        description: description.trim()
      });

      setSuccessMsg(res.message || 'Product request submitted for review.');
      setTimeout(() => {
        setDescription('');
        setSuccessMsg('');
        onClose();
      }, 1600);
    } catch (err) {
      setError(err.message || 'Failed to submit product request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg w-full max-w-md overflow-hidden shadow-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <PackageSearch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Request a Standardized Product
              </h3>
              <span className="text-[11px] text-slate-500 block">
                Target Sector: {currentSector?.name}
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Can't find your product in the standardized catalog? Describe it below. 
            Our catalog team will review and add it with canonical specifications for group procurement.
          </p>

          {error && (
            <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Product Description & Details <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setError('');
                setDescription(e.target.value);
              }}
              placeholder="e.g. Sona Masuri Raw Rice 10kg Bag, Brand: Premium Royal, Packaged in gunny bag"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-md p-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Requests are recorded as PENDING_REVIEW and vetted before catalog inclusion.
            </span>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 rounded-md flex items-center space-x-1.5 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
