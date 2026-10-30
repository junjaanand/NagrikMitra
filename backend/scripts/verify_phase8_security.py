#!/usr/bin/env python3
"""
Verification Script for Phase 08: Security Architecture (Demo Token Deprecation & Production JWT Guard)
Validates HMAC-SHA256 signature verification, rejection of tampered tokens, backdoor deprecation,
RBAC enforcement, and database auth trigger activation.
"""

import sys
import time
from pathlib import Path

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

import jwt
import psycopg2
from fastapi import HTTPException
from app.config import settings
from app.dependencies.auth import get_current_citizen, require_admin, require_rbac_role

def test_cryptographic_jwt_verification():
    print("\n[TEST 1] Testing Cryptographic HMAC-SHA256 JWT Verification...")
    
    secret = settings.SUPABASE_JWT_SECRET
    assert secret, "SUPABASE_JWT_SECRET must be configured in settings"
    
    # 1. Valid Token
    valid_payload = {
        "sub": "usr_civic_8829",
        "email": "citizen.sharma@gov.in",
        "aud": "authenticated",
        "exp": int(time.time()) + 3600,
        "user_metadata": {"rbac_role": "citizen"}
    }
    valid_token = jwt.encode(valid_payload, secret, algorithm="HS256")
    user = get_current_citizen(authorization=f"Bearer {valid_token}")
    assert user["user_id"] == "usr_civic_8829"
    assert user["role"] == "citizen"
    assert user["is_authenticated"] is True
    assert user["is_demo"] is False
    print("  ✓ Genuine HMAC-SHA256 signed Supabase token successfully verified.")

    # 2. Tampered Token
    tampered_token = valid_token[:-4] + ("bbbb" if valid_token[-4:] != "bbbb" else "aaaa")
    try:
        get_current_citizen(authorization=f"Bearer {tampered_token}")
        assert False, "Tampered token was accepted! Security failure."
    except HTTPException as e:
        assert e.status_code == 401
        print("  ✓ Tampered token cryptographically rejected (401 Unauthorized).")

    # 3. Expired Token
    expired_payload = {
        "sub": "usr_expired_11",
        "email": "old.session@gov.in",
        "exp": int(time.time()) - 120
    }
    expired_token = jwt.encode(expired_payload, secret, algorithm="HS256")
    try:
        get_current_citizen(authorization=f"Bearer {expired_token}")
        assert False, "Expired token was accepted! Security failure."
    except HTTPException as e:
        assert e.status_code == 401
        assert "expired" in e.detail.lower()
        print("  ✓ Expired token rejected with session expiration notice (401 Unauthorized).")

def test_production_mode_backdoor_closure():
    print("\n[TEST 2] Testing Production Hardening & Backdoor Closure...")
    
    # Temporarily simulate production environment
    orig_env = settings.ENVIRONMENT
    settings.ENVIRONMENT = "production"
    
    try:
        # 1. Demo token rejected in production
        try:
            get_current_citizen(authorization="Bearer demo-session-vle")
            assert False, "demo-session-vle was accepted in production mode!"
        except HTTPException as e:
            assert e.status_code == 401
            assert "disabled in production" in e.detail
            print("  ✓ Demo session token rejected in production mode.")

        # 2. Length >= 16 backdoor closure
        try:
            get_current_citizen(authorization="Bearer 1234567890abcdefadmin")
            assert False, "Arbitrary len >= 16 backdoor was accepted!"
        except HTTPException as e:
            assert e.status_code == 401
            print("  ✓ Arbitrary len >= 16 backdoor string rejected in production mode.")
            
        # 3. Missing authorization header
        try:
            get_current_citizen(authorization=None)
            assert False, "Unauthenticated request was accepted on protected dependency!"
        except HTTPException as e:
            assert e.status_code == 401
            print("  ✓ Missing authorization header returns 401 on protected dependencies.")
            
    finally:
        settings.ENVIRONMENT = orig_env

def test_rbac_authorization():
    print("\n[TEST 3] Testing Role-Based Access Control (RBAC)...")
    
    citizen_user = {
        "user_id": "usr_test",
        "email": "user@portal.in",
        "role": "citizen",
        "is_authenticated": True
    }
    admin_user = {
        "user_id": "vle_test",
        "email": "vle@csc.gov.in",
        "role": "admin",
        "is_authenticated": True
    }
    
    # Citizen trying admin action
    try:
        require_admin(citizen_user)
        assert False, "Citizen was granted administrative access!"
    except HTTPException as e:
        assert e.status_code == 403
        print("  ✓ Citizen user rejected from administrative endpoint (403 Forbidden).")
        
    # Admin granted access
    res = require_admin(admin_user)
    assert res["role"] == "admin"
    print("  ✓ Authorized CSC VLE / Admin granted access.")

def test_database_trigger_active():
    print("\n[TEST 4] Verifying Supabase PostgreSQL Auth Sync Trigger...")
    
    db_url = "postgresql://postgres:3kU9JGriasO36Uhl@db.xgddzjmnonafijgxmefz.supabase.co:5432/postgres"
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT trigger_name, event_manipulation, event_object_table
        FROM information_schema.triggers
        WHERE trigger_name = 'on_auth_user_created';
    """)
    rows = cur.fetchall()
    assert len(rows) > 0, "on_auth_user_created trigger not found in information_schema"
    print(f"  ✓ Database trigger '{rows[0][0]}' confirmed active on table '{rows[0][2]}' for event '{rows[0][1]}'.")
    conn.close()

def test_keepalive_workflow():
    print("\n[TEST 5] Verifying Keep-Alive Heartbeat Workflow...")
    workflow_path = PROJECT_ROOT / ".github" / "workflows" / "keep-alive.yml"
    assert workflow_path.exists(), "Missing keep-alive.yml workflow"
    content = workflow_path.read_text(encoding="utf-8")
    assert "cron:" in content
    assert "secrets.SUPABASE_URL" in content
    print(f"  ✓ Found valid GitHub Actions keep-alive workflow: {workflow_path.name}")

if __name__ == "__main__":
    print("======================================================================")
    print(" NAGRIKMITRA - PHASE 08: SECURITY & JWT AUTH GUARD VERIFICATION       ")
    print("======================================================================")
    test_cryptographic_jwt_verification()
    test_production_mode_backdoor_closure()
    test_rbac_authorization()
    test_database_trigger_active()
    test_keepalive_workflow()
    print("\n>>> ALL PHASE 08 SECURITY ARCHITECTURE CHECKS PASSED (100% SUCCESS) <<<\n")
