#!/usr/bin/env python3
"""
Applies user profile auto-synchronization trigger to Supabase PostgreSQL:
Automatically propagates newly authenticated users from auth.users to public.user_profiles.
"""

import sys
import psycopg2

sys.stdout.reconfigure(encoding='utf-8')

DATABASE_URL = "postgresql://postgres:3kU9JGriasO36Uhl@db.xgddzjmnonafijgxmefz.supabase.co:5432/postgres"

def apply_trigger():
    print("Connecting to Supabase PostgreSQL 17...")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()

    sql_fn = """
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.user_profiles (id, email, full_name)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
      )
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    """

    cur.execute(sql_fn)
    print("✓ Function public.handle_new_user() registered.")

    sql_trigger = """
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    """

    cur.execute(sql_trigger)
    print("✓ Trigger on_auth_user_created attached to auth.users.")
    
    conn.close()
    print("All auth triggers applied successfully!")

if __name__ == "__main__":
    apply_trigger()
