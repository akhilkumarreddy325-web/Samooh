import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

import RoleSelectionStep from './RoleSelectionStep';

// Retailer Steps
import RetailerBusinessStep from './retailer/RetailerBusinessStep';
import RetailerProductsSoldStep from './retailer/RetailerProductsSoldStep';
import RetailerProductsNeededStep from './retailer/RetailerProductsNeededStep';
import RetailerPreferencesStep from './retailer/RetailerPreferencesStep';
import RetailerReviewStep from './retailer/RetailerReviewStep';

// Supplier Steps
import SupplierBusinessStep from './supplier/SupplierBusinessStep';
import SupplierProductsStep from './supplier/SupplierProductsStep';
import SupplierInventoryStep from './supplier/SupplierInventoryStep';
import SupplierPricingMoqStep from './supplier/SupplierPricingMoqStep';
import SupplierDeliveryStep from './supplier/SupplierDeliveryStep';
import SupplierReviewStep from './supplier/SupplierReviewStep';

export default function Onboarding() {
  const { 
    firebaseUser, 
    user, 
    userProfile,
    completeRetailerOnboarding, 
    completeSupplierOnboarding 
  } = useApp();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 = Role Selection, 1..N = Role Steps

  // Unified Form State (Empty by default for new users, never pre-populated with sample/demo data)
  const [formData, setFormData] = useState(() => {
    // If user has a scoped draft in localStorage, attempt to restore it
    if (firebaseUser?.uid) {
      try {
        const saved = localStorage.getItem(`samooh_onboarding_draft_${firebaseUser.uid}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch {
        // Ignore parse failure
      }
    }

    // Existing user profile in Firestore (if re-onboarding/updating)
    const existing = (firebaseUser?.uid && userProfile) ? userProfile : null;

    return {
      // Common & Location fields (Empty by default)
      state: existing?.state || existing?.businessLocation?.state || '',
      district: existing?.district || existing?.businessLocation?.district || '',
      city: existing?.city || existing?.businessLocation?.city || '',
      area: existing?.area || existing?.businessLocation?.area || '',
      address: existing?.address || existing?.businessLocation?.address || '',
      pincode: existing?.pincode || existing?.businessLocation?.pincode || '',
      businessLocation: existing?.businessLocation || null,
      contactPhone: existing?.phone || existing?.contactPhone || '',

      // Retailer fields (Empty by default for new users)
      shopName: existing?.storeName || existing?.shopName || '',
      ownerName: existing?.ownerName || firebaseUser?.displayName || '',
      businessType: existing?.businessType || 'Kirana Store',
      yearsInBusiness: existing?.yearsInBusiness || '',
      shopSize: existing?.shopSize || '',
      employeeCount: existing?.employeeCount || '',
      productsSold: Array.isArray(existing?.productsSold) ? existing.productsSold : [],
      productsNeeded: Array.isArray(existing?.productsNeeded) ? existing.productsNeeded : [],
      purchaseFrequency: existing?.purchaseFrequency || 'Weekly',
      deliveryRadiusKm: existing?.deliveryRadiusKm || 5.0,
      maxProcurementBudget: existing?.maxProcurementBudget || 25000,
      maxComfortableQuantity: existing?.maxComfortableQuantity || 200,
      participateGroupProcurement: true,

      // Supplier fields (Empty by default for new users - NO FMCG or Deccan defaults)
      businessName: existing?.businessName || existing?.name || '',
      contactPerson: existing?.contactPerson || firebaseUser?.displayName || '',
      productsSupplied: Array.isArray(existing?.productsSupplied) ? existing.productsSupplied : [],
      configuredProducts: Array.isArray(existing?.configuredProducts) ? existing.configuredProducts : [],
      serviceRadiusKm: existing?.serviceRadiusKm || 50.0,
      leadTimeDays: existing?.leadTimeDays || 2,
      distributionArea: existing?.distributionArea || '',
      pickupAvailable: true
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);

  // Auto-save form draft to localStorage safely (scoped to authenticated user)
  useEffect(() => {
    if (!firebaseUser?.uid) return;
    try {
      localStorage.setItem(`samooh_onboarding_draft_${firebaseUser.uid}`, JSON.stringify(formData));
    } catch {
      // LocalStorage quota or restricted
    }
  }, [formData, firebaseUser?.uid]);

  const updateFormData = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const handleSelectRole = (r) => {
    setRole(r);
  };

  const handleRoleNext = () => {
    if (!role) return;
    setCurrentStep(1);
  };

  const totalSteps = role === 'supplier' ? 6 : 5;

  const handleCompleteSetup = async () => {
    // Duplicate submission guard
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (role === 'supplier') {
        await completeSupplierOnboarding(formData);
      } else {
        await completeRetailerOnboarding(formData);
      }

      // Success: clear draft
      try {
        if (firebaseUser?.uid) {
          localStorage.removeItem(`samooh_onboarding_draft_${firebaseUser.uid}`);
        }
        localStorage.removeItem('samooh_onboarding_draft_v1');
      } catch {
        // Safe ignore
      }

      setSetupComplete(true);
      setTimeout(() => {
        if (role === 'supplier') {
          navigate('/supplier');
        } else {
          navigate('/');
        }
      }, 1000);
    } catch (err) {
      console.error('[Samooh Onboarding] Submission error:', err);
      setSubmitError(err.message || 'We could not save your onboarding details. Your information is preserved. Please click Retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between py-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-emerald-800 text-white flex items-center justify-center shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Samooh</span>
            <span className="text-[10px] text-slate-400 block font-medium">B2B Procurement Platform</span>
          </div>
        </div>

        {firebaseUser && (
          <div className="text-right text-xs">
            <span className="text-slate-500 block text-[11px]">Logged in as</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px] inline-block">
              {firebaseUser.email}
            </span>
          </div>
        )}
      </header>

      {/* Main Container Card */}
      <main className="max-w-3xl mx-auto w-full my-6">
        {/* Progress Bar & Step Tracker */}
        {currentStep > 0 && !setupComplete && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-emerald-800 dark:text-emerald-400">
                {role === 'supplier' ? 'Supplier Setup' : 'Kirana Retailer Setup'}
              </span>
              <span>
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-800 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
          {setupComplete ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Account Initialized Successfully!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Your enterprise profile has been safely saved to Samooh. Directing you to your {role === 'supplier' ? 'Supplier Wholesale Portal' : 'Group Procurement Dashboard'}...
              </p>
            </div>
          ) : (
            <>
              {currentStep === 0 && (
                <RoleSelectionStep
                  selectedRole={role}
                  onSelectRole={handleSelectRole}
                  onNext={handleRoleNext}
                />
              )}

              {/* RETAILER FLOW */}
              {role === 'retailer' && (
                <>
                  {currentStep === 1 && (
                    <RetailerBusinessStep
                      data={formData}
                      onUpdate={updateFormData}
                      onNext={() => setCurrentStep(2)}
                      onBack={() => setCurrentStep(0)}
                    />
                  )}

                  {currentStep === 2 && (
                    <RetailerProductsSoldStep
                      data={formData}
                      onUpdate={updateFormData}
                      onNext={() => setCurrentStep(3)}
                      onBack={() => setCurrentStep(1)}
                    />
                  )}

                  {currentStep === 3 && (
                    <RetailerProductsNeededStep
                      data={formData}
                      onUpdate={updateFormData}
                      onNext={() => setCurrentStep(4)}
                      onBack={() => setCurrentStep(2)}
                    />
                  )}

                  {currentStep === 4 && (
                    <RetailerPreferencesStep
                      data={formData}
                      onUpdate={updateFormData}
                      onNext={() => setCurrentStep(5)}
                      onBack={() => setCurrentStep(3)}
                    />
                  )}

                  {currentStep === 5 && (
                    <RetailerReviewStep
                      data={formData}
                      onEditStep={(st) => setCurrentStep(st)}
                      onSubmit={handleCompleteSetup}
                      isSubmitting={isSubmitting}
                      submitError={submitError}
                      onBack={() => setCurrentStep(4)}
                    />
                  )}
                </>
              )}

              {/* SUPPLIER FLOW */}
              {role === 'supplier' && (
                <>
                  {currentStep === 1 && (
                    <SupplierBusinessStep
                      data={formData}
                      onUpdate={updateFormData}
                      onNext={() => setCurrentStep(2)}
                      onBack={() => setCurrentStep(0)}
                    />
                  )}

                  {currentStep === 2 && (
                    <SupplierProductsStep
                      data={formData}
                      onUpdate={updateFormData}
                      onNext={() => setCurrentStep(3)}
                      onBack={() => setCurrentStep(1)}
                    />
                  )}

                  {currentStep === 3 && (
                    <SupplierInventoryStep
                      data={formData}
                      onUpdate={updateFormData}
                      onNext={() => setCurrentStep(4)}
                      onBack={() => setCurrentStep(2)}
                    />
                  )}

                  {currentStep === 4 && (
                    <SupplierPricingMoqStep
                      data={formData}
                      onUpdate={updateFormData}
                      onNext={() => setCurrentStep(5)}
                      onBack={() => setCurrentStep(3)}
                    />
                  )}

                  {currentStep === 5 && (
                    <SupplierDeliveryStep
                      data={formData}
                      onUpdate={updateFormData}
                      onNext={() => setCurrentStep(6)}
                      onBack={() => setCurrentStep(4)}
                    />
                  )}

                  {currentStep === 6 && (
                    <SupplierReviewStep
                      data={formData}
                      onEditStep={(st) => setCurrentStep(st)}
                      onSubmit={handleCompleteSetup}
                      isSubmitting={isSubmitting}
                      submitError={submitError}
                      onBack={() => setCurrentStep(5)}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-[11px] text-slate-400">
        Samooh AI • Group Procurement & Logistics Optimization Platform
      </footer>
    </div>
  );
}
