import React from 'react';
import { 
  ShoppingBag, 
  Cake, 
  Coffee, 
  Utensils, 
  Hotel, 
  Apple, 
  Milk, 
  Egg, 
  Cross, 
  BookOpen, 
  Zap, 
  Smartphone, 
  Car, 
  Bike, 
  Shirt, 
  Footprints, 
  Sparkles, 
  Sparkle, 
  Hammer, 
  Tractor, 
  Heart, 
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { BUSINESS_SECTORS, getSectorById } from '../data/businessSectors';

const ICON_MAP = {
  ShoppingBag,
  Cake,
  Coffee,
  Utensils,
  Hotel,
  Apple,
  Milk,
  Egg,
  Cross,
  BookOpen,
  Zap,
  Smartphone,
  Car,
  Bike,
  Shirt,
  Footprints,
  Sparkles,
  Sparkle,
  Hammer,
  Tractor,
  Heart,
  Briefcase
};

export default function SectorSelector({ selectedSectorId, onSelectSector, label = "What type of business do you operate?" }) {
  const activeSector = getSectorById(selectedSectorId);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
          {label} <span className="text-rose-600">*</span>
        </label>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Select your commercial industry to load your standardized product catalog.
        </p>
      </div>

      {/* Selectable Sector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/40">
        {BUSINESS_SECTORS.map((sector) => {
          const isSelected = (selectedSectorId || 'grocery') === sector.id;
          const IconComp = ICON_MAP[sector.iconName] || Briefcase;

          return (
            <button
              key={sector.id}
              type="button"
              id={`sector_btn_${sector.id}`}
              onClick={() => onSelectSector(sector.id)}
              className={`p-2.5 rounded-lg border text-left text-xs transition flex flex-col justify-between space-y-2 relative ${
                isSelected
                  ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-700'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-1.5 rounded-md ${
                  isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
                )}
              </div>
              <span className="font-semibold leading-tight text-[11px] line-clamp-2">
                {sector.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Sector Description Banner */}
      {activeSector && (
        <div className="p-3 rounded-md bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-2.5 text-xs text-emerald-900 dark:text-emerald-200 animate-fade-in">
          <div className="flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-emerald-950 dark:text-emerald-100 uppercase tracking-wider text-[10px]">
                {activeSector.name}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">• Standardized Sector</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">
              "{activeSector.description}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
