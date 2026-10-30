#!/usr/bin/env python3
"""
Verification Script for Phase 07: Vernacular Support & Multilingual Interface (i18n)
Tests Devanagari/Indic query normalizer, locale file integrity, and API search expansion.
"""

import sys
import json
from pathlib import Path

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from app.services.vernacular_normalizer import (
    DEV_TO_CANONICAL_MAP,
    is_indic_script,
    canonicalize_vernacular_query
)
from app.database.db import get_db

def test_vernacular_normalizer():
    print("\n[TEST 1] Testing Vernacular & Devanagari Canonicalizer...")
    
    test_cases = [
        ("पीएम किसान सम्मान", "Pradhan Mantri Kisan Samman Nidhi"),
        ("लाडकी बहीण योजना", "Mukhyamantri Majhi Ladki Bahin"),
        ("प्रधानमंत्री आवास योजना", "Pradhan Mantri Awas Yojana"),
        ("उज्ज्वला गैस योजना", "Pradhan Mantri Ujjwala Yojana"),
        ("आयुष्मान कार्ड", "Ayushman Bharat"),
        ("संजय गांधी निराधार", "Sanjay Gandhi Niradhar"),
        ("PM Surya Ghar", "PM Surya Ghar") # Non-indic unchanged
    ]
    
    for query, expected_fragment in test_cases:
        canonicalized = canonicalize_vernacular_query(query)
        assert expected_fragment in canonicalized, f"FAILED: '{query}' -> '{canonicalized}' missing '{expected_fragment}'"
        print(f"  ✓ '{query}' -> '{canonicalized}'")
    
    # Test script detector
    assert is_indic_script("पीएम किसान") is True
    assert is_indic_script("लाडकी बहीण") is True
    assert is_indic_script("English Query") is False
    print("  ✓ Script detector correctly distinguishes Devanagari from Latin script.")

def test_locale_dictionaries():
    print("\n[TEST 2] Testing Frontend Locale JSON Dictionaries...")
    locales_dir = PROJECT_ROOT / "frontend" / "src" / "i18n" / "locales"
    required_langs = ["en", "hi", "mr", "ta"]
    required_namespaces = ["nav", "hero", "picker", "card", "dossier"]
    
    for lang in required_langs:
        path = locales_dir / f"{lang}.json"
        assert path.exists(), f"Missing locale file: {path}"
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        for ns in required_namespaces:
            assert ns in data, f"Missing namespace '{ns}' in {lang}.json"
        print(f"  ✓ {lang}.json: Valid JSON with all required namespaces ({len(data)} total sections)")

def test_database_vernacular_search():
    print("\n[TEST 3] Testing Database Search with Devanagari Canonicalizer...")
    
    # Direct DB search simulation matching the route logic
    search_queries = [
        ("पीएम किसान", "PM Kisan"),
        ("आवास योजना", "Awas Yojana"),
        ("आयुष्मान", "Ayushman")
    ]
    
    with get_db() as db:
        cur = db.cursor()
        for search, keyword in search_queries:
            norm_search = canonicalize_vernacular_query(search.strip())
            canonical_phrase = norm_search.replace(search.strip(), "").strip()
            
            term_orig = f"%{search.strip()}%"
            term_canon = f"%{canonical_phrase}%"
            
            query = """
                SELECT slug, name, state, category 
                FROM schemes 
                WHERE ((name LIKE ? OR description LIKE ? OR benefits LIKE ? OR category LIKE ?) OR 
                       (name LIKE ? OR description LIKE ? OR benefits LIKE ? OR category LIKE ?))
                LIMIT 5
            """
            params = [term_orig, term_orig, term_orig, term_orig, term_canon, term_canon, term_canon, term_canon]
            cur.execute(query, params)
            rows = cur.fetchall()
            
            assert len(rows) > 0, f"Expected matches for Devanagari query '{search}' (canonical: '{canonical_phrase}')"
            matched_names = [r[1] for r in rows]
            print(f"  ✓ '{search}' found {len(rows)} schemes. Top match: {matched_names[0]}")

def test_frontend_files_exist():
    print("\n[TEST 4] Verifying Frontend i18n & Voice Components...")
    expected_files = [
        PROJECT_ROOT / "frontend" / "src" / "i18n" / "config.js",
        PROJECT_ROOT / "frontend" / "src" / "components" / "common" / "LanguageSelector.jsx",
        PROJECT_ROOT / "frontend" / "src" / "hooks" / "useMultilingualVoice.js",
        PROJECT_ROOT / "frontend" / "src" / "utils" / "speechHelper.js"
    ]
    for p in expected_files:
        assert p.exists(), f"Missing expected file: {p}"
        print(f"  ✓ Found {p.name}")

if __name__ == "__main__":
    print("======================================================================")
    print(" NAGRIKMITRA - PHASE 07: VERNACULAR & MULTILINGUAL I18N VERIFICATION ")
    print("======================================================================")
    test_vernacular_normalizer()
    test_locale_dictionaries()
    test_database_vernacular_search()
    test_frontend_files_exist()
    print("\n>>> ALL PHASE 07 VERNACULAR & I18N CHECKS PASSED (100% SUCCESS) <<<\n")
