"""
Vernacular Query Normalizer & Devanagari/Indic Canonicalizer for NagrikMitra
Translates vernacular citizen intents and phonetically/script-typed Indic queries
into canonical government scheme identifiers and official keywords for PostgreSQL & pgvector search.
"""

import re
from typing import Optional

DEV_TO_CANONICAL_MAP = {
    # Central Schemes (Hindi / Marathi / Indic)
    r"पीएम\s*किसान|किसान\s*सम्मान|शेतकरी\s*सन्मान": "Pradhan Mantri Kisan Samman Nidhi",
    r"आवास\s*योजना|घर\s*कुल|पक्का\s*मकान": "Pradhan Mantri Awas Yojana",
    r"राशन\s*कार्ड|खाद्य\s*सुरक्षा|रेशन\s*कार्ड": "NFSA Ration Card Food Security",
    r"उज्ज्वला|गैस\s*सिलेंडर|उज्वला": "Pradhan Mantri Ujjwala Yojana",
    r"आयुष्मान|आरोग्य|स्वास्थ्य\s*कार्ड|गोल्डन\s*कार्ड": "Ayushman Bharat",
    r"सुकन्या\s*समृद्धि|बेटी\s*बचाओ": "Sukanya Samriddhi",
    r"मुद्रा\s*लोन|व्यापार\s*ऋण|कर्ज": "Mudra",
    r"वृद्धावस्था\s*पेंशन|बुजुर्ग\s*पेंशन|म्हातारपण\s*पेन्शन": "Old Age Pension",
    r"दिव्यांग\s*पेंशन|विकलांग\s*सहायता|अपंग\s*पेन्शन": "Disability Pension",
    r"छात्रवृत्ति|स्कॉलरशिप|शिष्यवृत्ती": "Scholarship",
    r"मातृ\s*वंदना|गर्भवती\s*सहायता": "Pradhan Mantri Matru Vandana Yojana",
    r"फसल\s*बीमा|पीक\s*विमा": "Pradhan Mantri Fasal Bima Yojana",
    r"स्वनिधि|स्ट्रीट\s*वेंडर|फेरीवाला": "PM SVANidhi",
    r"विश्वकर्मा|कारीगर|दस्तकार": "PM Vishwakarma",

    # Maharashtra State Schemes (Marathi / Devanagari)
    r"लाडकी\s*बहीण|माझी\s*लाड़की|लाडकी\s*बहिण": "Mukhyamantri Majhi Ladki Bahin",
    r"संजय\s*गांधी\s*निराधार": "Sanjay Gandhi Niradhar",
    r"महाज्योति|ओबीसी\s*वजीफा|महाज्योती": "Mahajyoti",
    r"सारथी|मराठा\s*आरक्षण\s*स्कॉलरशिप": "SARTHI Scholarship",
    r"श्रावण\s*बाळ|श्रावण\s*बाल": "Shravan Bal",
    r"लेक\s*लाडकी": "Lek Ladki",
    r"अन्नपूर्णा|मोफत\s*सिलेंडर": "Annapurna",

    # Tamil Indic Transliterations
    r"கலைஞர்\s*மகளிர்|மகளிர்\s*உரிமை": "Kalaignar Magalir Urimai Thittam",
    r"புதுமைப்\s*பெண்": "Pudhumai Penn",
    r"முதலமைச்சர்\s*காப்பீடு": "Chief Minister Comprehensive Health Insurance"
}

def is_indic_script(text: str) -> bool:
    """Returns True if the text contains characters from Devanagari, Tamil, or common Indic unicode ranges."""
    for ch in text:
        # Devanagari: \u0900-\u097f, Tamil: \u0b80-\u0bff
        if ('\u0900' <= ch <= '\u097f') or ('\u0b80' <= ch <= '\u0bff'):
            return True
    return False

def canonicalize_vernacular_query(query: Optional[str]) -> str:
    """
    Detects Indic script queries and expands them with canonical English scheme identifiers.
    Preserves original query for fuzzy matches while appending canonical tags for high-precision vector & keyword search.
    """
    if not query:
        return ""
    
    cleaned = query.strip()
    if not cleaned:
        return ""

    matched_canonicals = []
    for pattern, canonical in DEV_TO_CANONICAL_MAP.items():
        if re.search(pattern, cleaned, re.IGNORECASE):
            if canonical not in matched_canonicals:
                matched_canonicals.append(canonical)

    if matched_canonicals:
        # Append canonical identifier to query string
        canonical_str = " ".join(matched_canonicals)
        return f"{cleaned} {canonical_str}".strip()

    return cleaned
