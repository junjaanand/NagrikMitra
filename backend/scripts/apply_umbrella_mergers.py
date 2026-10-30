import os
import sys
import json
import psycopg2
from dotenv import load_dotenv

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Ensure UTF-8 output on Windows terminal
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

load_dotenv("backend/.env")
db_url = os.getenv("DATABASE_URL")

from app.database.vector_store import add_schemes_to_vector_store

def apply_mergers():
    print("=" * 75)
    print("  NAGRIKMITRA PHASE 5: UMBRELLA SCHEME MERGERS & SUCCESSOR ENGINE")
    print("=" * 75)

    mergers_path = os.path.join(os.path.dirname(__file__), "..", "app", "data", "umbrella_mergers.json")
    with open(mergers_path, "r", encoding="utf-8") as f:
        mergers = json.load(f)

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    applied_count = 0
    schemes_to_vectorize = []

    for legacy_slug, data in mergers.items():
        legacy_name = data["legacy_name"]
        successor_slug = data["successor_slug"]
        successor_name = data["successor_name"]
        notice = data["notice"]
        category = data.get("category", "General Welfare")
        state = data.get("state", "Central")

        # Check if legacy scheme exists
        cur.execute("SELECT slug FROM schemes WHERE slug = %s;", (legacy_slug,))
        row = cur.fetchone()

        if row:
            # Update existing
            cur.execute("""
                UPDATE schemes
                SET lifecycle_status = 'subsumed',
                    successor_slug = %s,
                    successor_name = %s,
                    merger_notice = %s,
                    last_audited_at = NOW()
                WHERE slug = %s;
            """, (successor_slug, successor_name, notice, legacy_slug))
            print(f"[UPDATED] {legacy_slug} -> {successor_name}")
        else:
            # Insert legacy reference scheme
            cur.execute("""
                INSERT INTO schemes (
                    slug, name, description, ministry, department, state, category,
                    beneficiary_type, benefits, eligibility_text, application_process,
                    documents_required, apply_url, official_url, eligibility_age_min,
                    eligibility_age_max, eligibility_gender, eligibility_caste,
                    eligibility_income_max, eligibility_residence, eligibility_state,
                    eligibility_disability, eligibility_bpl, scraped_at,
                    lifecycle_status, successor_slug, successor_name, merger_notice,
                    last_audited_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, NOW(),
                    'subsumed', %s, %s, %s,
                    NOW()
                );
            """, (
                legacy_slug, legacy_name, notice, "Ministry of Rural Development / Central Ministries",
                "Department of Welfare", state, category,
                "Rural households / Beneficiaries", notice, "Subsumed under active successor program.",
                f"Legacy scheme has been restructured into {successor_name}. Please apply through the active successor portal.",
                "Aadhaar Card, Bank Passbook, Ration Card",
                "", "", 18, 100, "all", "[]",
                500000, "both", '["All"]',
                False, False,
                successor_slug, successor_name, notice
            ))
            print(f"[INSERTED] {legacy_slug} (Legacy) -> Successor: {successor_name}")

        applied_count += 1
        schemes_to_vectorize.append({
            "slug": legacy_slug,
            "name": legacy_name,
            "state": state,
            "category": category,
            "benefits": f"Legacy welfare scheme restructured into {successor_name}. {notice}",
            "eligibility_text": f"Upgraded to {successor_name}",
            "documents_required": "Aadhaar Card, Bank Passbook, Ration Card"
        })

    conn.commit()

    # Also detect schemes with subsumed or discontinued keywords in their existing descriptions
    cur.execute("""
        UPDATE schemes
        SET lifecycle_status = 'discontinued',
            last_audited_at = NOW()
        WHERE (LOWER(name) LIKE '%discontinued%' OR LOWER(description) LIKE '%discontinued%' OR LOWER(description) LIKE '%closed for applications%')
          AND lifecycle_status NOT IN ('subsumed', 'discontinued');
    """)
    discontinued_detected = cur.rowcount
    conn.commit()
    print(f"\n[AUTO-DISCONTINUED] Flagged {discontinued_detected} additional discontinued schemes based on keyword analysis.")

    # Vectorize legacy schemes into Supabase pgvector so citizens querying legacy names get grounded results
    if schemes_to_vectorize:
        print(f"\n[VECTORIZING] Embedding {len(schemes_to_vectorize)} legacy scheme entries into Supabase pgvector...")
        add_schemes_to_vector_store(schemes_to_vectorize)
        print("  --> Vector indexing complete!")

    # Summary
    cur.execute("SELECT lifecycle_status, count(*) FROM schemes GROUP BY lifecycle_status;")
    status_summary = cur.fetchall()
    print("\n--- SCHEME LIFECYCLE SUMMARY IN SUPABASE ---")
    for s, cnt in status_summary:
        print(f"  * {s or 'active'}: {cnt} schemes")

    print("\n" + "=" * 75)
    print(f"  SUCCESSFULLY APPLIED {applied_count} UMBRELLA MERGER BRIDGES!")
    print("=" * 75)

    cur.close()
    conn.close()

if __name__ == "__main__":
    apply_mergers()
