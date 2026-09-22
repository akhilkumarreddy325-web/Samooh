import React, { useState } from 'react';
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
    currentSupplier,
    completeRetailerOnboarding, 
    completeSupplierOnboarding 
  } = useApp();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 = Role Selection, 1..N = Role Steps

  // Unified Form State (Preserves all inputs across steps)
  const [formData, setFormData] = useState({
    // Retailer fields
    shopName: user?.storeName || '',
    ownerName: user?.ownerName || firebaseUser?.displayName || '',
    businessType: 'Kirana Store',
    city: user?.city || 'Hyderabad',
    area: '',
    address: user?.address || '',
    contactPhone: '',
    yearsInBusiness: '',
    shopSize: '',
    employeeCount: '',
    productsSold: ['Rice', 'Cooking Oil', 'Pulses & Dal', 'Sugar', 'Wheat & Flour'],
    productsNeeded: [
      { name: 'Sona Masoori Rice', category: 'Rice', typical_quantity: 100, unit: 'kg', purchase_frequency: 'Weekly', approx_budget: 4800 },
      { name: 'Sunflower Cooking Oil', category: 'Cooking Oil', typical_quantity: 50, unit: 'litres', purchase_frequency: 'Every 2 weeks', approx_budget: 5500 },
      { name: 'Refined Sugar (M-30)', category: 'Sugar', typical_quantity: 40, unit: 'kg', purchase_frequency: 'Weekly', approx_budget: 1600 }
    ],
    purchaseFrequency: 'Weekly',
    deliveryRadiusKm: 5.0,
    maxProcurementBudget: 25000,
    maxComfortableQuantity: 200,
    participateGroupProcurement: true,

    // Supplier fields
    businessName: currentSupplier?.name || '',
    contactPerson: currentSupplier?.contactPerson || firebaseUser?.displayName || '',
    productsSupplied: ['Grains & Staples', 'Rice (Raw & Boiled)', 'Edible & Cooking Oils', 'Sugar & Sweeteners'],
    configuredProducts: [
      {
        id: 'prod_rice_01',
        name: 'Sona Masoori Raw Rice (25kg Bag)',
        category: 'Rice (Raw & Boiled)',
        unit: 'kg',
        available_quantity: 2500,
        max_supply_quantity: 10000,
        replenishment_cycle: 'Weekly',
        wholesale_price: 48,
        moq: 200,
        quantity_tiers: [
          { min_quantity: 1, max_quantity: 99, price_per_unit: 52 },
          { min_quantity: 100, max_quantity: 199, price_per_unit: 50 },
          { min_quantity: 200, max_quantity: 499, price_per_unit: 48 },
          { min_quantity: 500, max_quantity: null, price_per_unit: 45 }
        ]
      },
      {
        id: 'prod_oil_02',
        name: 'Freedom Refined Sunflower Oil (15L Tin)',
        category: 'Edible & Cooking Oils',
        unit: 'litres',
        available_quantity: 1200,
        max_supply_quantity: 5000,
        replenishment_cycle: 'Weekly',
        wholesale_price: 110,
        moq: 100,
        quantity_tiers: [
          { min_quantity: 1, max_quantity: 49, price_per_unit: 118 },
          { min_quantity: 50, max_quantity: 99, price_per_unit: 114 },
          { min_quantity: 100, max_quantity: null, price_per_unit: 110 }
        ]
      },
      {
        id: 'prod_sugar_03',
        name: 'Premium M-30 Pure Sugar (50kg Bag)',
        category: 'Sugar & Sweeteners',
        unit: 'kg',
        available_quantity: 3000,
        max_supply_quantity: 15000,
        replenishment_cycle: 'Bi-weekly',
        wholesale_price: 38,
        moq: 150,
        quantity_tiers: [
          { min_quantity: 1, max_quantity: 149, price_per_unit: 42 },
          { min_quantity: 150, max_quantity: 499, price_per_unit: 38 },
          { min_quantity: 500, max_quantity: null, price_per_unit: 36 }
        ]
      }
    ],
    serviceRadiusKm: 50.0,
    leadTimeDays: 2,
    distributionArea: 'Hyderabad Greater Metro & Industrial Belts',
    pickupAvailable: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);

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
    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (role === 'supplier') {
        await completeSupplierOnboarding(formData);
      } else {
        await completeRetailerOnboarding(formData);
      }

      setSetupComplete(true);
      setTimeout(() => {
        if (role === 'supplier') {
          navigate('/supplier');
        } else {
          navigate('/');
        }
      }, 1200);
    } catch (err) {
      console.error('[Samooh Onboarding] Submission error:', err);
      setSubmitError(err.message || 'Unable to save profile to database. Please check connection and try again.');
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

        <div className="rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-sm">
          {/* Success Splash Screen */}
          {setupComplete ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Profile Initialized Successfully!
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your business parameters and procurement preferences are locked in. Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* STEP 0: Role Selection */}
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
