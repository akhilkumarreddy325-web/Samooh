/**
 * Samooh Canonical Product Catalog
 * 
 * Hierarchical: Sector -> Product Group -> Product
 * Every product has a stable, canonical ID (e.g. 'grocery_rice_basmati')
 * that remains constant across all user languages.
 * Search is strictly a lookup tool and NEVER creates arbitrary products.
 */

export const PRODUCT_CATALOG = [
  // ==========================================
  // 1. GROCERY / KIRANA
  // ==========================================
  // Grains & Cereals
  {
    id: 'grocery_rice_raw',
    name: 'Rice (Raw / Boiled)',
    sectorId: 'grocery',
    groupId: 'grains_cereals',
    groupName: 'Grains & Cereals',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'bags (50kg)', 'quintal'],
    translations: {
      en: 'Rice (Raw / Boiled)',
      hi: 'चावल (कच्चा / उबला)',
      te: 'బియ్యం (ముడి / ఉడికించిన)',
      ta: 'அரிசி (பச்சரிசி / புழுங்கல்)',
      kn: 'ಅಕ್ಕಿ (ಕಚ್ಚಾ / ಬೇಯಿಸಿದ)',
      mr: 'तांदूळ (कच्चा / उकडा)'
    }
  },
  {
    id: 'grocery_wheat_whole',
    name: 'Wheat',
    sectorId: 'grocery',
    groupId: 'grains_cereals',
    groupName: 'Grains & Cereals',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'bags (50kg)', 'quintal'],
    translations: {
      en: 'Wheat',
      hi: 'गेहूं',
      te: 'గోధుమలు',
      ta: 'கோதுமை',
      kn: 'ಗೋಧಿ',
      mr: 'गहू'
    }
  },
  {
    id: 'grocery_rice_basmati',
    name: 'Basmati Rice',
    sectorId: 'grocery',
    groupId: 'grains_cereals',
    groupName: 'Grains & Cereals',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'bags (50kg)'],
    translations: {
      en: 'Basmati Rice',
      hi: 'बासमती चावल',
      te: 'బాస్మతి బియ్యం',
      ta: 'பாஸ்மதி அரிசி',
      kn: 'ಬಾಸ್ಮತಿ ಅಕ್ಕಿ',
      mr: 'बासमती तांदूळ'
    }
  },
  {
    id: 'grocery_rice_sona_masuri',
    name: 'Sona Masuri Rice',
    sectorId: 'grocery',
    groupId: 'grains_cereals',
    groupName: 'Grains & Cereals',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'bags (50kg)'],
    translations: {
      en: 'Sona Masuri Rice',
      hi: 'सोना मसूरी चावल',
      te: 'సోనా మసూరి బియ్యం',
      ta: 'சோனா மசூரி அரிசி',
      kn: 'ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ',
      mr: 'सोना मसुरी तांदूळ'
    }
  },
  {
    id: 'grocery_atta_wheat_flour',
    name: 'Wheat Flour / Atta',
    sectorId: 'grocery',
    groupId: 'grains_cereals',
    groupName: 'Grains & Cereals',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (10kg)', 'bags (25kg)', 'bags (50kg)'],
    translations: {
      en: 'Wheat Flour / Atta',
      hi: 'गेहूं का आटा',
      te: 'గోధుమ పిండి / అట్టా',
      ta: 'கோதுமை மாவு / ஆட்டா',
      kn: 'ಗೋಧಿ ಹಿಟ್ಟು / ಆಟಾ',
      mr: 'गव्हाचे पीठ / आटा'
    }
  },
  {
    id: 'grocery_maida',
    name: 'Maida',
    sectorId: 'grocery',
    groupId: 'grains_cereals',
    groupName: 'Grains & Cereals',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'bags (50kg)'],
    translations: {
      en: 'Maida',
      hi: 'मैदा',
      te: 'మైదా',
      ta: 'மைதா',
      kn: 'ಮೈದಾ',
      mr: 'मैदा'
    }
  },
  {
    id: 'grocery_rava_semolina',
    name: 'Rava / Semolina',
    sectorId: 'grocery',
    groupId: 'grains_cereals',
    groupName: 'Grains & Cereals',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'packets'],
    translations: {
      en: 'Rava / Semolina',
      hi: 'सूजी / रवा',
      te: 'రవ్వ / ఉప్మా రవ్వ',
      ta: 'ரவை',
      kn: 'ರವೆ',
      mr: 'रवा'
    }
  },
  {
    id: 'grocery_poha',
    name: 'Poha',
    sectorId: 'grocery',
    groupId: 'grains_cereals',
    groupName: 'Grains & Cereals',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'packets'],
    translations: {
      en: 'Poha',
      hi: 'पोहा',
      te: 'అటుకులు',
      ta: 'அவல்',
      kn: 'ಅವಲಕ್ಕಿ',
      mr: 'पोहे'
    }
  },
  {
    id: 'grocery_oats',
    name: 'Oats',
    sectorId: 'grocery',
    groupId: 'grains_cereals',
    groupName: 'Grains & Cereals',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'cartons', 'packets'],
    translations: {
      en: 'Oats',
      hi: 'ओट्स',
      te: 'ఓట్స్',
      ta: 'ஓட்ஸ்',
      kn: 'ಓಟ್ಸ್',
      mr: 'ओट्स'
    }
  },

  // Pulses
  {
    id: 'grocery_dal_toor',
    name: 'Toor Dal',
    sectorId: 'grocery',
    groupId: 'pulses',
    groupName: 'Pulses',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'bags (50kg)'],
    translations: {
      en: 'Toor Dal',
      hi: 'अरहर / तूर दाल',
      te: 'కందిపప్పు',
      ta: 'துவரம் பருப்பு',
      kn: 'ತೊಗರಿ ಬೇಳೆ',
      mr: 'तूर डाळ'
    }
  },
  {
    id: 'grocery_dal_moong',
    name: 'Moong Dal',
    sectorId: 'grocery',
    groupId: 'pulses',
    groupName: 'Pulses',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'bags (50kg)'],
    translations: {
      en: 'Moong Dal',
      hi: 'मूंग दाल',
      te: 'పెసరపప్పు',
      ta: 'பாசிப் பருப்பு',
      kn: 'ಹೆಸರು ಬೇಳೆ',
      mr: 'मूग डाळ'
    }
  },
  {
    id: 'grocery_dal_chana',
    name: 'Chana Dal',
    sectorId: 'grocery',
    groupId: 'pulses',
    groupName: 'Pulses',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'bags (50kg)'],
    translations: {
      en: 'Chana Dal',
      hi: 'चना दाल',
      te: 'శనగపప్పు',
      ta: 'கடலைப் பருப்பு',
      kn: 'ಕಡಲೆ ಬೇಳೆ',
      mr: 'हरभरा डाळ'
    }
  },
  {
    id: 'grocery_dal_urad',
    name: 'Urad Dal',
    sectorId: 'grocery',
    groupId: 'pulses',
    groupName: 'Pulses',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'bags (50kg)'],
    translations: {
      en: 'Urad Dal',
      hi: 'उड़द दाल',
      te: 'మినపపప్పు',
      ta: 'உளுத்தம் பருப்பு',
      kn: 'ಉದ್ದಿನ ಬೇಳೆ',
      mr: 'उडीद डाळ'
    }
  },
  {
    id: 'grocery_dal_masoor',
    name: 'Masoor Dal',
    sectorId: 'grocery',
    groupId: 'pulses',
    groupName: 'Pulses',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'bags (50kg)'],
    translations: {
      en: 'Masoor Dal',
      hi: 'मसूर दाल',
      te: 'ఎర్రకందిపప్పు',
      ta: 'மைசூர் பருப்பு',
      kn: 'ಮಸೂರ ಬೇಳೆ',
      mr: 'मसूर डाळ'
    }
  },
  {
    id: 'grocery_rajma',
    name: 'Rajma',
    sectorId: 'grocery',
    groupId: 'pulses',
    groupName: 'Pulses',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)'],
    translations: {
      en: 'Rajma',
      hi: 'राजमा',
      te: 'రాజ్మా',
      ta: 'ராஜ்மா',
      kn: 'ರಾಜ್ಮಾ',
      mr: 'राजमा'
    }
  },
  {
    id: 'grocery_chickpeas',
    name: 'Chickpeas',
    sectorId: 'grocery',
    groupId: 'pulses',
    groupName: 'Pulses',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'bags (50kg)'],
    translations: {
      en: 'Chickpeas',
      hi: 'सफेद चना / काबुली चना',
      te: 'కాబూలీ శనగలు',
      ta: 'கொண்டைக்கடலை',
      kn: 'ಕಡಲೆ ಕಾಳು',
      mr: 'काबुली चणे'
    }
  },

  // Spices
  {
    id: 'grocery_spice_turmeric',
    name: 'Turmeric',
    sectorId: 'grocery',
    groupId: 'spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'packets (1kg)', 'bags (25kg)'],
    translations: {
      en: 'Turmeric',
      hi: 'हल्दी पाउडर',
      te: 'పసుపు',
      ta: 'மஞ்சள் தூள்',
      kn: 'ಅರಿಶಿನ',
      mr: 'हळद'
    }
  },
  {
    id: 'grocery_spice_red_chilli',
    name: 'Red Chilli Powder',
    sectorId: 'grocery',
    groupId: 'spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'packets (1kg)', 'bags (25kg)'],
    translations: {
      en: 'Red Chilli Powder',
      hi: 'लाल मिर्च पाउडर',
      te: 'కారం పొడి',
      ta: 'மிளகாய் தூள்',
      kn: 'ಖಾರದ ಪುಡಿ',
      mr: 'लाल तिखट'
    }
  },
  {
    id: 'grocery_spice_coriander',
    name: 'Coriander Powder',
    sectorId: 'grocery',
    groupId: 'spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'packets (1kg)', 'bags (25kg)'],
    translations: {
      en: 'Coriander Powder',
      hi: 'धनिया पाउडर',
      te: 'ధనియాల పొడి',
      ta: 'மல்லி தூள்',
      kn: 'ಕೊತ್ತಂಬರಿ ಪುಡಿ',
      mr: 'धने पावडर'
    }
  },
  {
    id: 'grocery_spice_cumin',
    name: 'Cumin',
    sectorId: 'grocery',
    groupId: 'spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'packets (1kg)', 'bags (25kg)'],
    translations: {
      en: 'Cumin',
      hi: 'जीरा',
      te: 'జీలకర్ర',
      ta: 'சீரகம்',
      kn: 'ಜೀರಿಗೆ',
      mr: 'जिरे'
    }
  },
  {
    id: 'grocery_spice_black_pepper',
    name: 'Black Pepper',
    sectorId: 'grocery',
    groupId: 'spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'packets (1kg)'],
    translations: {
      en: 'Black Pepper',
      hi: 'काली मिर्च',
      te: 'మిరియాలు',
      ta: 'மிளகு',
      kn: 'ಕಾಳುಮೆಣಸು',
      mr: 'काळी मिरी'
    }
  },
  {
    id: 'grocery_spice_mustard',
    name: 'Mustard Seeds',
    sectorId: 'grocery',
    groupId: 'spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)'],
    translations: {
      en: 'Mustard Seeds',
      hi: 'राई / सरसों',
      te: 'ఆవాలు',
      ta: 'கடுகு',
      kn: 'ಸಾಸಿವೆ',
      mr: 'मोहरी'
    }
  },
  {
    id: 'grocery_spice_garam_masala',
    name: 'Garam Masala',
    sectorId: 'grocery',
    groupId: 'spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'cartons', 'packets'],
    translations: {
      en: 'Garam Masala',
      hi: 'गरम मसाला',
      te: 'గరం మసాలా',
      ta: 'கரம் மசாலா',
      kn: 'ಗರಂ ಮಸಾಲಾ',
      mr: 'गरम मसाला'
    }
  },

  // Cooking Essentials
  {
    id: 'grocery_oil_cooking',
    name: 'Cooking Oil',
    sectorId: 'grocery',
    groupId: 'cooking_essentials',
    groupName: 'Cooking Essentials',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'tins (15L)', 'cartons (1L x 12)'],
    translations: {
      en: 'Cooking Oil',
      hi: 'खाना पकाने का तेल',
      te: 'వంట నూనె',
      ta: 'சமையல் எண்ணெய்',
      kn: 'ಅಡುಗೆ ಎಣ್ಣೆ',
      mr: 'खाद्यतेल'
    }
  },
  {
    id: 'grocery_oil_sunflower',
    name: 'Sunflower Oil',
    sectorId: 'grocery',
    groupId: 'cooking_essentials',
    groupName: 'Cooking Essentials',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'tins (15L)', 'cartons (1L x 12)'],
    translations: {
      en: 'Sunflower Oil',
      hi: 'सूरजमुखी का तेल',
      te: 'పొద్దుతిరుగుడు నూనె',
      ta: 'சூரியகாந்தி எண்ணெய்',
      kn: 'ಸೂರ್ಯಕಾಂತಿ ಎಣ್ಣೆ',
      mr: 'सूर्यफूल तेल'
    }
  },
  {
    id: 'grocery_oil_groundnut',
    name: 'Groundnut Oil',
    sectorId: 'grocery',
    groupId: 'cooking_essentials',
    groupName: 'Cooking Essentials',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'tins (15L)', 'cartons (1L x 12)'],
    translations: {
      en: 'Groundnut Oil',
      hi: 'मूंगफली का तेल',
      te: 'వేరుశనగ నూనె',
      ta: 'கடலை எண்ணெய்',
      kn: 'ಕಡಲೆಕಾಯಿ ಎಣ್ಣೆ',
      mr: 'शेंगदाणा तेल'
    }
  },
  {
    id: 'grocery_ghee',
    name: 'Ghee',
    sectorId: 'grocery',
    groupId: 'cooking_essentials',
    groupName: 'Cooking Essentials',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'tins (15kg)', 'cartons'],
    translations: {
      en: 'Ghee',
      hi: 'शुद्ध घी',
      te: 'నెయ్యి',
      ta: 'நெய்',
      kn: 'ತುಪ್ಪ',
      mr: 'तूप'
    }
  },
  {
    id: 'grocery_salt',
    name: 'Salt',
    sectorId: 'grocery',
    groupId: 'cooking_essentials',
    groupName: 'Cooking Essentials',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (50kg)', 'cartons (1kg x 25)'],
    translations: {
      en: 'Salt',
      hi: 'नमक',
      te: 'ఉప్పు',
      ta: 'உப்பு',
      kn: 'ಉಪ್ಪು',
      mr: 'मीठ'
    }
  },
  {
    id: 'grocery_sugar',
    name: 'Sugar',
    sectorId: 'grocery',
    groupId: 'cooking_essentials',
    groupName: 'Cooking Essentials',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (50kg)', 'quintal'],
    translations: {
      en: 'Sugar',
      hi: 'चीनी / शक्कर',
      te: 'పంచదార',
      ta: 'சர்க்கரை',
      kn: 'ಸಕ್ಕರೆ',
      mr: 'साखर'
    }
  },

  // Beverages
  {
    id: 'grocery_tea_powder',
    name: 'Tea Powder',
    sectorId: 'grocery',
    groupId: 'beverages',
    groupName: 'Beverages',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (20kg)', 'cartons'],
    translations: {
      en: 'Tea Powder',
      hi: 'चाय पत्ती',
      te: 'టీ పొడి',
      ta: 'தேயிலை தூள்',
      kn: 'ಟೀ ಪುಡಿ',
      mr: 'चहा पावडर'
    }
  },
  {
    id: 'grocery_coffee',
    name: 'Coffee',
    sectorId: 'grocery',
    groupId: 'beverages',
    groupName: 'Beverages',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'cartons', 'packets'],
    translations: {
      en: 'Coffee',
      hi: 'कॉफी पाउडर',
      te: 'కాఫీ పొడి',
      ta: 'காபி தூள்',
      kn: 'ಕಾಫಿ ಪುಡಿ',
      mr: 'कॉफी पावडर'
    }
  },
  {
    id: 'grocery_soft_drinks',
    name: 'Soft Drinks',
    sectorId: 'grocery',
    groupId: 'beverages',
    groupName: 'Beverages',
    unitType: 'count',
    defaultUnit: 'cartons',
    allowedUnits: ['cartons', 'crates', 'bottles'],
    translations: {
      en: 'Soft Drinks',
      hi: 'शीतल पेय',
      te: 'కూల్ డ్రింక్స్',
      ta: 'குளிர் பானங்கள்',
      kn: 'ತಂಪು ಪಾನೀಯಗಳು',
      mr: 'शीतपेये'
    }
  },
  {
    id: 'grocery_packaged_water',
    name: 'Packaged Water',
    sectorId: 'grocery',
    groupId: 'beverages',
    groupName: 'Beverages',
    unitType: 'count',
    defaultUnit: 'cartons',
    allowedUnits: ['cartons', 'crates', 'cases (24 bottles)'],
    translations: {
      en: 'Packaged Water',
      hi: 'पैकेज्ड पानी',
      te: 'మినరల్ వాటర్',
      ta: 'பாட்டில் தண்ணீர்',
      kn: 'ಬಾಟಲ್ ನೀರು',
      mr: 'बाटलीबंद पाणी'
    }
  },

  // Household Essentials
  {
    id: 'grocery_detergent',
    name: 'Detergent',
    sectorId: 'grocery',
    groupId: 'household_essentials',
    groupName: 'Household Essentials',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'cartons', 'bags (25kg)'],
    translations: {
      en: 'Detergent',
      hi: 'डिटर्जेंट पाउडर',
      te: 'డిటర్జెంట్ పౌడర్',
      ta: 'சலவை தூள்',
      kn: 'ಡಿಟರ್ಜೆಂಟ್ ಪೌಡರ್',
      mr: 'डिटर्जंट पावडर'
    }
  },
  {
    id: 'grocery_dishwash',
    name: 'Dishwashing Liquid',
    sectorId: 'grocery',
    groupId: 'household_essentials',
    groupName: 'Household Essentials',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'cartons', 'bottles'],
    translations: {
      en: 'Dishwashing Liquid',
      hi: 'डिशवॉश लिक्विड / साबुन',
      te: 'డిష్‌వాష్ లిక్విడ్',
      ta: 'பாத்திரம் கழுவும் திரவம்',
      kn: 'ಪಾತ್ರೆ ತೊಳೆಯುವ ದ್ರವ',
      mr: 'भांडी धुण्याचे लिक्विड'
    }
  },
  {
    id: 'grocery_soap',
    name: 'Soap',
    sectorId: 'grocery',
    groupId: 'household_essentials',
    groupName: 'Household Essentials',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'cartons', 'dozens'],
    translations: {
      en: 'Soap',
      hi: 'नहाने का साबुन',
      te: 'సబ్బు',
      ta: 'சோப்பு',
      kn: 'ಸಾಬೂನು',
      mr: 'अंघोळीचा साबण'
    }
  },
  {
    id: 'grocery_floor_cleaner',
    name: 'Floor Cleaner',
    sectorId: 'grocery',
    groupId: 'household_essentials',
    groupName: 'Household Essentials',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'cartons', 'bottles'],
    translations: {
      en: 'Floor Cleaner',
      hi: 'फ्लोर क्लीनर',
      te: 'ఫ్లోర్ క్లీనర్',
      ta: 'தரை துடைப்பான் திரவம்',
      kn: 'ನೆಲ ಸ್ವಚ್ಛಗೊಳಿಸುವ ದ್ರವ',
      mr: 'फ्लोअर क्लिनर'
    }
  },
  {
    id: 'grocery_toilet_cleaner',
    name: 'Toilet Cleaner',
    sectorId: 'grocery',
    groupId: 'household_essentials',
    groupName: 'Household Essentials',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'cartons', 'bottles'],
    translations: {
      en: 'Toilet Cleaner',
      hi: 'टॉयलेट क्लीनर',
      te: 'టాయిలెట్ క్లీనర్',
      ta: 'கழிவறை சுத்தப்படுத்தி',
      kn: 'ಟಾಯ್ಲೆಟ್ ಕ್ಲೀನರ್',
      mr: 'टॉयलेट क्लिनर'
    }
  },

  // Snacks & Packaged Food
  {
    id: 'grocery_biscuits',
    name: 'Biscuits',
    sectorId: 'grocery',
    groupId: 'snacks_packaged',
    groupName: 'Snacks & Packaged Food',
    unitType: 'count',
    defaultUnit: 'cartons',
    allowedUnits: ['cartons', 'boxes', 'packets'],
    translations: {
      en: 'Biscuits',
      hi: 'बिस्कुट',
      te: 'బిస్కెట్లు',
      ta: 'பிஸ்கட்',
      kn: 'ಬಿಸ್ಕತ್',
      mr: 'बिस्किटे'
    }
  },
  {
    id: 'grocery_chips',
    name: 'Chips',
    sectorId: 'grocery',
    groupId: 'snacks_packaged',
    groupName: 'Snacks & Packaged Food',
    unitType: 'count',
    defaultUnit: 'cartons',
    allowedUnits: ['cartons', 'boxes', 'packets'],
    translations: {
      en: 'Chips',
      hi: 'चिप्स / नमकीन',
      te: 'చిప్స్',
      ta: 'சிப்ஸ்',
      kn: 'ಚಿಪ್ಸ್',
      mr: 'वेफर्स / चिप्स'
    }
  },
  {
    id: 'grocery_noodles',
    name: 'Noodles',
    sectorId: 'grocery',
    groupId: 'snacks_packaged',
    groupName: 'Snacks & Packaged Food',
    unitType: 'count',
    defaultUnit: 'cartons',
    allowedUnits: ['cartons', 'boxes', 'packets'],
    translations: {
      en: 'Noodles',
      hi: 'नूडल्स',
      te: 'నూడుల్స్',
      ta: 'நூடுல்ஸ்',
      kn: 'ನೂಡಲ್ಸ್',
      mr: 'नुडल्स'
    }
  },
  {
    id: 'grocery_packaged_snacks',
    name: 'Packaged Snacks',
    sectorId: 'grocery',
    groupId: 'snacks_packaged',
    groupName: 'Snacks & Packaged Food',
    unitType: 'count',
    defaultUnit: 'cartons',
    allowedUnits: ['cartons', 'boxes', 'packets'],
    translations: {
      en: 'Packaged Snacks',
      hi: 'पैकेज्ड स्नैक्स',
      te: 'ప్యాక్ చేసిన స్నాక్స్',
      ta: 'திண்பண்டங்கள்',
      kn: 'ತಿಂಡಿಗಳು',
      mr: 'पॅक केलेले स्नॅक्स'
    }
  },

  // ==========================================
  // 2. BAKERY
  // ==========================================
  // Ingredients
  {
    id: 'bakery_flour_wheat',
    name: 'Wheat Flour',
    sectorId: 'bakery',
    groupId: 'bakery_ingredients',
    groupName: 'Ingredients',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'bags (50kg)'],
    translations: {
      en: 'Wheat Flour',
      hi: 'गेहूं का आटा',
      te: 'గోధుమ పిండి',
      ta: 'கோதுமை மாவு',
      kn: 'ಗೋಧಿ ಹಿಟ್ಟು',
      mr: 'गव्हाचे पीठ'
    }
  },
  {
    id: 'bakery_maida',
    name: 'Maida',
    sectorId: 'bakery',
    groupId: 'bakery_ingredients',
    groupName: 'Ingredients',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (50kg)'],
    translations: {
      en: 'Maida',
      hi: 'मैदा',
      te: 'మైదా',
      ta: 'மைதா',
      kn: 'ಮೈದಾ',
      mr: 'मैदा'
    }
  },
  {
    id: 'bakery_sugar',
    name: 'Sugar',
    sectorId: 'bakery',
    groupId: 'bakery_ingredients',
    groupName: 'Ingredients',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (50kg)'],
    translations: {
      en: 'Sugar',
      hi: 'चीनी',
      te: 'పంచదార',
      ta: 'சர்க்கரை',
      kn: 'ಸಕ್ಕರೆ',
      mr: 'साखर'
    }
  },
  {
    id: 'bakery_butter',
    name: 'Butter',
    sectorId: 'bakery',
    groupId: 'bakery_ingredients',
    groupName: 'Ingredients',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'cartons (10kg)', 'boxes'],
    translations: {
      en: 'Butter',
      hi: 'मक्खन',
      te: 'వెన్న',
      ta: 'வெண்ணெய்',
      kn: 'ಬೆಣ್ಣೆ',
      mr: 'लोणी'
    }
  },
  {
    id: 'bakery_milk',
    name: 'Milk',
    sectorId: 'bakery',
    groupId: 'bakery_ingredients',
    groupName: 'Ingredients',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'crates'],
    translations: {
      en: 'Milk',
      hi: 'दूध',
      te: 'పాలు',
      ta: 'பால்',
      kn: 'ಹಾಲು',
      mr: 'दूध'
    }
  },
  {
    id: 'bakery_yeast',
    name: 'Yeast',
    sectorId: 'bakery',
    groupId: 'bakery_ingredients',
    groupName: 'Ingredients',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'packets (500g)', 'boxes'],
    translations: {
      en: 'Yeast',
      hi: 'यीस्ट / खमीर',
      te: 'ఈస్ట్',
      ta: 'ஈஸ்ட்',
      kn: 'ಯೀಸ್ಟ್',
      mr: 'यीस्ट'
    }
  },
  {
    id: 'bakery_cocoa_powder',
    name: 'Cocoa Powder',
    sectorId: 'bakery',
    groupId: 'bakery_ingredients',
    groupName: 'Ingredients',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'boxes', 'cartons'],
    translations: {
      en: 'Cocoa Powder',
      hi: 'कोको पाउडर',
      te: 'కోకో పౌడర్',
      ta: 'கோகோ தூள்',
      kn: 'ಕೋಕೋ ಪುಡಿ',
      mr: 'कोको पावडर'
    }
  },
  {
    id: 'bakery_baking_powder',
    name: 'Baking Powder',
    sectorId: 'bakery',
    groupId: 'bakery_ingredients',
    groupName: 'Ingredients',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'tins', 'cartons'],
    translations: {
      en: 'Baking Powder',
      hi: 'बेकिंग पाउडर',
      te: 'బేకింగ్ పౌడర్',
      ta: 'பேக்கிங் பவுடர்',
      kn: 'ಬೇಕಿಂಗ್ ಪೌಡರ್',
      mr: 'बेकिंग पावडर'
    }
  },
  {
    id: 'bakery_oil',
    name: 'Cooking Oil',
    sectorId: 'bakery',
    groupId: 'bakery_ingredients',
    groupName: 'Ingredients',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'tins (15L)'],
    translations: {
      en: 'Cooking Oil',
      hi: 'तेल',
      te: 'వంట నూనె',
      ta: 'சமையல் எண்ணெய்',
      kn: 'ಎಣ್ಣೆ',
      mr: 'खाद्यतेल'
    }
  },

  // Products
  {
    id: 'bakery_bread',
    name: 'Bread',
    sectorId: 'bakery',
    groupId: 'bakery_products',
    groupName: 'Products',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'crates', 'dozens'],
    translations: {
      en: 'Bread',
      hi: 'ब्रेड / पाव',
      te: 'రొట్టె / బ్రెడ్',
      ta: 'ரொட்டி',
      kn: 'ಬ್ರೆಡ್',
      mr: 'ब्रेड / पाव'
    }
  },
  {
    id: 'bakery_buns',
    name: 'Buns',
    sectorId: 'bakery',
    groupId: 'bakery_products',
    groupName: 'Products',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'dozens', 'packs'],
    translations: {
      en: 'Buns',
      hi: 'बन / पाव',
      te: 'బన్స్',
      ta: 'பன்',
      kn: 'ಬನ್ಗಳು',
      mr: 'बन पाव'
    }
  },
  {
    id: 'bakery_cakes',
    name: 'Cakes',
    sectorId: 'bakery',
    groupId: 'bakery_products',
    groupName: 'Products',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'kg', 'boxes'],
    translations: {
      en: 'Cakes',
      hi: 'केक',
      te: 'కేకులు',
      ta: 'கேக்குகள்',
      kn: 'ಕೇಕ್ಗಳು',
      mr: 'केक'
    }
  },
  {
    id: 'bakery_biscuits',
    name: 'Biscuits',
    sectorId: 'bakery',
    groupId: 'bakery_products',
    groupName: 'Products',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'cartons', 'boxes'],
    translations: {
      en: 'Biscuits',
      hi: 'बिस्कुट',
      te: 'బిస్కెట్లు',
      ta: 'பிஸ்கட்',
      kn: 'ಬಿಸ್ಕತ್',
      mr: 'बिस्किटे'
    }
  },
  {
    id: 'bakery_cookies',
    name: 'Cookies',
    sectorId: 'bakery',
    groupId: 'bakery_products',
    groupName: 'Products',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'boxes', 'cartons'],
    translations: {
      en: 'Cookies',
      hi: 'कुकीज',
      te: 'కుకీలు',
      ta: 'குக்கீகள்',
      kn: 'ಕುಕೀಸ್',
      mr: 'कुकीज'
    }
  },
  {
    id: 'bakery_pastries',
    name: 'Pastries',
    sectorId: 'bakery',
    groupId: 'bakery_products',
    groupName: 'Products',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'dozens', 'boxes'],
    translations: {
      en: 'Pastries',
      hi: 'पेस्ट्री',
      te: 'పేస్ట్రీలు',
      ta: 'பேஸ்ட்ரிகள்',
      kn: 'ಪೇಸ್ಟ್ರಿಗಳು',
      mr: 'पेस्ट्री'
    }
  },

  // ==========================================
  // 3. RESTAURANT / FOOD SERVICE
  // ==========================================
  // Staples
  {
    id: 'restaurant_rice',
    name: 'Rice',
    sectorId: 'restaurant',
    groupId: 'restaurant_staples',
    groupName: 'Staples',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (50kg)', 'quintal'],
    translations: { en: 'Rice', hi: 'चावल', te: 'బియ్యం', ta: 'அரிசி', kn: 'ಅಕ್ಕಿ', mr: 'तांदूळ' }
  },
  {
    id: 'restaurant_wheat_flour',
    name: 'Wheat Flour',
    sectorId: 'restaurant',
    groupId: 'restaurant_staples',
    groupName: 'Staples',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (50kg)'],
    translations: { en: 'Wheat Flour', hi: 'आटा', te: 'గోధుమ పిండి', ta: 'கோதுமை மாவு', kn: 'ಗೋಧಿ ಹಿಟ್ಟು', mr: 'गव्हाचे पीठ' }
  },
  {
    id: 'restaurant_oil',
    name: 'Cooking Oil',
    sectorId: 'restaurant',
    groupId: 'restaurant_staples',
    groupName: 'Staples',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'tins (15L)'],
    translations: { en: 'Cooking Oil', hi: 'तेल', te: 'వంట నూనె', ta: 'சமையல் எண்ணெய்', kn: 'ಅಡುಗೆ ಎಣ್ಣೆ', mr: 'खाद्यतेल' }
  },
  {
    id: 'restaurant_sugar',
    name: 'Sugar',
    sectorId: 'restaurant',
    groupId: 'restaurant_staples',
    groupName: 'Staples',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (50kg)'],
    translations: { en: 'Sugar', hi: 'चीनी', te: 'పంచదార', ta: 'சர்க்கரை', kn: 'ಸಕ್ಕರೆ', mr: 'साखर' }
  },
  {
    id: 'restaurant_salt',
    name: 'Salt',
    sectorId: 'restaurant',
    groupId: 'restaurant_staples',
    groupName: 'Staples',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (50kg)'],
    translations: { en: 'Salt', hi: 'नमक', te: 'ఉప్పు', ta: 'உப்பு', kn: 'ಉಪ್ಪು', mr: 'मीठ' }
  },

  // Spices
  {
    id: 'restaurant_turmeric',
    name: 'Turmeric',
    sectorId: 'restaurant',
    groupId: 'restaurant_spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)'],
    translations: { en: 'Turmeric', hi: 'हल्दी', te: 'పసుపు', ta: 'மஞ்சள்', kn: 'ಅರಿಶಿನ', mr: 'हळद' }
  },
  {
    id: 'restaurant_chilli_powder',
    name: 'Chilli Powder',
    sectorId: 'restaurant',
    groupId: 'restaurant_spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)'],
    translations: { en: 'Chilli Powder', hi: 'मिर्च पाउडर', te: 'కారం', ta: 'மிளகாய் தூள்', kn: 'ಖಾರದ ಪುಡಿ', mr: 'तिखट' }
  },
  {
    id: 'restaurant_coriander',
    name: 'Coriander',
    sectorId: 'restaurant',
    groupId: 'restaurant_spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)'],
    translations: { en: 'Coriander', hi: 'धनिया', te: 'ధనియాల పొడి', ta: 'மல்லி', kn: 'ಕೊತ್ತಂಬರಿ', mr: 'धने' }
  },
  {
    id: 'restaurant_cumin',
    name: 'Cumin',
    sectorId: 'restaurant',
    groupId: 'restaurant_spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)'],
    translations: { en: 'Cumin', hi: 'जीरा', te: 'జీలకర్ర', ta: 'சீரகம்', kn: 'ಜೀರಿಗೆ', mr: 'जिरे' }
  },
  {
    id: 'restaurant_garam_masala',
    name: 'Garam Masala',
    sectorId: 'restaurant',
    groupId: 'restaurant_spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'cartons'],
    translations: { en: 'Garam Masala', hi: 'गरम मसाला', te: 'గరం మసాలా', ta: 'கரம் மசாலா', kn: 'ಗರಂ ಮಸಾಲಾ', mr: 'गरम मसाला' }
  },
  {
    id: 'restaurant_black_pepper',
    name: 'Black Pepper',
    sectorId: 'restaurant',
    groupId: 'restaurant_spices',
    groupName: 'Spices',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'packets'],
    translations: { en: 'Black Pepper', hi: 'काली मिर्च', te: 'మిరియాలు', ta: 'மிளகு', kn: 'ಕಾಳುಮೆಣಸು', mr: 'काळी मिरी' }
  },

  // Ingredients
  {
    id: 'restaurant_vegetables',
    name: 'Vegetables',
    sectorId: 'restaurant',
    groupId: 'restaurant_ingredients',
    groupName: 'Ingredients',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'crates', 'quintal'],
    translations: { en: 'Vegetables', hi: 'ताज़ी सब्ज़ियाँ', te: 'కూరగాయలు', ta: 'காய்கறிகள்', kn: 'ತರಕಾರಿಗಳು', mr: 'भाज्या' }
  },
  {
    id: 'restaurant_pulses',
    name: 'Pulses',
    sectorId: 'restaurant',
    groupId: 'restaurant_ingredients',
    groupName: 'Ingredients',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (50kg)'],
    translations: { en: 'Pulses', hi: 'दालें', te: 'పప్పులు', ta: 'பருப்பு வகைகள்', kn: 'ಕಾಳುಗಳು', mr: 'डाळी' }
  },
  {
    id: 'restaurant_dairy',
    name: 'Dairy',
    sectorId: 'restaurant',
    groupId: 'restaurant_ingredients',
    groupName: 'Ingredients',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'litres', 'crates'],
    translations: { en: 'Dairy (Milk/Paneer)', hi: 'डेयरी उत्पाद', te: 'డైరీ ఉత్పత్తులు', ta: 'பால் பொருட்கள்', kn: 'ಡೈರಿ ಉತ್ಪನ್ನಗಳು', mr: 'दुग्ध उत्पादने' }
  },
  {
    id: 'restaurant_meat_poultry',
    name: 'Meat/Poultry',
    sectorId: 'restaurant',
    groupId: 'restaurant_ingredients',
    groupName: 'Ingredients',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'crates'],
    translations: { en: 'Meat/Poultry', hi: 'चिकन / मटन / अंडे', te: 'మాంసం / చికెన్', ta: 'இறைச்சி / கோழி', kn: 'ಮಾಂಸ / ಕೋಳಿ', mr: 'मांस / चिकन' }
  },

  // ==========================================
  // 4. TEA & BEVERAGES
  // ==========================================
  {
    id: 'tea_powder',
    name: 'Tea Powder',
    sectorId: 'tea_beverages',
    groupId: 'tea_supplies',
    groupName: 'Beverage Supplies',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (20kg)', 'cartons'],
    translations: { en: 'Tea Powder', hi: 'चाय पत्ती', te: 'టీ పొడి', ta: 'தேயிலை தூள்', kn: 'ಟೀ ಪುಡಿ', mr: 'चहा पावडर' }
  },
  {
    id: 'tea_coffee',
    name: 'Coffee',
    sectorId: 'tea_beverages',
    groupId: 'tea_supplies',
    groupName: 'Beverage Supplies',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'cartons', 'packets'],
    translations: { en: 'Coffee', hi: 'कॉफी पाउडर', te: 'కాఫీ పొడి', ta: 'காபி தூள்', kn: 'ಕಾಫಿ ಪುಡಿ', mr: 'कॉफी पावडर' }
  },
  {
    id: 'tea_sugar',
    name: 'Sugar',
    sectorId: 'tea_beverages',
    groupId: 'tea_supplies',
    groupName: 'Beverage Supplies',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (50kg)'],
    translations: { en: 'Sugar', hi: 'चीनी', te: 'పంచదార', ta: 'சர்க்கரை', kn: 'ಸಕ್ಕರೆ', mr: 'साखर' }
  },
  {
    id: 'tea_milk',
    name: 'Milk',
    sectorId: 'tea_beverages',
    groupId: 'tea_supplies',
    groupName: 'Beverage Supplies',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'crates'],
    translations: { en: 'Milk', hi: 'दूध', te: 'పాలు', ta: 'பால்', kn: 'ಹಾಲು', mr: 'दूध' }
  },
  {
    id: 'tea_disposable_cups',
    name: 'Disposable Cups',
    sectorId: 'tea_beverages',
    groupId: 'tea_supplies',
    groupName: 'Beverage Supplies',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes (1000 pcs)', 'packets'],
    translations: { en: 'Disposable Cups', hi: 'डिस्पोजेबल कप', te: 'డిస్పోజబుల్ కప్పులు', ta: 'டிஸ்போசபிள் கப்புகள்', kn: 'ಬಿಸಾಡಬಹುದಾದ ಕಪ್‌ಗಳು', mr: 'डिस्पोजेबल कप' }
  },
  {
    id: 'tea_bottled_water',
    name: 'Bottled Water',
    sectorId: 'tea_beverages',
    groupId: 'tea_supplies',
    groupName: 'Beverage Supplies',
    unitType: 'count',
    defaultUnit: 'cartons',
    allowedUnits: ['cartons', 'crates', 'bottles'],
    translations: { en: 'Bottled Water', hi: 'बोतलबंद पानी', te: 'బాటిల్ వాటర్', ta: 'பாட்டில் தண்ணீர்', kn: 'ಬಾಟಲ್ ನೀರು', mr: 'बाटलीबंद पाणी' }
  },

  // ==========================================
  // 5. FRUITS & VEGETABLES
  // ==========================================
  {
    id: 'produce_tomato',
    name: 'Tomato',
    sectorId: 'fruits_vegetables',
    groupId: 'fresh_produce',
    groupName: 'Fresh Produce',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'crates (25kg)', 'quintal'],
    translations: { en: 'Tomato', hi: 'टमाटर', te: 'టమోటా', ta: 'தக்காளி', kn: 'ಟೊಮೆಟೊ', mr: 'टोमॅटो' }
  },
  {
    id: 'produce_potato',
    name: 'Potato',
    sectorId: 'fruits_vegetables',
    groupId: 'fresh_produce',
    groupName: 'Fresh Produce',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (50kg)', 'quintal'],
    translations: { en: 'Potato', hi: 'आलू', te: 'బంగాళాదుంప', ta: 'உருளைக்கிழங்கு', kn: 'ಆಲೂಗಡ್ಡೆ', mr: 'बटाटा' }
  },
  {
    id: 'produce_onion',
    name: 'Onion',
    sectorId: 'fruits_vegetables',
    groupId: 'fresh_produce',
    groupName: 'Fresh Produce',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (50kg)', 'quintal'],
    translations: { en: 'Onion', hi: 'प्याज', te: 'ఉల్లిపాయలు', ta: 'வெங்காயம்', kn: 'ಈರುಳ್ಳಿ', mr: 'कांदा' }
  },
  {
    id: 'produce_carrot',
    name: 'Carrot',
    sectorId: 'fruits_vegetables',
    groupId: 'fresh_produce',
    groupName: 'Fresh Produce',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'crates'],
    translations: { en: 'Carrot', hi: 'गाजर', te: 'క్యారెట్', ta: 'கேரட்', kn: 'ಕ್ಯಾರೆಟ್', mr: 'गाजर' }
  },
  {
    id: 'produce_cabbage',
    name: 'Cabbage',
    sectorId: 'fruits_vegetables',
    groupId: 'fresh_produce',
    groupName: 'Fresh Produce',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags', 'crates'],
    translations: { en: 'Cabbage', hi: 'पत्तागोभी', te: 'క్యాబేజీ', ta: 'முட்டைக்கோஸ்', kn: 'ಎಲೆಕೋಸು', mr: 'कोबी' }
  },
  {
    id: 'produce_cauliflower',
    name: 'Cauliflower',
    sectorId: 'fruits_vegetables',
    groupId: 'fresh_produce',
    groupName: 'Fresh Produce',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'crates', 'pieces'],
    translations: { en: 'Cauliflower', hi: 'फूलगोभी', te: 'కాలీఫ్లవర్', ta: 'காலிஃபிளவர்', kn: 'ಹೂಕೋಸು', mr: 'फ्लॉवर' }
  },
  {
    id: 'produce_green_chilli',
    name: 'Green Chilli',
    sectorId: 'fruits_vegetables',
    groupId: 'fresh_produce',
    groupName: 'Fresh Produce',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'crates', 'bags'],
    translations: { en: 'Green Chilli', hi: 'हरी मिर्च', te: 'పచ్చిమిర్చి', ta: 'பச்சை மிளகாய்', kn: 'ಹಸಿಮೆಣಸಿನಕಾಯಿ', mr: 'हिरवी मिरची' }
  },
  {
    id: 'produce_coriander',
    name: 'Coriander',
    sectorId: 'fruits_vegetables',
    groupId: 'fresh_produce',
    groupName: 'Fresh Produce',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bundles', 'crates'],
    translations: { en: 'Coriander', hi: 'हरा धनिया', te: 'కొత్తిమీర', ta: 'கொத்தமல்லி', kn: 'ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು', mr: 'कोथिंबीर' }
  },
  {
    id: 'produce_banana',
    name: 'Banana',
    sectorId: 'fruits_vegetables',
    groupId: 'fresh_produce',
    groupName: 'Fresh Produce',
    unitType: 'count',
    defaultUnit: 'dozens',
    allowedUnits: ['dozens', 'crates', 'kg'],
    translations: { en: 'Banana', hi: 'केला', te: 'అరటిపండ్లు', ta: 'வாழைப்பழம்', kn: 'ಬಾಳೆಹಣ್ಣು', mr: 'केळी' }
  },
  {
    id: 'produce_apple',
    name: 'Apple',
    sectorId: 'fruits_vegetables',
    groupId: 'fresh_produce',
    groupName: 'Fresh Produce',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'boxes (10kg)', 'crates'],
    translations: { en: 'Apple', hi: 'सेब', te: 'యాపిల్స్', ta: 'ஆப்பிள்', kn: 'ಸೇಬು', mr: 'सफरचंद' }
  },
  {
    id: 'produce_orange',
    name: 'Orange',
    sectorId: 'fruits_vegetables',
    groupId: 'fresh_produce',
    groupName: 'Fresh Produce',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'crates', 'dozens'],
    translations: { en: 'Orange', hi: 'संतरा', te: 'నారింజ', ta: 'ஆரஞ்சு', kn: 'ಕಿತ್ತಳೆ', mr: 'संत्री' }
  },

  // ==========================================
  // 6. DAIRY
  // ==========================================
  {
    id: 'dairy_milk',
    name: 'Milk',
    sectorId: 'dairy',
    groupId: 'dairy_products',
    groupName: 'Dairy Products',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'crates (20L)'],
    translations: { en: 'Milk', hi: 'दूध', te: 'పాలు', ta: 'பால்', kn: 'ಹಾಲು', mr: 'दूध' }
  },
  {
    id: 'dairy_curd',
    name: 'Curd',
    sectorId: 'dairy',
    groupId: 'dairy_products',
    groupName: 'Dairy Products',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'tubs', 'crates'],
    translations: { en: 'Curd', hi: 'दही', te: 'పెరుగు', ta: 'தயிர்', kn: 'ಮೊಸರು', mr: 'दही' }
  },
  {
    id: 'dairy_paneer',
    name: 'Paneer',
    sectorId: 'dairy',
    groupId: 'dairy_products',
    groupName: 'Dairy Products',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'packs', 'boxes'],
    translations: { en: 'Paneer', hi: 'पनीर', te: 'పనీర్', ta: 'பன்னீர்', kn: 'ಪನೀರ್', mr: 'पनीर' }
  },
  {
    id: 'dairy_butter',
    name: 'Butter',
    sectorId: 'dairy',
    groupId: 'dairy_products',
    groupName: 'Dairy Products',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'cartons'],
    translations: { en: 'Butter', hi: 'मक्खन', te: 'వెన్న', ta: 'வெண்ணெய்', kn: 'ಬೆಣ್ಣೆ', mr: 'लोणी' }
  },
  {
    id: 'dairy_ghee',
    name: 'Ghee',
    sectorId: 'dairy',
    groupId: 'dairy_products',
    groupName: 'Dairy Products',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'tins (15kg)', 'cartons'],
    translations: { en: 'Ghee', hi: 'घी', te: 'నెయ్యి', ta: 'நெய்', kn: 'ತುಪ್ಪ', mr: 'तूप' }
  },
  {
    id: 'dairy_cheese',
    name: 'Cheese',
    sectorId: 'dairy',
    groupId: 'dairy_products',
    groupName: 'Dairy Products',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'cartons', 'packs'],
    translations: { en: 'Cheese', hi: 'चीज', te: 'చీజ్', ta: 'சீஸ்', kn: 'ಚೀಸ್', mr: 'चीज' }
  },

  // ==========================================
  // 7. AUTOMOBILE / SPARE PARTS
  // ==========================================
  {
    id: 'auto_engine_oil',
    name: 'Engine Oil',
    sectorId: 'automobile_parts',
    groupId: 'auto_maintenance',
    groupName: 'Fluids & Consumables',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'barrels (210L)', 'cartons'],
    translations: { en: 'Engine Oil', hi: 'इंजन ऑयल', te: 'ఇంజిన్ ఆయిల్', ta: 'இன்ஜின் ஆயில்', kn: 'ಎಂಜಿನ್ ಆಯಿಲ್', mr: 'इंजिन ऑइल' }
  },
  {
    id: 'auto_brake_fluid',
    name: 'Brake Fluid',
    sectorId: 'automobile_parts',
    groupId: 'auto_maintenance',
    groupName: 'Fluids & Consumables',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'bottles', 'cartons'],
    translations: { en: 'Brake Fluid', hi: 'ब्रेक फ्लूइड', te: 'బ్రేక్ ఫ్లూయిడ్', ta: 'பிரேக் ஆயில்', kn: 'ಬ್ರೇಕ್ ಆಯಿಲ್', mr: 'ब्रेक फ्लुइड' }
  },
  {
    id: 'auto_coolant',
    name: 'Coolant',
    sectorId: 'automobile_parts',
    groupId: 'auto_maintenance',
    groupName: 'Fluids & Consumables',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'cartons', 'cans'],
    translations: { en: 'Coolant', hi: 'कूलेंट', te: 'కూలెంట్', ta: 'கூலண்ட்', kn: 'ಕೂಲಂಟ್', mr: 'कुलंट' }
  },
  {
    id: 'auto_air_filter',
    name: 'Air Filter',
    sectorId: 'automobile_parts',
    groupId: 'auto_maintenance',
    groupName: 'Filters & Parts',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes', 'cartons'],
    translations: { en: 'Air Filter', hi: 'एयर फ़िल्टर', te: 'ఎయిర్ ఫిల్టర్', ta: 'ஏர் ஃபில்டர்', kn: 'ಏರ್ ಫಿಲ್ಟರ್', mr: 'एअर फिल्टर' }
  },
  {
    id: 'auto_oil_filter',
    name: 'Oil Filter',
    sectorId: 'automobile_parts',
    groupId: 'auto_maintenance',
    groupName: 'Filters & Parts',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes', 'cartons'],
    translations: { en: 'Oil Filter', hi: 'ऑयल फ़िल्टर', te: 'ఆయిల్ ఫిల్టర్', ta: 'ஆயில் ஃபில்டர்', kn: 'ಆಯಿಲ್ ಫಿಲ್ಟರ್', mr: 'ऑइल फिल्टर' }
  },
  {
    id: 'auto_brake_pads',
    name: 'Brake Pads',
    sectorId: 'automobile_parts',
    groupId: 'auto_maintenance',
    groupName: 'Filters & Parts',
    unitType: 'count',
    defaultUnit: 'sets',
    allowedUnits: ['sets', 'boxes'],
    translations: { en: 'Brake Pads', hi: 'ब्रेक पैड', te: 'బ్రేక్ ప్యాడ్స్', ta: 'பிரேக் பேட்ஸ்', kn: 'ಬ್ರೇಕ್ ಪ್ಯಾಡ್ಗಳು', mr: 'ब्रेक पॅड्स' }
  },
  {
    id: 'auto_spark_plug',
    name: 'Spark Plug',
    sectorId: 'automobile_parts',
    groupId: 'auto_maintenance',
    groupName: 'Filters & Parts',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes (10 pcs)', 'cartons'],
    translations: { en: 'Spark Plug', hi: 'स्पार्क प्लग', te: 'స్పార్క్ ప్లగ్', ta: 'ஸ்பார்க் பிளக்', kn: 'ಸ್ಪಾರ್ಕ್ ಪ್ಲಗ್', mr: 'स्पार्क प्लग' }
  },
  {
    id: 'auto_batteries',
    name: 'Batteries',
    sectorId: 'automobile_parts',
    groupId: 'auto_maintenance',
    groupName: 'Electricals & Parts',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'pieces'],
    translations: { en: 'Batteries', hi: 'ऑटोमोबाइल बैटरी', te: 'బ్యాటరీలు', ta: 'பேட்டரிகள்', kn: 'ಬ್ಯಾಟರಿಗಳು', mr: 'बॅटरी' }
  },
  {
    id: 'auto_chain_sprocket',
    name: 'Chain & Sprocket',
    sectorId: 'automobile_parts',
    groupId: 'auto_maintenance',
    groupName: 'Filters & Parts',
    unitType: 'count',
    defaultUnit: 'sets',
    allowedUnits: ['sets', 'units'],
    translations: { en: 'Chain & Sprocket', hi: 'चेन और स्प्रोकेट', te: 'చైన్ & స్ప్రాకెట్', ta: 'செயின் & ஸ்ப்ராக்கெட்', kn: 'ಚೈನ್ ಮತ್ತು ಸ್ಪ್ರಾಕೆಟ್', mr: 'चेन आणि स्प्रॉकेट' }
  },

  // ==========================================
  // 8. BIKE / TWO-WHEELER PARTS
  // ==========================================
  {
    id: 'bike_engine_oil',
    name: 'Engine Oil (2-Wheeler)',
    sectorId: 'bike_parts',
    groupId: 'bike_maintenance',
    groupName: 'Lubricants & Maintenance',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'cartons (1L x 12)', 'bottles'],
    translations: { en: 'Engine Oil (2-Wheeler)', hi: 'बाइक इंजन ऑयल', te: 'బైక్ ఇంజిన్ ఆయిల్', ta: 'பைக் இன்ஜின் ஆயில்', kn: 'ಬೈಕ್ ಎಂಜಿನ್ ಆಯಿಲ್', mr: 'बाईक इंजिन ऑइल' }
  },
  {
    id: 'bike_brake_pads',
    name: 'Brake Pads / Shoes',
    sectorId: 'bike_parts',
    groupId: 'bike_maintenance',
    groupName: 'Mechanical Spares',
    unitType: 'count',
    defaultUnit: 'sets',
    allowedUnits: ['sets', 'pairs', 'boxes'],
    translations: { en: 'Brake Pads / Shoes', hi: 'ब्रेक शू / पैड', te: 'బ్రేక్ షూస్', ta: 'பிரேக் ஷூ', kn: 'ಬ್ರೇಕ್ ಶೂಗಳು', mr: 'ब्रेक शू' }
  },
  {
    id: 'bike_air_filter',
    name: 'Air Filter',
    sectorId: 'bike_parts',
    groupId: 'bike_maintenance',
    groupName: 'Mechanical Spares',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes'],
    translations: { en: 'Air Filter', hi: 'एयर फ़िल्टर', te: 'ఎయిర్ ఫిల్టర్', ta: 'ஏர் ஃபில்டர்', kn: 'ಏರ್ ಫಿಲ್ಟರ್', mr: 'एअर फिल्टर' }
  },
  {
    id: 'bike_oil_filter',
    name: 'Oil Filter',
    sectorId: 'bike_parts',
    groupId: 'bike_maintenance',
    groupName: 'Mechanical Spares',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes'],
    translations: { en: 'Oil Filter', hi: 'ऑयल फ़िल्टर', te: 'ఆయిల్ ఫిల్టర్', ta: 'ஆயில் ஃபில்டர்', kn: 'ಆಯಿಲ್ ಫಿಲ್ಟರ್', mr: 'ऑइल फिल्टर' }
  },
  {
    id: 'bike_spark_plug',
    name: 'Spark Plug',
    sectorId: 'bike_parts',
    groupId: 'bike_maintenance',
    groupName: 'Mechanical Spares',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes (10 pcs)'],
    translations: { en: 'Spark Plug', hi: 'स्पार्क प्लग', te: 'స్పార్క్ ప్లగ్', ta: 'ஸ்பார்க் பிளக்', kn: 'ಸ್ಪಾರ್ಕ್ ಪ್ಲಗ್', mr: 'स्पार्क प्लग' }
  },
  {
    id: 'bike_chain',
    name: 'Drive Chain',
    sectorId: 'bike_parts',
    groupId: 'bike_maintenance',
    groupName: 'Mechanical Spares',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'sets'],
    translations: { en: 'Drive Chain', hi: 'ड्राइव चेन', te: 'డ్రైవ్ చైన్', ta: 'செயின்', kn: 'ಚೈನ್', mr: 'ड्राइव्ह चेन' }
  },
  {
    id: 'bike_sprocket',
    name: 'Sprocket',
    sectorId: 'bike_parts',
    groupId: 'bike_maintenance',
    groupName: 'Mechanical Spares',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'sets'],
    translations: { en: 'Sprocket', hi: 'स्प्रोकेट', te: 'స్ప్రాకెట్', ta: 'ஸ்ப்ராக்கெட்', kn: 'ಸ್ಪ್ರಾಕೆಟ್', mr: 'स्प्रॉकेट' }
  },
  {
    id: 'bike_tubes',
    name: 'Tubes',
    sectorId: 'bike_parts',
    groupId: 'bike_maintenance',
    groupName: 'Tyres & Tubes',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'cartons'],
    translations: { en: 'Tubes', hi: 'बाइक ट्यूब', te: 'ట్యూబ్‌లు', ta: 'டியூப்கள்', kn: 'ಟ್ಯೂಬ್ಗಳು', mr: 'ट्यूब' }
  },
  {
    id: 'bike_tyres',
    name: 'Tyres',
    sectorId: 'bike_parts',
    groupId: 'bike_maintenance',
    groupName: 'Tyres & Tubes',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'pairs'],
    translations: { en: 'Tyres', hi: 'बाइक टायर', te: 'టైర్లు', ta: 'டயர்கள்', kn: 'ಟೈರ್ಗಳು', mr: 'टायर' }
  },
  {
    id: 'bike_batteries',
    name: 'Batteries',
    sectorId: 'bike_parts',
    groupId: 'bike_maintenance',
    groupName: 'Electricals & Parts',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'cartons'],
    translations: { en: 'Batteries', hi: '2-व्हीलर बैटरी', te: 'బైక్ బ్యాటరీలు', ta: 'பேட்டரிகள்', kn: 'ಬೈಕ್ ಬ್ಯಾಟರಿಗಳು', mr: 'बॅटरी' }
  },

  // ==========================================
  // 9. ELECTRICAL & HARDWARE
  // ==========================================
  {
    id: 'elec_led_bulbs',
    name: 'LED Bulbs',
    sectorId: 'electrical_hardware',
    groupId: 'electrical_supplies',
    groupName: 'Lighting & Fittings',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes (10 pcs)', 'cartons'],
    translations: { en: 'LED Bulbs', hi: 'एलईडी बल्ब', te: 'ఎల్ఈడీ బల్బులు', ta: 'எல்.இ.டி பல்புகள்', kn: 'ಎಲ್ಇಡಿ ಬಲ್ಬ್ಗಳು', mr: 'एलईडी बल्ब' }
  },
  {
    id: 'elec_switches',
    name: 'Switches',
    sectorId: 'electrical_hardware',
    groupId: 'electrical_supplies',
    groupName: 'Switches & Sockets',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes (20 pcs)', 'cartons'],
    translations: { en: 'Switches', hi: 'इलेक्ट्रिक स्विच', te: 'స్విచ్‌లు', ta: 'சுவிட்சுகள்', kn: 'ಸ್ವಿಚ್ಗಳು', mr: 'इलेक्ट्रिक स्विचेस' }
  },
  {
    id: 'elec_sockets',
    name: 'Sockets',
    sectorId: 'electrical_hardware',
    groupId: 'electrical_supplies',
    groupName: 'Switches & Sockets',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes (10 pcs)'],
    translations: { en: 'Sockets', hi: 'सॉकेट्स', te: 'సాకెట్లు', ta: 'சாக்கெட்டுகள்', kn: 'ಸಾಕೆಟ್ಗಳು', mr: 'सॉकेट्स' }
  },
  {
    id: 'elec_wires',
    name: 'Wires',
    sectorId: 'electrical_hardware',
    groupId: 'electrical_supplies',
    groupName: 'Wires & Cables',
    unitType: 'length',
    defaultUnit: 'meters',
    allowedUnits: ['meters', 'coils (90m)', 'boxes'],
    translations: { en: 'Wires', hi: 'बिजली के तार', te: 'వైర్లు', ta: 'மின்சார கம்பிகள்', kn: 'ವೈರ್ಗಳು', mr: 'वायरी' }
  },
  {
    id: 'elec_cables',
    name: 'Cables',
    sectorId: 'electrical_hardware',
    groupId: 'electrical_supplies',
    groupName: 'Wires & Cables',
    unitType: 'length',
    defaultUnit: 'meters',
    allowedUnits: ['meters', 'coils', 'drums'],
    translations: { en: 'Cables', hi: 'केबल', te: 'కేబుల్స్', ta: 'கேபிள்கள்', kn: 'ಕೇಬಲ್ಗಳು', mr: 'केबल्स' }
  },
  {
    id: 'elec_pvc_pipes',
    name: 'PVC Pipes',
    sectorId: 'electrical_hardware',
    groupId: 'electrical_supplies',
    groupName: 'Conduits & Pipes',
    unitType: 'length',
    defaultUnit: 'units',
    allowedUnits: ['units', 'bundles', 'meters'],
    translations: { en: 'PVC Pipes', hi: 'पीवीसी पाइप', te: 'పీవీసీ పైపులు', ta: 'பிவிசி குழாய்கள்', kn: 'ಪಿವಿಸಿ ಪೈಪ್ಗಳು', mr: 'पीव्हीसी पाईप्स' }
  },
  {
    id: 'elec_screws',
    name: 'Screws',
    sectorId: 'electrical_hardware',
    groupId: 'electrical_supplies',
    groupName: 'Hardware Fasteners',
    unitType: 'count',
    defaultUnit: 'boxes',
    allowedUnits: ['boxes (100 pcs)', 'packets', 'kg'],
    translations: { en: 'Screws', hi: 'पेंच / स्क्रू', te: 'స్క్రూలు', ta: 'திருகுகள்', kn: 'ತಿರುಪುಮೊಳೆಗಳು', mr: 'स्क्रू' }
  },
  {
    id: 'elec_nails',
    name: 'Nails',
    sectorId: 'electrical_hardware',
    groupId: 'electrical_supplies',
    groupName: 'Hardware Fasteners',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags', 'boxes'],
    translations: { en: 'Nails', hi: 'कील / नेल्स', te: 'మేకులు', ta: 'ஆணிகள்', kn: 'ಮೊಳೆಗಳು', mr: 'खिळे' }
  },
  {
    id: 'elec_adhesives',
    name: 'Adhesives',
    sectorId: 'electrical_hardware',
    groupId: 'electrical_supplies',
    groupName: 'Hardware Fasteners',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'bottles', 'tubes', 'cartons'],
    translations: { en: 'Adhesives', hi: 'गोंद / फेविकोल', te: 'జిగురు / అడ్హెసివ్స్', ta: 'பசை', kn: 'ಅಂಟು', mr: 'डिंक / फेविकॉल' }
  },
  {
    id: 'elec_tape',
    name: 'Electrical Tape',
    sectorId: 'electrical_hardware',
    groupId: 'electrical_supplies',
    groupName: 'Lighting & Fittings',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes (30 pcs)', 'rolls'],
    translations: { en: 'Electrical Tape', hi: 'बिजली टेप', te: 'ఇన్సులేషన్ టేప్', ta: 'இன்சுலேஷன் டேப்', kn: 'ಇನ್ಸುಲೇಷನ್ ಟೇಪ್', mr: 'इलेक्ट्रिक टेप' }
  },

  // ==========================================
  // 10. STATIONERY & BOOKS
  // ==========================================
  {
    id: 'stat_notebooks',
    name: 'Notebooks',
    sectorId: 'stationery',
    groupId: 'stationery_items',
    groupName: 'Paper & Books',
    unitType: 'count',
    defaultUnit: 'dozens',
    allowedUnits: ['dozens', 'cartons', 'units'],
    translations: { en: 'Notebooks', hi: 'नोटबुक / कॉपियाँ', te: 'నోట్‌బుక్‌లు', ta: 'நோட்டுப் புத்தகங்கள்', kn: 'ನೋಟ್‌ಬುಕ್‌ಗಳು', mr: 'वह्या / नोटबुक्स' }
  },
  {
    id: 'stat_pens',
    name: 'Pens',
    sectorId: 'stationery',
    groupId: 'stationery_items',
    groupName: 'Writing Instruments',
    unitType: 'count',
    defaultUnit: 'boxes',
    allowedUnits: ['boxes (20 pcs)', 'dozens', 'cartons'],
    translations: { en: 'Pens', hi: 'पेन / कलम', te: 'పెన్నులు', ta: 'பேனாக்கள்', kn: 'ಪೆನ್ನುಗಳು', mr: 'पेन' }
  },
  {
    id: 'stat_pencils',
    name: 'Pencils',
    sectorId: 'stationery',
    groupId: 'stationery_items',
    groupName: 'Writing Instruments',
    unitType: 'count',
    defaultUnit: 'boxes',
    allowedUnits: ['boxes (10 pcs)', 'cartons'],
    translations: { en: 'Pencils', hi: 'पेंसिल', te: 'పెన్సిళ్లు', ta: 'பென்சில்கள்', kn: 'ಪೆನ್ಸಿಲ್‌ಗಳು', mr: 'पेन्सिली' }
  },
  {
    id: 'stat_erasers',
    name: 'Erasers',
    sectorId: 'stationery',
    groupId: 'stationery_items',
    groupName: 'Writing Instruments',
    unitType: 'count',
    defaultUnit: 'boxes',
    allowedUnits: ['boxes (20 pcs)', 'units'],
    translations: { en: 'Erasers', hi: 'रबर / इरेज़र', te: 'రబ్బర్లు', ta: 'அழிப்பான்', kn: 'ರಬ್ಬರ್ಗಳು', mr: 'खोडरबर' }
  },
  {
    id: 'stat_markers',
    name: 'Markers',
    sectorId: 'stationery',
    groupId: 'stationery_items',
    groupName: 'Writing Instruments',
    unitType: 'count',
    defaultUnit: 'boxes',
    allowedUnits: ['boxes (10 pcs)', 'units'],
    translations: { en: 'Markers', hi: 'मार्कर', te: 'మార్కర్లు', ta: 'மார்க்கர்கள்', kn: 'ಮಾರ್ಕರ್‌ಗಳು', mr: 'मार्कर' }
  },
  {
    id: 'stat_paper',
    name: 'Paper',
    sectorId: 'stationery',
    groupId: 'stationery_items',
    groupName: 'Paper & Books',
    unitType: 'count',
    defaultUnit: 'reams',
    allowedUnits: ['reams', 'cartons'],
    translations: { en: 'Paper', hi: 'कागज़', te: 'పేపరు', ta: 'காகிதம்', kn: 'ಕಾಗದ', mr: 'कागद' }
  },
  {
    id: 'stat_files',
    name: 'Files',
    sectorId: 'stationery',
    groupId: 'stationery_items',
    groupName: 'Filing & Office',
    unitType: 'count',
    defaultUnit: 'dozens',
    allowedUnits: ['dozens', 'units', 'cartons'],
    translations: { en: 'Files', hi: 'फाइलें', te: 'ఫైళ్లు', ta: 'கோப்புகள்', kn: 'ಫೈಲ್‌ಗಳು', mr: 'फाइली' }
  },
  {
    id: 'stat_folders',
    name: 'Folders',
    sectorId: 'stationery',
    groupId: 'stationery_items',
    groupName: 'Filing & Office',
    unitType: 'count',
    defaultUnit: 'dozens',
    allowedUnits: ['dozens', 'units'],
    translations: { en: 'Folders', hi: 'फोल्डर', te: 'ఫోల్డర్లు', ta: 'ஃபோல்டர்கள்', kn: 'ಫೋಲ್ಡರ್‌ಗಳು', mr: 'फोल्डर' }
  },
  {
    id: 'stat_printer_paper',
    name: 'Printer Paper (A4)',
    sectorId: 'stationery',
    groupId: 'stationery_items',
    groupName: 'Paper & Books',
    unitType: 'count',
    defaultUnit: 'reams',
    allowedUnits: ['reams (500 sheets)', 'cartons (5 reams)'],
    translations: { en: 'Printer Paper (A4)', hi: 'A4 प्रिंटर पेपर', te: 'A4 ప్రింటర్ పేపర్', ta: 'ஏ4 பிரிண்டர் பேப்பர்', kn: 'ಎ4 ಪ್ರಿಂಟರ್ ಪೇಪರ್', mr: 'A4 प्रिंटर पेपर' }
  },

  // ==========================================
  // 11. CLOTHING & FASHION
  // ==========================================
  {
    id: 'cloth_tshirts',
    name: 'T-Shirts',
    sectorId: 'clothing_fashion',
    groupId: 'apparel',
    groupName: 'Daily Wear',
    unitType: 'count',
    defaultUnit: 'pieces',
    allowedUnits: ['pieces', 'dozens', 'bundles'],
    translations: { en: 'T-Shirts', hi: 'टी-शर्ट', te: 'టీ-షర్టులు', ta: 'டி-சர்ட்கள்', kn: 'ಟಿ-ಶರ್ಟ್‌ಗಳು', mr: 'टी-शर्ट' }
  },
  {
    id: 'cloth_shirts',
    name: 'Shirts',
    sectorId: 'clothing_fashion',
    groupId: 'apparel',
    groupName: 'Daily Wear',
    unitType: 'count',
    defaultUnit: 'pieces',
    allowedUnits: ['pieces', 'dozens'],
    translations: { en: 'Shirts', hi: 'शर्ट', te: 'షర్టులు', ta: 'சட்டைகள்', kn: 'ಶರ್ಟ್‌ಗಳು', mr: 'शर्ट' }
  },
  {
    id: 'cloth_trousers',
    name: 'Trousers',
    sectorId: 'clothing_fashion',
    groupId: 'apparel',
    groupName: 'Bottom Wear',
    unitType: 'count',
    defaultUnit: 'pieces',
    allowedUnits: ['pieces', 'dozens'],
    translations: { en: 'Trousers', hi: 'पतलून / पैंट', te: 'ట్రౌజర్లు', ta: 'பேண்ட்கள்', kn: 'ಪ್ಯಾಂಟ್‌ಗಳು', mr: 'पँट' }
  },
  {
    id: 'cloth_jeans',
    name: 'Jeans',
    sectorId: 'clothing_fashion',
    groupId: 'apparel',
    groupName: 'Bottom Wear',
    unitType: 'count',
    defaultUnit: 'pieces',
    allowedUnits: ['pieces', 'dozens'],
    translations: { en: 'Jeans', hi: 'जींस', te: 'జీన్స్', ta: 'ஜீன்ஸ்', kn: 'ಜೀನ್ಸ್', mr: 'जीन्स' }
  },
  {
    id: 'cloth_uniforms',
    name: 'School Uniforms',
    sectorId: 'clothing_fashion',
    groupId: 'apparel',
    groupName: 'Uniforms & Specialized',
    unitType: 'count',
    defaultUnit: 'sets',
    allowedUnits: ['sets', 'pieces', 'bundles'],
    translations: { en: 'School Uniforms', hi: 'स्कूल यूनिफॉर्म', te: 'స్కూల్ యూనిఫాంలు', ta: 'பள்ளி சீருடைகள்', kn: 'ಶಾಲಾ ಸಮವಸ್ತ್ರಗಳು', mr: 'शालेय गणवेश' }
  },
  {
    id: 'cloth_socks',
    name: 'Socks',
    sectorId: 'clothing_fashion',
    groupId: 'apparel',
    groupName: 'Hosiery & Innerwear',
    unitType: 'count',
    defaultUnit: 'pairs',
    allowedUnits: ['pairs', 'dozens'],
    translations: { en: 'Socks', hi: 'मोज़े', te: 'సాక్సులు', ta: 'சாக்ஸ்கள்', kn: 'ಸಾಕ್ಸ್ಗಳು', mr: 'मोजे' }
  },
  {
    id: 'cloth_innerwear',
    name: 'Innerwear',
    sectorId: 'clothing_fashion',
    groupId: 'apparel',
    groupName: 'Hosiery & Innerwear',
    unitType: 'count',
    defaultUnit: 'pieces',
    allowedUnits: ['pieces', 'dozens', 'packs'],
    translations: { en: 'Innerwear', hi: 'अंतःवस्त्र', te: 'ఇన్నర్‌వేర్', ta: 'உள்ளாடைகள்', kn: 'ಒಳಉಡುಪುಗಳು', mr: 'आंतरवस्त्रे' }
  },

  // ==========================================
  // 12. COSMETICS & PERSONAL CARE
  // ==========================================
  {
    id: 'cosm_shampoo',
    name: 'Shampoo',
    sectorId: 'cosmetics_personal_care',
    groupId: 'personal_care',
    groupName: 'Hair & Body Care',
    unitType: 'volume',
    defaultUnit: 'units',
    allowedUnits: ['units', 'cartons', 'bottles', 'sachets'],
    translations: { en: 'Shampoo', hi: 'शैम्पू', te: 'షాంపూ', ta: 'ஷாம்பு', kn: 'ಶಾಂಪೂ', mr: 'शॅम्पू' }
  },
  {
    id: 'cosm_soap',
    name: 'Soap',
    sectorId: 'cosmetics_personal_care',
    groupId: 'personal_care',
    groupName: 'Hair & Body Care',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'cartons', 'dozens'],
    translations: { en: 'Soap', hi: 'साबुन', te: 'సబ్బు', ta: 'சோப்பு', kn: 'ಸಾಬೂನು', mr: 'साबण' }
  },
  {
    id: 'cosm_toothpaste',
    name: 'Toothpaste',
    sectorId: 'cosmetics_personal_care',
    groupId: 'personal_care',
    groupName: 'Oral Hygiene',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'cartons', 'dozens'],
    translations: { en: 'Toothpaste', hi: 'टूथपेस्ट', te: 'టూత్‌పేస్ట్', ta: 'பற்பசை', kn: 'ಟೂತ್‌ಪೇಸ್ಟ್', mr: 'टूथपेस्ट' }
  },
  {
    id: 'cosm_toothbrush',
    name: 'Toothbrush',
    sectorId: 'cosmetics_personal_care',
    groupId: 'personal_care',
    groupName: 'Oral Hygiene',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'dozens', 'cartons'],
    translations: { en: 'Toothbrush', hi: 'टूथब्रश', te: 'టూత్‌బ్రష్', ta: 'பல் துலக்கி', kn: 'ಟೂತ್‌ಬ್ರಷ್', mr: 'टूथब्रश' }
  },
  {
    id: 'cosm_hair_oil',
    name: 'Hair Oil',
    sectorId: 'cosmetics_personal_care',
    groupId: 'personal_care',
    groupName: 'Hair & Body Care',
    unitType: 'volume',
    defaultUnit: 'units',
    allowedUnits: ['units', 'bottles', 'cartons'],
    translations: { en: 'Hair Oil', hi: 'हेयर ऑयल', te: 'జుట్టు నూనె', ta: 'தலைமுடி எண்ணெய்', kn: 'ಕೂದಲಿನ ಎಣ್ಣೆ', mr: 'खोबरेल तेल' }
  },
  {
    id: 'cosm_face_wash',
    name: 'Face Wash',
    sectorId: 'cosmetics_personal_care',
    groupId: 'personal_care',
    groupName: 'Skin Care',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'cartons', 'tubes'],
    translations: { en: 'Face Wash', hi: 'फेस वॉश', te: 'ఫేస్ వాష్', ta: 'ஃபேஸ் வாஷ்', kn: 'ಫೇಸ್ ವಾಶ್', mr: 'फेस वॉश' }
  },
  {
    id: 'cosm_deodorant',
    name: 'Deodorant',
    sectorId: 'cosmetics_personal_care',
    groupId: 'personal_care',
    groupName: 'Fragrances & Grooming',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'cartons', 'cans'],
    translations: { en: 'Deodorant', hi: 'डिओडोरेंट', te: 'డియోడరెంట్', ta: 'டியோடரண்ட்', kn: 'ಡಿಯೋಡರೆಂಟ್', mr: 'डिओडोरंट' }
  },

  // ==========================================
  // 13. HOUSEHOLD & CLEANING
  // ==========================================
  {
    id: 'clean_detergent',
    name: 'Detergent',
    sectorId: 'household_cleaning',
    groupId: 'cleaning_supplies',
    groupName: 'Laundry & Fabric',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (25kg)', 'cartons'],
    translations: { en: 'Detergent', hi: 'डिटर्जेंट पाउडर', te: 'డిటర్జెంట్', ta: 'சலவை தூள்', kn: 'ಡಿಟರ್ಜೆಂಟ್', mr: 'डिटर्जंट' }
  },
  {
    id: 'clean_dishwash',
    name: 'Dishwashing Liquid',
    sectorId: 'household_cleaning',
    groupId: 'cleaning_supplies',
    groupName: 'Surface & Kitchen',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'bottles', 'cartons'],
    translations: { en: 'Dishwashing Liquid', hi: 'डिशवॉश लिक्विड', te: 'డిష్‌వాష్ లిక్విడ్', ta: 'பாத்திரம் கழுவும் திரவம்', kn: 'ಪಾತ್ರೆ ತೊಳೆಯುವ ದ್ರವ', mr: 'डिशवॉश लिक्विड' }
  },
  {
    id: 'clean_floor_cleaner',
    name: 'Floor Cleaner',
    sectorId: 'household_cleaning',
    groupId: 'cleaning_supplies',
    groupName: 'Surface & Kitchen',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'bottles', 'cartons'],
    translations: { en: 'Floor Cleaner', hi: 'फ्लोर क्लीनर', te: 'ఫ్లోర్ క్లీనర్', ta: 'தரை சுத்தப்படுத்தி', kn: 'ನೆಲ ಸ್ವಚ್ಛಗೊಳಿಸುವ ದ್ರವ', mr: 'फ्लोअर क्लिनर' }
  },
  {
    id: 'clean_toilet_cleaner',
    name: 'Toilet Cleaner',
    sectorId: 'household_cleaning',
    groupId: 'cleaning_supplies',
    groupName: 'Sanitation',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'bottles', 'cartons'],
    translations: { en: 'Toilet Cleaner', hi: 'टॉयलेट क्लीनर', te: 'టాయిలెట్ క్లీనర్', ta: 'கழிவறை சுத்தப்படுத்தி', kn: 'ಟಾಯ್ಲೆಟ್ ಕ್ಲೀನರ್', mr: 'टॉयलेट क्लिनर' }
  },
  {
    id: 'clean_bleach',
    name: 'Bleach',
    sectorId: 'household_cleaning',
    groupId: 'cleaning_supplies',
    groupName: 'Sanitation',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'bottles', 'cans'],
    translations: { en: 'Bleach', hi: 'ब्लीचिंग लिक्विड', te: 'బ్లీచింగ్ లిక్విడ్', ta: 'ப்ளீச்', kn: 'ಬ್ಲೀಚ್', mr: 'ब्लिचिंग लिक्विड' }
  },
  {
    id: 'clean_garbage_bags',
    name: 'Garbage Bags',
    sectorId: 'household_cleaning',
    groupId: 'cleaning_supplies',
    groupName: 'Waste & Maintenance',
    unitType: 'count',
    defaultUnit: 'packs',
    allowedUnits: ['packs (30 pcs)', 'rolls', 'cartons'],
    translations: { en: 'Garbage Bags', hi: 'कचरा बैग', te: 'చెత్త బ్యాగులు', ta: 'குப்பை பைகள்', kn: 'ಕಸದ ಚೀಲಗಳು', mr: 'कचरा पिशव्या' }
  },
  {
    id: 'clean_sponges',
    name: 'Sponges',
    sectorId: 'household_cleaning',
    groupId: 'cleaning_supplies',
    groupName: 'Waste & Maintenance',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'packs', 'dozens'],
    translations: { en: 'Sponges', hi: 'स्क्रबर / स्पंज', te: 'స్పాంజ్‌లు', ta: 'ஸ்பாஞ்ச்', kn: 'ಸ್ಪಾಂಜ್ಗಳು', mr: 'स्पंज / स्क्रबर' }
  },

  // ==========================================
  // 14. AGRICULTURAL SUPPLIES
  // ==========================================
  {
    id: 'agri_seeds',
    name: 'Seeds',
    sectorId: 'agricultural_supplies',
    groupId: 'agri_inputs',
    groupName: 'Crop Inputs',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags', 'packets'],
    translations: { en: 'Seeds', hi: 'फसल के बीज', te: 'విత్తనాలు', ta: 'விதைகள்', kn: 'ಬೀಜಗಳು', mr: 'बियाणे' }
  },
  {
    id: 'agri_fertilizers',
    name: 'Fertilizers',
    sectorId: 'agricultural_supplies',
    groupId: 'agri_inputs',
    groupName: 'Crop Inputs',
    unitType: 'weight',
    defaultUnit: 'bags (50kg)',
    allowedUnits: ['bags (50kg)', 'tonnes', 'quintal'],
    translations: { en: 'Fertilizers', hi: 'खाद / उर्वरक', te: 'ఎరువులు', ta: 'உரங்கள்', kn: 'ಗೊಬ್ಬರಗಳು', mr: 'खते' }
  },
  {
    id: 'agri_pesticides',
    name: 'Pesticides',
    sectorId: 'agricultural_supplies',
    groupId: 'agri_inputs',
    groupName: 'Crop Protection',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'bottles', 'cartons'],
    translations: { en: 'Pesticides', hi: 'कीटनाशक', te: 'పురుగుమందులు', ta: 'பூச்சிக்கொல்லிகள்', kn: 'ಕೀಟನಾಶಕಗಳು', mr: 'कीटकनाशके' }
  },
  {
    id: 'agri_irrigation_pipes',
    name: 'Irrigation Pipes',
    sectorId: 'agricultural_supplies',
    groupId: 'agri_inputs',
    groupName: 'Farm Infrastructure',
    unitType: 'length',
    defaultUnit: 'units',
    allowedUnits: ['units', 'meters', 'coils'],
    translations: { en: 'Irrigation Pipes', hi: 'सिंचाई पाइप', te: 'సాగునీటి పైపులు', ta: 'பாசனக் குழாய்கள்', kn: 'ನೀರಾವರಿ ಪೈಪ್ಗಳು', mr: 'सिंचन पाईप' }
  },
  {
    id: 'agri_farming_tools',
    name: 'Farming Tools',
    sectorId: 'agricultural_supplies',
    groupId: 'agri_inputs',
    groupName: 'Farm Infrastructure',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'sets'],
    translations: { en: 'Farming Tools', hi: 'कृषि उपकरण', te: 'వ్యవసాయ పనిముట్లు', ta: 'விவசாயக் கருவிகள்', kn: 'ಕೃಷಿ ಉಪಕರಣಗಳು', mr: 'शेतीची अवजारे' }
  },
  {
    id: 'agri_animal_feed',
    name: 'Animal Feed',
    sectorId: 'agricultural_supplies',
    groupId: 'agri_inputs',
    groupName: 'Livestock Care',
    unitType: 'weight',
    defaultUnit: 'bags (50kg)',
    allowedUnits: ['bags (50kg)', 'quintal', 'tonnes'],
    translations: { en: 'Animal Feed', hi: 'पशु आहार', te: 'పశుగ్రాసం', ta: 'கால்நடை தீவனம்', kn: 'ಪಶು ಆಹಾರ', mr: 'पशुखाद्य' }
  },

  // ==========================================
  // 15. MEAT & POULTRY
  // ==========================================
  {
    id: 'meat_chicken',
    name: 'Fresh Chicken',
    sectorId: 'meat_poultry',
    groupId: 'meat_supplies',
    groupName: 'Poultry & Meat',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'crates'],
    translations: { en: 'Fresh Chicken', hi: 'चिकन', te: 'చికెన్', ta: 'கோழி இறைச்சி', kn: 'ಕೋಳಿ ಮಾಂಸ', mr: 'चिकन' }
  },
  {
    id: 'meat_eggs',
    name: 'Eggs',
    sectorId: 'meat_poultry',
    groupId: 'meat_supplies',
    groupName: 'Poultry & Meat',
    unitType: 'count',
    defaultUnit: 'trays (30 eggs)',
    allowedUnits: ['trays (30 eggs)', 'crates (210 eggs)', 'units'],
    translations: { en: 'Eggs', hi: 'अंडे', te: 'గుడ్లు', ta: 'முட்டைகள்', kn: 'ಮೊಟ್ಟೆಗಳು', mr: 'अंडी' }
  },
  {
    id: 'meat_mutton',
    name: 'Mutton',
    sectorId: 'meat_poultry',
    groupId: 'meat_supplies',
    groupName: 'Poultry & Meat',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg'],
    translations: { en: 'Mutton', hi: 'मटन', te: 'మటన్', ta: 'ஆட்டு இறைச்சி', kn: 'ಕುರಿ ಮಾಂಸ', mr: 'मटण' }
  },
  {
    id: 'meat_fish',
    name: 'Fish',
    sectorId: 'meat_poultry',
    groupId: 'meat_supplies',
    groupName: 'Poultry & Meat',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'crates'],
    translations: { en: 'Fish', hi: 'मछली', te: 'చేపలు', ta: 'மீன்', kn: 'ಮೀನು', mr: 'मासे' }
  },

  // ==========================================
  // 16. PHARMACY / HEALTHCARE
  // ==========================================
  {
    id: 'pharm_first_aid',
    name: 'First Aid Kit',
    sectorId: 'pharmacy',
    groupId: 'healthcare_essentials',
    groupName: 'Medical Essentials',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes'],
    translations: { en: 'First Aid Kit', hi: 'प्राथमिक चिकित्सा किट', te: 'ఫస్ట్ ఎయిడ్ కిట్', ta: 'முதலுதவி பெட்டி', kn: 'ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಕಿಟ್', mr: 'प्रथमोपचार पेटी' }
  },
  {
    id: 'pharm_antiseptic',
    name: 'Antiseptic Liquid',
    sectorId: 'pharmacy',
    groupId: 'healthcare_essentials',
    groupName: 'Medical Essentials',
    unitType: 'volume',
    defaultUnit: 'bottles',
    allowedUnits: ['bottles', 'cartons', 'litres'],
    translations: { en: 'Antiseptic Liquid', hi: 'एंटीसेप्टिक लिक्विड', te: 'యాంటీసెప్టిక్ లిక్విడ్', ta: 'கிருமிநாசினி திரவம்', kn: 'ಆಂಟಿಸೆಪ್ಟಿಕ್ ದ್ರವ', mr: 'जंतुनाशक लिक्विड' }
  },
  {
    id: 'pharm_bandages',
    name: 'Bandages & Cotton',
    sectorId: 'pharmacy',
    groupId: 'healthcare_essentials',
    groupName: 'Medical Essentials',
    unitType: 'count',
    defaultUnit: 'boxes',
    allowedUnits: ['boxes', 'packs', 'rolls'],
    translations: { en: 'Bandages & Cotton', hi: 'पट्टी और रुई', te: 'బ్యాండేజీలు & దూది', ta: 'கட்டு & பஞ்சு', kn: 'ಪಟ್ಟಿ ಮತ್ತು ಹತ್ತಿ', mr: 'पट्ट्या आणि कापूस' }
  },
  {
    id: 'pharm_pain_relief',
    name: 'Pain Relief Spray',
    sectorId: 'pharmacy',
    groupId: 'healthcare_essentials',
    groupName: 'Wellness & Pain Relief',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'cartons'],
    translations: { en: 'Pain Relief Spray', hi: 'दर्द निवारक स्प्रे', te: 'పెయిన్ రిలీఫ్ స్ప్రే', ta: 'வலி நிவாரண ஸ்ப்ரே', kn: 'ನೋವು ನಿವಾರಕ ಸ್ಪ್ರೇ', mr: 'वेदना शामक स्प्रे' }
  },
  {
    id: 'pharm_sanitizer',
    name: 'Sanitizer',
    sectorId: 'pharmacy',
    groupId: 'healthcare_essentials',
    groupName: 'Sanitation',
    unitType: 'volume',
    defaultUnit: 'bottles',
    allowedUnits: ['bottles', 'litres', 'cartons'],
    translations: { en: 'Sanitizer', hi: 'सैनिटाइज़र', te: 'శానిటైజర్', ta: 'சானிடைசர்', kn: 'ಸ್ಯಾನಿಟೈಜರ್', mr: 'सॅनिटायझर' }
  },
  {
    id: 'pharm_ors',
    name: 'ORS Packets',
    sectorId: 'pharmacy',
    groupId: 'healthcare_essentials',
    groupName: 'Wellness & Pain Relief',
    unitType: 'count',
    defaultUnit: 'boxes',
    allowedUnits: ['boxes (50 sachets)', 'packets'],
    translations: { en: 'ORS Packets', hi: 'ओआरएस पैकेट', te: 'ఓఆర్ఎస్ ప్యాకెట్లు', ta: 'ஓ.ஆர்.எஸ் பாக்கெட்டுகள்', kn: 'ಒಆರ್‌ಎಸ್ ಪ್ಯಾಕೆಟ್‌ಗಳು', mr: 'ओआरएस पाकिटे' }
  },

  // ==========================================
  // 17. PET SUPPLIES
  // ==========================================
  {
    id: 'pet_dog_food',
    name: 'Dog Food',
    sectorId: 'pet_supplies',
    groupId: 'pet_care',
    groupName: 'Pet Nutrition',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (10kg)', 'bags (20kg)'],
    translations: { en: 'Dog Food', hi: 'कुत्ते का भोजन', te: 'కుక్క ఆహారం', ta: 'நாய் உணவு', kn: 'ನಾಯಿ ಆಹಾರ', mr: 'कुत्र्यांचे अन्न' }
  },
  {
    id: 'pet_cat_food',
    name: 'Cat Food',
    sectorId: 'pet_supplies',
    groupId: 'pet_care',
    groupName: 'Pet Nutrition',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags (5kg)', 'cartons'],
    translations: { en: 'Cat Food', hi: 'बिल्ली का भोजन', te: 'పిల్లి ఆహారం', ta: 'பூனை உணவு', kn: 'ಬೆಕ್ಕಿನ ಆಹಾರ', mr: 'मांजरांचे अन्न' }
  },
  {
    id: 'pet_shampoo',
    name: 'Pet Shampoo',
    sectorId: 'pet_supplies',
    groupId: 'pet_care',
    groupName: 'Grooming & Health',
    unitType: 'volume',
    defaultUnit: 'bottles',
    allowedUnits: ['bottles', 'cartons'],
    translations: { en: 'Pet Shampoo', hi: 'पेट शैम्पू', te: 'పెట్ షాంపూ', ta: 'செல்லப்பிராணி ஷாம்பு', kn: 'ಪೆಟ್ ಶಾಂಪೂ', mr: 'पेट शॅम्पू' }
  },
  {
    id: 'pet_toys',
    name: 'Pet Toys',
    sectorId: 'pet_supplies',
    groupId: 'pet_care',
    groupName: 'Accessories',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'sets', 'packs'],
    translations: { en: 'Pet Toys', hi: 'पालतू जानवरों के खिलौने', te: 'పెట్ బొమ్మలు', ta: 'செல்லப்பிராணி பொம்மைகள்', kn: 'ಪೆಟ್ ಆಟಿಕೆಗಳು', mr: 'पेट खेळणी' }
  },
  {
    id: 'pet_bird_feed',
    name: 'Bird Feed',
    sectorId: 'pet_supplies',
    groupId: 'pet_care',
    groupName: 'Pet Nutrition',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bags', 'packets'],
    translations: { en: 'Bird Feed', hi: 'पक्षियों का दाना', te: 'పక్షుల ఆహారం', ta: 'பறவை தீவனம்', kn: 'ಪಕ್ಷಿ ಆಹಾರ', mr: 'पक्ष्यांचे दाणे' }
  },

  // ==========================================
  // 18. FOOTWEAR
  // ==========================================
  {
    id: 'foot_slippers',
    name: 'Slippers & Flip Flops',
    sectorId: 'footwear',
    groupId: 'footwear_items',
    groupName: 'Daily Footwear',
    unitType: 'count',
    defaultUnit: 'pairs',
    allowedUnits: ['pairs', 'dozens', 'cartons'],
    translations: { en: 'Slippers & Flip Flops', hi: 'चप्पल / फ्लिप फ्लॉप', te: 'చెప్పులు', ta: 'செருப்புகள்', kn: 'ಚಪ್ಪಲಿಗಳು', mr: 'चप्पल' }
  },
  {
    id: 'foot_sandals',
    name: 'Sandals',
    sectorId: 'footwear',
    groupId: 'footwear_items',
    groupName: 'Daily Footwear',
    unitType: 'count',
    defaultUnit: 'pairs',
    allowedUnits: ['pairs', 'dozens'],
    translations: { en: 'Sandals', hi: 'सैंडल', te: 'స్యాండిల్స్', ta: 'சாண்டல்கள்', kn: 'ಸ್ಯಾಂಡಲ್ಗಳು', mr: 'सँडल्स' }
  },
  {
    id: 'foot_shoes_formal',
    name: 'Formal Shoes',
    sectorId: 'footwear',
    groupId: 'footwear_items',
    groupName: 'Shoes',
    unitType: 'count',
    defaultUnit: 'pairs',
    allowedUnits: ['pairs', 'boxes'],
    translations: { en: 'Formal Shoes', hi: 'फॉर्मल जूते', te: 'ఫార్మల్ షూస్', ta: 'ஃபார்மல் காலணிகள்', kn: 'ಫಾರ್ಮಲ್ ಶೂಗಳು', mr: 'फॉर्मल शूज' }
  },
  {
    id: 'foot_shoes_sports',
    name: 'Sports Shoes',
    sectorId: 'footwear',
    groupId: 'footwear_items',
    groupName: 'Shoes',
    unitType: 'count',
    defaultUnit: 'pairs',
    allowedUnits: ['pairs', 'boxes'],
    translations: { en: 'Sports Shoes', hi: 'स्पोर्ट्स जूते', te: 'స్పోర్ట్స్ షూస్', ta: 'ஸ்போர்ட்ஸ் காலணிகள்', kn: 'ಸ್ಪೋರ್ಟ್ಸ್ ಶೂಗಳು', mr: 'स्पोर्ट्स शूज' }
  },
  {
    id: 'foot_shoes_school',
    name: 'School Shoes',
    sectorId: 'footwear',
    groupId: 'footwear_items',
    groupName: 'Shoes',
    unitType: 'count',
    defaultUnit: 'pairs',
    allowedUnits: ['pairs', 'dozens', 'cartons'],
    translations: { en: 'School Shoes', hi: 'स्कूल के जूते', te: 'స్కూల్ షూస్', ta: 'பள்ளி காலணிகள்', kn: 'ಶಾಲಾ ಶೂಗಳು', mr: 'शालेय शूज' }
  },

  // ==========================================
  // 19. CONSTRUCTION MATERIALS
  // ==========================================
  {
    id: 'const_cement',
    name: 'Cement',
    sectorId: 'construction_materials',
    groupId: 'building_materials',
    groupName: 'Basic Building Materials',
    unitType: 'weight',
    defaultUnit: 'bags (50kg)',
    allowedUnits: ['bags (50kg)', 'tonnes'],
    translations: { en: 'Cement', hi: 'सीमेंट', te: 'సిమెంట్', ta: 'சிமெண்ட்', kn: 'ಸಿಮೆಂಟ್', mr: 'सिमेंट' }
  },
  {
    id: 'const_sand',
    name: 'Sand',
    sectorId: 'construction_materials',
    groupId: 'building_materials',
    groupName: 'Basic Building Materials',
    unitType: 'weight',
    defaultUnit: 'tonnes',
    allowedUnits: ['tonnes', 'truck loads', 'bags'],
    translations: { en: 'Sand', hi: 'रेत / बालू', te: 'ఇసుక', ta: 'மணல்', kn: 'ಮರಳು', mr: 'वाळू' }
  },
  {
    id: 'const_steel_bars',
    name: 'TMT Steel Bars',
    sectorId: 'construction_materials',
    groupId: 'building_materials',
    groupName: 'Structural Steel',
    unitType: 'weight',
    defaultUnit: 'tonnes',
    allowedUnits: ['tonnes', 'quintal', 'bundles'],
    translations: { en: 'TMT Steel Bars', hi: 'टीएमटी सरिया / स्टील', te: 'స్టీల్ రాడ్లు', ta: 'கம்பி / ஸ்டீல்', kn: 'ಉಕ್ಕಿನ ಸರಳುಗಳು', mr: 'टीएमटी स्टील बार' }
  },
  {
    id: 'const_bricks',
    name: 'Bricks',
    sectorId: 'construction_materials',
    groupId: 'building_materials',
    groupName: 'Masonry & Bricks',
    unitType: 'count',
    defaultUnit: 'pieces',
    allowedUnits: ['pieces (1000 pcs)', 'truck loads'],
    translations: { en: 'Bricks', hi: 'ईंटें', te: 'ఇటుకలు', ta: 'செங்கற்கள்', kn: 'ಇಟ್ಟಿಗೆಗಳು', mr: 'विटा' }
  },
  {
    id: 'const_paint',
    name: 'Paint & Primer',
    sectorId: 'construction_materials',
    groupId: 'building_materials',
    groupName: 'Finishing & Paints',
    unitType: 'volume',
    defaultUnit: 'litres',
    allowedUnits: ['litres', 'buckets (20L)', 'cans'],
    translations: { en: 'Paint & Primer', hi: 'पेंट और प्राइमर', te: 'పెయింట్ & ప్రైమర్', ta: 'பெயிண்ட்', kn: 'ಬಣ್ಣ ಮತ್ತು ಪ್ರೈಮರ್', mr: 'रंग आणि प्राइमर' }
  },

  // ==========================================
  // 20. HOTEL / CATERING
  // ==========================================
  {
    id: 'hotel_oil',
    name: 'Commercial Cooking Oil',
    sectorId: 'hotel_catering',
    groupId: 'catering_supplies',
    groupName: 'Commercial Kitchen',
    unitType: 'volume',
    defaultUnit: 'tins (15L)',
    allowedUnits: ['tins (15L)', 'litres', 'barrels'],
    translations: { en: 'Commercial Cooking Oil', hi: 'कमर्शियल कुकिंग ऑयल', te: 'కమర్షియల్ వంట నూనె', ta: 'சமையல் எண்ணெய் (டின்கள்)', kn: 'ಅಡುಗೆ ಎಣ್ಣೆ (ಟಿನ್)', mr: 'कमर्शियल खाद्यतेल' }
  },
  {
    id: 'hotel_rice',
    name: 'Bulk Rice Bags',
    sectorId: 'hotel_catering',
    groupId: 'catering_supplies',
    groupName: 'Commercial Kitchen',
    unitType: 'weight',
    defaultUnit: 'bags (50kg)',
    allowedUnits: ['bags (50kg)', 'quintal'],
    translations: { en: 'Bulk Rice Bags', hi: 'चावल की बोरियां', te: 'బియ్యం బస్తాలు', ta: 'அரிசி மூட்டைகள்', kn: 'ಅಕ್ಕಿ ಮೂಟೆಗಳು', mr: 'तांदळाची पोती' }
  },
  {
    id: 'hotel_foil',
    name: 'Catering Foil & Film',
    sectorId: 'hotel_catering',
    groupId: 'catering_supplies',
    groupName: 'Packaging & Consumables',
    unitType: 'count',
    defaultUnit: 'rolls',
    allowedUnits: ['rolls', 'boxes', 'cartons'],
    translations: { en: 'Catering Foil & Film', hi: 'एल्युमिनियम फॉयल रोल', te: 'క్యాటరింగ్ ఫాయిల్ & ఫిల్మ్', ta: 'அலுமினிய ஃபாயில்', kn: 'ಕ್ಯಾಟರಿಂಗ್ ಫಾಯಿಲ್', mr: 'अ‍ॅल्युमिनियम फॉइल' }
  },
  {
    id: 'hotel_detergent',
    name: 'Commercial Detergents',
    sectorId: 'hotel_catering',
    groupId: 'catering_supplies',
    groupName: 'Sanitation & Housekeeping',
    unitType: 'weight',
    defaultUnit: 'bags (25kg)',
    allowedUnits: ['bags (25kg)', 'cans (5L)', 'cartons'],
    translations: { en: 'Commercial Detergents', hi: 'कमर्शियल डिटर्जेंट', te: 'కమర్షియల్ డిటర్జెంట్', ta: 'வணிக சலவை பொருட்கள்', kn: 'ಕಮರ್ಷಿಯಲ್ ಡಿಟರ್ಜೆಂಟ್', mr: 'कमर्शियल डिटर्जंट' }
  },
  {
    id: 'hotel_buffet_trays',
    name: 'Buffet Trays & Disposables',
    sectorId: 'hotel_catering',
    groupId: 'catering_supplies',
    groupName: 'Packaging & Consumables',
    unitType: 'count',
    defaultUnit: 'cartons',
    allowedUnits: ['cartons', 'boxes', 'packets'],
    translations: { en: 'Buffet Trays & Disposables', hi: 'बुफे ट्रे और डिस्पोजेबल', te: 'బఫే ట్రేలు & డిస్పోజబుల్స్', ta: 'பஃபே தட்டுகள்', kn: 'ಬಫೆ ಟ್ರೇಗಳು', mr: 'बुफे ट्रे आणि डिस्पोजेबल' }
  },

  // ==========================================
  // 21. MOBILE & ELECTRONICS
  // ==========================================
  {
    id: 'mob_chargers',
    name: 'Mobile Chargers',
    sectorId: 'mobile_electronics',
    groupId: 'mobile_accessories',
    groupName: 'Power & Charging',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes (10 pcs)', 'cartons'],
    translations: { en: 'Mobile Chargers', hi: 'मोबाइल चार्जर', te: 'మొబైల్ ఛార్జర్లు', ta: 'மொபைல் சார்ஜர்கள்', kn: 'ಮೊಬೈಲ್ ಚಾರ್ಜರ್‌ಗಳು', mr: 'मोबाईल चार्जर' }
  },
  {
    id: 'mob_cables',
    name: 'USB Cables',
    sectorId: 'mobile_electronics',
    groupId: 'mobile_accessories',
    groupName: 'Power & Charging',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes (20 pcs)'],
    translations: { en: 'USB Cables', hi: 'यूएसबी केबल', te: 'యుఎస్‌బీ కేబుల్స్', ta: 'யூ.எஸ்.பி கேபிள்கள்', kn: 'ಯುಎಸ್‌ಬಿ ಕೇಬಲ್‌ಗಳು', mr: 'युएसबी केबल' }
  },
  {
    id: 'mob_earphones',
    name: 'Earphones',
    sectorId: 'mobile_electronics',
    groupId: 'mobile_accessories',
    groupName: 'Audio Accessories',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes', 'cartons'],
    translations: { en: 'Earphones', hi: 'इयरफ़ोन / हेडफ़ोन', te: 'ఇయర్‌ఫోన్లు', ta: 'இயர்போன்கள்', kn: 'ಇಯರ್‌ಫೋನ್‌ಗಳು', mr: 'इअरफोन्स' }
  },
  {
    id: 'mob_screen_guards',
    name: 'Screen Protectors',
    sectorId: 'mobile_electronics',
    groupId: 'mobile_accessories',
    groupName: 'Protection & Cases',
    unitType: 'count',
    defaultUnit: 'pieces',
    allowedUnits: ['pieces', 'boxes (25 pcs)'],
    translations: { en: 'Screen Protectors', hi: 'स्क्रीन गार्ड / टेम्पर्ड ग्लास', te: 'స్క్రీన్ గార్డులు', ta: 'ஸ்கிரீன் கார்டுகள்', kn: 'ಸ್ಕ್ರೀನ್ ಗಾರ್ಡ್‌ಗಳು', mr: 'स्क्रीन गार्ड' }
  },
  {
    id: 'mob_covers',
    name: 'Mobile Covers',
    sectorId: 'mobile_electronics',
    groupId: 'mobile_accessories',
    groupName: 'Protection & Cases',
    unitType: 'count',
    defaultUnit: 'pieces',
    allowedUnits: ['pieces', 'dozens'],
    translations: { en: 'Mobile Covers', hi: 'मोबाइल कवर', te: 'మొబైల్ కవర్లు', ta: 'மொபைல் கவர்கள்', kn: 'ಮೊಬೈಲ್ ಕವರ್‌ಗಳು', mr: 'मोबाईल कव्हर' }
  },
  {
    id: 'mob_power_banks',
    name: 'Power Banks',
    sectorId: 'mobile_electronics',
    groupId: 'mobile_accessories',
    groupName: 'Power & Charging',
    unitType: 'count',
    defaultUnit: 'units',
    allowedUnits: ['units', 'boxes'],
    translations: { en: 'Power Banks', hi: 'पावर बैंक', te: 'పవర్ బ్యాంకులు', ta: 'பவர் பேங்க்', kn: 'ಪವರ್ ಬ್ಯಾಂಕ್‌ಗಳು', mr: 'पॉवर बँक' }
  },

  // ==========================================
  // 22. OTHER SMALL BUSINESS
  // ==========================================
  {
    id: 'other_boxes',
    name: 'Packaging Boxes',
    sectorId: 'other_business',
    groupId: 'general_supplies',
    groupName: 'Packaging & Shipping',
    unitType: 'count',
    defaultUnit: 'bundles',
    allowedUnits: ['bundles (25 pcs)', 'cartons', 'units'],
    translations: { en: 'Packaging Boxes', hi: 'पैकेजिंग बॉक्स', te: 'ప్యాకింగ్ బాక్సులు', ta: 'பேக்கேஜிங் பெட்டிகள்', kn: 'ಪ್ಯಾಕೇಜಿಂಗ್ ಬಾಕ್ಸ್‌ಗಳು', mr: 'पॅकेजिंग बॉक्सेस' }
  },
  {
    id: 'other_tape',
    name: 'Packing Tape',
    sectorId: 'other_business',
    groupId: 'general_supplies',
    groupName: 'Packaging & Shipping',
    unitType: 'count',
    defaultUnit: 'rolls',
    allowedUnits: ['rolls', 'boxes (36 rolls)'],
    translations: { en: 'Packing Tape', hi: 'पैकिंग टेप', te: 'ప్యాకింగ్ టేప్', ta: 'பேக்கிங் டேப்', kn: 'ಪ್ಯಾಕಿಂಗ್ ಟೇಪ್', mr: 'पॅकिंग टेप' }
  },
  {
    id: 'other_bubble_wrap',
    name: 'Bubble Wrap',
    sectorId: 'other_business',
    groupId: 'general_supplies',
    groupName: 'Packaging & Shipping',
    unitType: 'length',
    defaultUnit: 'rolls',
    allowedUnits: ['rolls (100m)', 'meters'],
    translations: { en: 'Bubble Wrap', hi: 'बबल रैप', te: 'బబుల్ ర్యాప్', ta: 'பப்பில் ரேப்', kn: 'ಬಬಲ್ ರ‍್ಯಾಪ್', mr: 'बबल रॅप' }
  },
  {
    id: 'other_bags',
    name: 'Plastic & Carry Bags',
    sectorId: 'other_business',
    groupId: 'general_supplies',
    groupName: 'Retail Essentials',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bundles (1000 pcs)'],
    translations: { en: 'Plastic & Carry Bags', hi: 'कैरी बैग्स', te: 'క్యారీ బ్యాగులు', ta: 'கேரி பேக்', kn: 'ಕ್ಯಾರಿ ಬ್ಯಾಗ್‌ಗಳು', mr: 'कॅरी बॅग्ज' }
  },
  {
    id: 'other_towels',
    name: 'Cleaning Towels / Rags',
    sectorId: 'other_business',
    groupId: 'general_supplies',
    groupName: 'Maintenance Goods',
    unitType: 'weight',
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'bundles', 'packs'],
    translations: { en: 'Cleaning Towels / Rags', hi: 'सफाई के कपड़े', te: 'క్లీనింగ్ క్లాత్‌లు', ta: 'துடைக்கும் துணிகள்', kn: 'ಸ್ವಚ್ಛಗೊಳಿಸುವ ಬಟ್ಟೆಗಳು', mr: 'सफाईचे कपडे' }
  }
];

