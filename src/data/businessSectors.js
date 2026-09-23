/**
 * Samooh Canonical Business Sectors Definition
 * 
 * Extensible canonical sector dataset for Retailers and Wholesale Suppliers.
 * Designed to allow adding new sectors without modifying onboarding flow logic.
 * "other_business" ('Other Small Business') is guaranteed to always exist.
 */

export const BUSINESS_SECTORS = [
  {
    id: 'grocery',
    name: 'Grocery / Kirana',
    description: 'Everyday food and household essentials.',
    iconName: 'ShoppingBag',
    suggestedUnits: ['kg', 'bags (25kg)', 'bags (50kg)', 'litres', 'cartons', 'units']
  },
  {
    id: 'bakery',
    name: 'Bakery',
    description: 'Bread, biscuits, cakes and bakery ingredients.',
    iconName: 'Cake',
    suggestedUnits: ['kg', 'bags (25kg)', 'cartons', 'units', 'packets']
  },
  {
    id: 'tea_beverages',
    name: 'Tea & Beverages',
    description: 'Tea, coffee, sugar, disposable supplies and bottled drinks.',
    iconName: 'Coffee',
    suggestedUnits: ['kg', 'cartons', 'packs', 'units', 'litres']
  },
  {
    id: 'restaurant',
    name: 'Restaurant / Food Service',
    description: 'Commercial cooking staples, spices and bulk culinary supplies.',
    iconName: 'Utensils',
    suggestedUnits: ['kg', 'bags (25kg)', 'bags (50kg)', 'litres', 'tins (15L)', 'cartons']
  },
  {
    id: 'hotel_catering',
    name: 'Hotel / Catering',
    description: 'Bulk dining, catering consumables and commercial pantry supplies.',
    iconName: 'Hotel',
    suggestedUnits: ['kg', 'bags (50kg)', 'cartons', 'tins (15L)', 'units']
  },
  {
    id: 'fruits_vegetables',
    name: 'Fruits & Vegetables',
    description: 'Farm-fresh vegetables, seasonal fruits and leafy greens.',
    iconName: 'Apple',
    suggestedUnits: ['kg', 'crates', 'quintal', 'bags', 'units']
  },
  {
    id: 'dairy',
    name: 'Dairy',
    description: 'Milk, curd, paneer, butter, ghee and dairy derivatives.',
    iconName: 'Milk',
    suggestedUnits: ['litres', 'kg', 'crates', 'packs', 'units']
  },
  {
    id: 'meat_poultry',
    name: 'Meat & Poultry',
    description: 'Fresh chicken, eggs, mutton and seafood supplies.',
    iconName: 'Egg',
    suggestedUnits: ['kg', 'trays (30 eggs)', 'crates', 'units']
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy / Healthcare',
    description: 'Over-the-counter wellness essentials, first aid and hygiene.',
    iconName: 'Cross',
    suggestedUnits: ['units', 'strips', 'boxes', 'bottles', 'cartons']
  },
  {
    id: 'stationery',
    name: 'Stationery & Books',
    description: 'Notebooks, writing instruments, printing paper and office supplies.',
    iconName: 'BookOpen',
    suggestedUnits: ['dozens', 'packs', 'reams', 'cartons', 'units']
  },
  {
    id: 'electrical_hardware',
    name: 'Electrical & Hardware',
    description: 'Lighting, switches, wiring, fasteners and building hardware.',
    iconName: 'Zap',
    suggestedUnits: ['units', 'boxes', 'coils', 'meters', 'kg']
  },
  {
    id: 'mobile_electronics',
    name: 'Mobile & Electronics',
    description: 'Phone accessories, cables, chargers and portable electronics.',
    iconName: 'Smartphone',
    suggestedUnits: ['units', 'packs', 'cartons', 'pieces']
  },
  {
    id: 'automobile_parts',
    name: 'Automobile / Spare Parts',
    description: 'Vehicle parts, accessories and maintenance supplies.',
    iconName: 'Car',
    suggestedUnits: ['units', 'sets', 'litres', 'boxes', 'pieces']
  },
  {
    id: 'bike_parts',
    name: 'Bike & Two-Wheeler Parts',
    description: 'Motorcycle and scooter spares, tyres, oils and consumables.',
    iconName: 'Bike',
    suggestedUnits: ['units', 'sets', 'litres', 'pairs', 'pieces']
  },
  {
    id: 'clothing_fashion',
    name: 'Clothing & Fashion',
    description: 'Readymade garments, hosiery, uniforms and daily apparel.',
    iconName: 'Shirt',
    suggestedUnits: ['pieces', 'dozens', 'bundles', 'packs']
  },
  {
    id: 'footwear',
    name: 'Footwear',
    description: 'Slippers, sandals, school shoes and everyday footwear.',
    iconName: 'Footprints',
    suggestedUnits: ['pairs', 'dozens', 'cartons']
  },
  {
    id: 'cosmetics_personal_care',
    name: 'Cosmetics & Personal Care',
    description: 'Personal grooming, hair care, skin care and oral hygiene.',
    iconName: 'Sparkles',
    suggestedUnits: ['units', 'cartons', 'dozens', 'packs']
  },
  {
    id: 'household_cleaning',
    name: 'Household & Cleaning',
    description: 'Detergents, floor cleaners, disinfectants and janitorial goods.',
    iconName: 'Sparkle',
    suggestedUnits: ['litres', 'kg', 'cartons', 'bottles', 'packs']
  },
  {
    id: 'construction_materials',
    name: 'Construction Materials',
    description: 'Cement, sand, steel, bricks and basic building commodities.',
    iconName: 'Hammer',
    suggestedUnits: ['bags (50kg)', 'tonnes', 'pieces', 'litres']
  },
  {
    id: 'agricultural_supplies',
    name: 'Agricultural Supplies',
    description: 'Seeds, crop nutrients, irrigation gear and livestock feed.',
    iconName: 'Tractor',
    suggestedUnits: ['bags (50kg)', 'kg', 'litres', 'quintal', 'units']
  },
  {
    id: 'pet_supplies',
    name: 'Pet Supplies',
    description: 'Pet food, grooming supplies, veterinary care and accessories.',
    iconName: 'Heart',
    suggestedUnits: ['kg', 'packs', 'cartons', 'units']
  },
  {
    id: 'other_business',
    name: 'Other Small Business',
    description: 'General small enterprise supplies, packaging and commercial items.',
    iconName: 'Briefcase',
    suggestedUnits: ['units', 'packs', 'cartons', 'kg']
  }
];

/**
 * Returns a sector by its canonical ID with safe fallback to 'other_business'
 */
export function getSectorById(sectorId) {
  if (!sectorId) return BUSINESS_SECTORS[0];
  const found = BUSINESS_SECTORS.find(s => s.id === sectorId);
  return found || BUSINESS_SECTORS.find(s => s.id === 'other_business') || BUSINESS_SECTORS[0];
}

/**
 * Returns all available business sectors
 */
export function getAllBusinessSectors() {
  return BUSINESS_SECTORS;
}
