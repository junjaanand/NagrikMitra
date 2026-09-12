import csv
import sqlite3
import os
import sys

def parse_int(val):
    if not val or str(val).strip().lower() in ['null', 'nan', 'none']:
        return None
    try:
        # Some floats might be there as strings, like "18.0"
        return int(float(str(val).strip()))
    except ValueError:
        return None

def parse_bool(val):
    if not val or str(val).strip().lower() in ['null', 'nan', 'none', '']:
        return None
    val_str = str(val).strip().lower()
    if val_str in ['true', '1', 'yes', 'y']:
        return True
    if val_str in ['false', '0', 'no', 'n']:
        return False
    return None

def main():
    # Adjust paths if needed, we expect to be run from d:\2hrs\backend or directly
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(script_dir)))
    csv_path = os.path.join(project_root, "Schemes.csv")
    
    # Check fallback path
    if not os.path.exists(csv_path):
        csv_path = "d:/2hrs/Schemes.csv"
        
    db_path = os.path.join(os.path.dirname(os.path.dirname(script_dir)), "data", "nagrikmitra.db")
    
    if not os.path.exists(csv_path):
        print(f"Error: Could not find Schemes.csv at {csv_path}")
        return

    # Ensure DB tables exist
    sys.path.insert(0, os.path.dirname(os.path.dirname(script_dir)))
    from app.database.db import init_db
    init_db()

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    insert_query = '''
        INSERT OR REPLACE INTO schemes (
            slug, name, description, ministry, department, state, category, 
            beneficiary_type, benefits, eligibility_text, application_process, 
            documents_required, apply_url, official_url, eligibility_age_min, 
            eligibility_age_max, eligibility_gender, eligibility_caste, 
            eligibility_income_max, eligibility_residence, eligibility_state, 
            eligibility_disability, eligibility_bpl, scraped_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    '''

    count = 0
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cursor.execute(insert_query, (
                row.get('slug'),
                row.get('name'),
                row.get('description'),
                row.get('ministry'),
                row.get('department'),
                row.get('state'),
                row.get('category'),
                row.get('beneficiary_type'),
                row.get('benefits'),
                row.get('eligibility_text'),
                row.get('application_process'),
                row.get('documents_required'),
                row.get('apply_url'),
                row.get('official_url'),
                parse_int(row.get('eligibility_age_min')),
                parse_int(row.get('eligibility_age_max')),
                row.get('eligibility_gender'),
                row.get('eligibility_caste'),
                parse_int(row.get('eligibility_income_max')),
                row.get('eligibility_residence'),
                row.get('eligibility_state'),
                parse_bool(row.get('eligibility_disability')),
                parse_bool(row.get('eligibility_bpl')),
                row.get('scraped_at')
            ))
            count += 1
            if count % 500 == 0:
                print(f"Inserted {count} records...")

    conn.commit()
    conn.close()
    print(f"Finished ingesting {count} records successfully.")

if __name__ == "__main__":
    main()