// Pre-indexed lookup maps for instant performance
const PRODUCT_BY_ID = new Map(PRODUCT_CATALOG.map(p => [p.id, p]));

/**
 * Returns all products for a given business sector.
 * If sectorId is missing or empty, defaults to 'grocery'.
 */
export function getProductsBySector(sectorId = 'grocery') {
  const targetSector = sectorId || 'grocery';
  const filtered = PRODUCT_CATALOG.filter(p => p.sectorId === targetSector);
  if (filtered.length > 0) return filtered;
  // If a sector has no specific catalog yet, fall back to other_business or grocery
  return PRODUCT_CATALOG.filter(p => p.sectorId === 'other_business');
}

/**
 * Returns products grouped by product group for a given sector.
 */
export function getGroupsBySector(sectorId = 'grocery') {
  const products = getProductsBySector(sectorId);
  const groupMap = new Map();

  for (const prod of products) {
    if (!groupMap.has(prod.groupId)) {
      groupMap.set(prod.groupId, {
        groupId: prod.groupId,
        groupName: prod.groupName,
        products: []
      });
    }
    groupMap.get(prod.groupId).products.push(prod);
  }

  return Array.from(groupMap.values());
}

/**
 * Lookup canonical product by stable ID.
 */
export function getProductById(productId) {
  return PRODUCT_BY_ID.get(productId) || null;
}

