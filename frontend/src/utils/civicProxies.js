/**
 * Civic Proxies & Demographic Mappings for NagrikMitra
 * Translates ground-level visual proxies (e.g. Ration Card Color) into deterministic
 * income and BPL criteria to eliminate the need for tax forms or salary slips.
 */

export const RATION_CARD_PROXY = {
  yellow: {
    id: "yellow",
    label: "Yellow / Antyodaya (AAY)",
    hindiLabel: "पीला / अंत्योदय",
    annual_income: 80000,
    is_bpl: true,
    colorHex: "#eab308",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    description: "Deepest poverty tier / NFSA priority beneficiary (< ₹1 Lakh/yr)"
  },
  orange: {
    id: "orange",
    label: "Orange / Priority Household (PHH)",
    hindiLabel: "केसरिया / प्राथमिकता",
    annual_income: 180000,
    is_bpl: false,
    colorHex: "#f97316",
    badgeClass: "bg-orange-100 text-orange-900 border-orange-300",
    description: "Lower middle income tier (₹1 Lakh to ₹2.5 Lakh/yr)"
  },
  white: {
    id: "white",
    label: "White / Above Poverty Line (APL)",
    hindiLabel: "सफ़ेद / सामान्य",
    annual_income: 450000,
    is_bpl: false,
    colorHex: "#f1f5f9",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
    description: "Standard / Non-subsidized household (> ₹2.5 Lakh/yr)"
  },
  none: {
    id: "none",
    label: "No Ration Card",
    hindiLabel: "राशन कार्ड नहीं है",
    annual_income: 250000,
    is_bpl: false,
    colorHex: "#cbd5e1",
    badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
    description: "Standard self-declaration (Assumes middle bracket ₹2.5 Lakh/yr)"
  }
};

export const POPULAR_ROLES = [
  { id: "farmer", label: "Farmer / Kisan", hindi: "किसान / कृषक", icon: "🌾", category: "Agriculture" },
  { id: "student", label: "Student", hindi: "विद्यार्थी / छात्र", icon: "🎓", category: "Education" },
  { id: "woman", label: "Woman / Homemaker", hindi: "महिला / स्वयंसहायता", icon: "👩", category: "Women and Child" },
  { id: "artisan", label: "Artisan / Craftsman", hindi: "कारीगर / शिल्पकार", icon: "🛠️", category: "Skills & Employment" },
  { id: "senior", label: "Senior Citizen", hindi: "बुजुर्ग / वरिष्ठ नागरिक", icon: "👴", category: "Social Welfare" },
  { id: "youth", label: "Unemployed Youth", hindi: "बेरोजगार युवा", icon: "💼", category: "Employment" },
];

export const MAJOR_STATES = [
  { id: "Central", label: "All India / Central", flag: "🇮🇳" },
  { id: "Maharashtra", label: "Maharashtra", flag: "🏛️" },
  { id: "Uttar Pradesh", label: "Uttar Pradesh", flag: "🏛️" },
  { id: "Gujarat", label: "Gujarat", flag: "🏛️" },
  { id: "Bihar", label: "Bihar", flag: "🏛️" },
  { id: "Madhya Pradesh", label: "Madhya Pradesh", flag: "🏛️" },
  { id: "Rajasthan", label: "Rajasthan", flag: "🏛️" },
  { id: "Karnataka", label: "Karnataka", flag: "🏛️" },
];

export const CASTE_CATEGORIES = [
  { id: "General", label: "General", hindi: "सामान्य" },
  { id: "OBC", label: "OBC", hindi: "अन्य पिछड़ा वर्ग" },
  { id: "SC", label: "SC", hindi: "अनुसूचित जाति" },
  { id: "ST", label: "ST", hindi: "अनुसूचित जनजाति" },
];
