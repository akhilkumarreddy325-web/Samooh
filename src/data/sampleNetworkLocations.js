/**
 * Canonical Sample Wholesale Network Dataset for Hackathon Presentation
 *
 * Provides a deterministic, realistic geographic distribution network:
 * - Fixed Central Warehouse: Medchal Industrial Corridor, Telangana
 * - Fixed Retail Points across major commercial & residential nodes in Hyderabad / Medchal region
 *
 * Coordinates are fixed, immutable constants reflecting real geographic locations.
 * Never generated dynamically, randomized, or written to Firestore as real customer data.
 */

export const SAMPLE_WAREHOUSE = {
  id: "wh_medchal_central",
  name: "Deccan Wholesale Hub — Medchal",
  facilityType: "Central Distribution Center",
  address: "Plot 24, Phase 1, Medchal Industrial Park, Medchal, Telangana 501401",
  locality: "Medchal Industrial Area",
  city: "Medchal",
  district: "Medchal-Malkajgiri",
  state: "Telangana",
  pincode: "501401",
  latitude: 17.6189,
  longitude: 78.4812,
  isDemo: true,
  capacityTonnes: 150,
  operatingRadiusKm: 60
};

export const SAMPLE_RETAIL_LOCATIONS = [
  {
    id: "retail_medchal",
    name: "Medchal Retail Point",
    businessType: "Kirana & General Store",
    locality: "Medchal Town",
    area: "Medchal",
    city: "Medchal",
    district: "Medchal-Malkajgiri",
    state: "Telangana",
    address: "Main Market Road, Medchal, Telangana 501401",
    latitude: 17.6297,
    longitude: 78.4814,
    contactPhone: "+91 98480 11001",
    isDemo: true,
    location: {
      latitude: 17.6297,
      longitude: 78.4814,
      sharingEnabled: true,
      accuracy: 5,
      source: "verified_location"
    },
    procurementProfile: {
      maximum_procurement_value: 35000,
      maximum_comfortable_quantity: 250,
      purchase_frequency: "Weekly",
      pooled_procurement_enabled: true,
      products_needed: [
        { product_name: "Sona Masoori Rice (25kg)", typical_quantity: 25, unit: "bags" }
      ]
    }
  },
  {
    id: "retail_kompally",
    name: "Kompally Retail Point",
    businessType: "Provision Store",
    locality: "Kompally",
    area: "Kompally",
    city: "Hyderabad",
    district: "Medchal-Malkajgiri",
    state: "Telangana",
    address: "NH 44 Commercial Junction, Kompally, Hyderabad 500100",
    latitude: 17.5385,
    longitude: 78.4867,
    contactPhone: "+91 98480 11002",
    isDemo: true,
    location: {
      latitude: 17.5385,
      longitude: 78.4867,
      sharingEnabled: true,
      accuracy: 6,
      source: "verified_location"
    },
    procurementProfile: {
      maximum_procurement_value: 45000,
      maximum_comfortable_quantity: 300,
      purchase_frequency: "Weekly",
      pooled_procurement_enabled: true,
      products_needed: [
        { product_name: "Freedom Sunflower Oil (15L)", typical_quantity: 18, unit: "tins" }
      ]
    }
  },
  {
    id: "retail_jeedimetla",
    name: "Jeedimetla Retail Point",
    businessType: "Wholesale Grocery",
    locality: "Jeedimetla",
    area: "Jeedimetla",
    city: "Hyderabad",
    district: "Medchal-Malkajgiri",
    state: "Telangana",
    address: "Pipeline Road, Phase 3, Jeedimetla, Hyderabad 500055",
    latitude: 17.5186,
    longitude: 78.4527,
    contactPhone: "+91 98480 11003",
    isDemo: true,
    location: {
      latitude: 17.5186,
      longitude: 78.4527,
      sharingEnabled: true,
      accuracy: 8,
      source: "verified_location"
    },
    procurementProfile: {
      maximum_procurement_value: 40000,
      maximum_comfortable_quantity: 220,
      purchase_frequency: "Weekly",
      pooled_procurement_enabled: true,
      products_needed: [
        { product_name: "Premium Pure Sugar (50kg)", typical_quantity: 12, unit: "bags" }
      ]
    }
  },
  {
    id: "retail_kukatpally",
    name: "Kukatpally Retail Point",
    businessType: "Superette & Kirana",
    locality: "Kukatpally",
    area: "Kukatpally",
    city: "Hyderabad",
    district: "Medchal-Malkajgiri",
    state: "Telangana",
    address: "KPHB Colony 4th Phase, Kukatpally, Hyderabad 500072",
    latitude: 17.4849,
    longitude: 78.4138,
    contactPhone: "+91 98480 11004",
    isDemo: true,
    location: {
      latitude: 17.4849,
      longitude: 78.4138,
      sharingEnabled: true,
      accuracy: 5,
      source: "verified_location"
    },
    procurementProfile: {
      maximum_procurement_value: 55000,
      maximum_comfortable_quantity: 350,
      purchase_frequency: "Weekly",
      pooled_procurement_enabled: true,
      products_needed: [
        { product_name: "Sona Masoori Rice (25kg)", typical_quantity: 30, unit: "bags" }
      ]
    }
  },
  {
    id: "retail_madhapur",
    name: "Madhapur Retail Point",
    businessType: "Daily Needs Mart",
    locality: "Madhapur",
    area: "Madhapur",
    city: "Hyderabad",
    district: "Hyderabad",
    state: "Telangana",
    address: "Ayyappa Society Main Road, Madhapur, Hyderabad 500081",
    latitude: 17.4483,
    longitude: 78.3915,
    contactPhone: "+91 98480 11005",
    isDemo: true,
    location: {
      latitude: 17.4483,
      longitude: 78.3915,
      sharingEnabled: true,
      accuracy: 7,
      source: "verified_location"
    },
    procurementProfile: {
      maximum_procurement_value: 60000,
      maximum_comfortable_quantity: 400,
      purchase_frequency: "Weekly",
      pooled_procurement_enabled: true,
      products_needed: [
        { product_name: "Freedom Sunflower Oil (15L)", typical_quantity: 20, unit: "tins" }
      ]
    }
  },
  {
    id: "retail_kondapur",
    name: "Kondapur Retail Point",
    businessType: "Kirana Store",
    locality: "Kondapur",
    area: "Kondapur",
    city: "Hyderabad",
    district: "Ranga Reddy",
    state: "Telangana",
    address: "RTA Road, Raghavendra Colony, Kondapur, Hyderabad 500084",
    latitude: 17.4622,
    longitude: 78.3568,
    contactPhone: "+91 98480 11006",
    isDemo: true,
    location: {
      latitude: 17.4622,
      longitude: 78.3568,
      sharingEnabled: true,
      accuracy: 6,
      source: "verified_location"
    },
    procurementProfile: {
      maximum_procurement_value: 38000,
      maximum_comfortable_quantity: 200,
      purchase_frequency: "Weekly",
      pooled_procurement_enabled: true,
      products_needed: [
        { product_name: "Toor Dal Premium (25kg)", typical_quantity: 10, unit: "bags" }
      ]
    }
  },
  {
    id: "retail_secunderabad",
    name: "Secunderabad Retail Point",
    businessType: "General Merchant",
    locality: "Secunderabad",
    area: "Secunderabad",
    city: "Hyderabad",
    district: "Hyderabad",
    state: "Telangana",
    address: "Subhash Road, Secunderabad, Telangana 500003",
    latitude: 17.4399,
    longitude: 78.4983,
    contactPhone: "+91 98480 11007",
    isDemo: true,
    location: {
      latitude: 17.4399,
      longitude: 78.4983,
      sharingEnabled: true,
      accuracy: 5,
      source: "verified_location"
    },
    procurementProfile: {
      maximum_procurement_value: 50000,
      maximum_comfortable_quantity: 280,
      purchase_frequency: "Weekly",
      pooled_procurement_enabled: true,
      products_needed: [
        { product_name: "Atta Whole Wheat (10kg)", typical_quantity: 35, unit: "bags" }
      ]
    }
  },
  {
    id: "retail_uppal",
    name: "Uppal Retail Point",
    businessType: "Kirana & Provisions",
    locality: "Uppal",
    area: "Uppal",
    city: "Hyderabad",
    district: "Medchal-Malkajgiri",
    state: "Telangana",
    address: "Inner Ring Road, Uppal Junction, Hyderabad 500039",
    latitude: 17.4022,
    longitude: 78.5603,
    contactPhone: "+91 98480 11008",
    isDemo: true,
    location: {
      latitude: 17.4022,
      longitude: 78.5603,
      sharingEnabled: true,
      accuracy: 8,
      source: "verified_location"
    },
    procurementProfile: {
      maximum_procurement_value: 42000,
      maximum_comfortable_quantity: 230,
      purchase_frequency: "Weekly",
      pooled_procurement_enabled: true,
      products_needed: [
        { product_name: "Premium Pure Sugar (50kg)", typical_quantity: 15, unit: "bags" }
      ]
    }
  },
  {
    id: "retail_lbnagar",
    name: "LB Nagar Retail Point",
    businessType: "Wholesale Kirana",
    locality: "LB Nagar",
    area: "LB Nagar",
    city: "Hyderabad",
    district: "Ranga Reddy",
    state: "Telangana",
    address: "Sagar Ring Road, LB Nagar, Hyderabad 500074",
    latitude: 17.3457,
    longitude: 78.5522,
    contactPhone: "+91 98480 11009",
    isDemo: true,
    location: {
      latitude: 17.3457,
      longitude: 78.5522,
      sharingEnabled: true,
      accuracy: 9,
      source: "verified_location"
    },
    procurementProfile: {
      maximum_procurement_value: 36000,
      maximum_comfortable_quantity: 190,
      purchase_frequency: "Weekly",
      pooled_procurement_enabled: true,
      products_needed: [
        { product_name: "Sona Masoori Rice (25kg)", typical_quantity: 20, unit: "bags" }
      ]
    }
  },
  {
    id: "retail_mehdipatnam",
    name: "Mehdipatnam Retail Point",
    businessType: "Family Provisions",
    locality: "Mehdipatnam",
    area: "Mehdipatnam",
    city: "Hyderabad",
    district: "Hyderabad",
    state: "Telangana",
    address: "Rethi Bowli Road, Mehdipatnam, Hyderabad 500028",
    latitude: 17.3916,
    longitude: 78.4419,
    contactPhone: "+91 98480 11010",
    isDemo: true,
    location: {
      latitude: 17.3916,
      longitude: 78.4419,
      sharingEnabled: true,
      accuracy: 7,
      source: "verified_location"
    },
    procurementProfile: {
      maximum_procurement_value: 48000,
      maximum_comfortable_quantity: 260,
      purchase_frequency: "Weekly",
      pooled_procurement_enabled: true,
      products_needed: [
        { product_name: "Freedom Sunflower Oil (15L)", typical_quantity: 16, unit: "tins" }
      ]
    }
  }
];