/**
 * Searches the catalog strictly.
 * NEVER creates free-form products from query text.
 */
export function searchProducts(query, sectorId = null) {
  if (!query || !query.trim()) {
    return sectorId ? getProductsBySector(sectorId) : PRODUCT_CATALOG;
  }

  const cleanQ = query.trim().toLowerCase();
  const pool = sectorId ? getProductsBySector(sectorId) : PRODUCT_CATALOG;

  return pool.filter(p => {
    if (p.name.toLowerCase().includes(cleanQ)) return true;
    if (p.groupName.toLowerCase().includes(cleanQ)) return true;
    if (p.id.toLowerCase().includes(cleanQ)) return true;
    // Search across language translations
    if (p.translations) {
      for (const t of Object.values(p.translations)) {
        if (t.toLowerCase().includes(cleanQ)) return true;
      }
    }
    return false;
  });
}

/**
 * Returns the localized display name for a product.
 * Falls back to English if translation is missing.
 */
export function getProductDisplayName(productOrId, lang = 'en') {
  if (!productOrId) return '';
  const product = typeof productOrId === 'string' ? getProductById(productOrId) : productOrId;
  if (!product) return typeof productOrId === 'string' ? productOrId : '';

  if (product.translations && product.translations[lang]) {
    return product.translations[lang];
  }
  return product.translations?.en || product.name;
}

/**
 * Resolves any product name or legacy ID to a canonical productId if matched.
 */
export function resolveCanonicalProductId(rawNameOrId) {
  if (!rawNameOrId) return null;
  const str = String(rawNameOrId).trim();
  if (PRODUCT_BY_ID.has(str)) return str;

  // Search by exact name match (case-insensitive)
  const lower = str.toLowerCase();
  const matched = PRODUCT_CATALOG.find(p => 
    p.name.toLowerCase() === lower || 
    p.id.toLowerCase() === lower ||
    (p.translations && Object.values(p.translations).some(t => t.toLowerCase() === lower))
  );

  return matched ? matched.id : null;
}
