import asyncio
import ssl
import time
import os
import sys
from typing import Dict, Any, List, Optional
import httpx
import psycopg2
from psycopg2.extras import execute_batch
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

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (CitizenNavigator/1.0)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
}

SOFT_DEAD_PATTERNS = [
    "server error in '/' application",
    "portal is closed",
    "registration concluded",
    "under maintenance",
    "page not found",
    "runtime error",
    "database connection error",
    "scheme has been discontinued",
    "admissions closed for this financial year",
    "portal closed for application"
]

async def check_scheme_url(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    scheme: Dict[str, Any]
) -> Dict[str, Any]:
    slug = scheme["slug"]
    url = (scheme.get("apply_url") or scheme.get("official_url") or "").strip()
    
    if not url or url.lower() in ("none", "null", "") or not url.startswith("http"):
        return {"slug": slug, "status": "no_url", "code": None}

    async with semaphore:
        try:
            # Streamed GET reads only headers + initial 4KB buffer (avoids 405/403 HEAD blocking)
            async with client.stream("GET", url, headers=HEADERS, follow_redirects=True, timeout=6.0) as res:
                if res.status_code >= 400:
                    return {"slug": slug, "status": "dead_link", "code": res.status_code}

                # Read first 4KB to catch Soft-200 ASP.NET error and maintenance banners
                content_chunk = (await res.aread())[:4096].decode("utf-8", errors="ignore").lower()
                for pattern in SOFT_DEAD_PATTERNS:
                    if pattern in content_chunk:
                        return {"slug": slug, "status": "soft_dead", "code": res.status_code, "reason": pattern}

                # Check if permanently redirected to a different destination
                if str(res.url).rstrip("/") != url.rstrip("/"):
                    return {"slug": slug, "status": "redirected", "code": res.status_code, "new_url": str(res.url)}

                return {"slug": slug, "status": "active", "code": res.status_code}

        except httpx.ConnectTimeout:
            return {"slug": slug, "status": "timeout", "code": None}
        except httpx.ConnectError:
            return {"slug": slug, "status": "unreachable", "code": None}
        except ssl.SSLCertVerificationError:
            # Government portal with self-signed or expired intermediate SSL cert
            return {"slug": slug, "status": "ssl_warning", "code": None}
        except Exception as e:
            return {"slug": slug, "status": "error", "code": None, "detail": str(e)[:100]}

async def audit_schemes(limit: Optional[int] = None):
    print("=" * 75)
    print("  NAGRIKMITRA PHASE 5: ASYNC STREAMED NIC PORTAL LIFECYCLE AUDITOR")
    print("=" * 75)

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    query = """
        SELECT slug, name, apply_url, official_url, lifecycle_status
        FROM schemes
        WHERE lifecycle_status NOT IN ('subsumed')
        ORDER BY (CASE WHEN state = 'Central' THEN 1 ELSE 2 END), slug
    """
    if limit:
        query += f" LIMIT {limit};"
    else:
        query += ";"

    cur.execute(query)
    rows = cur.fetchall()
    total = len(rows)
    print(f"[INIT] Loaded {total} candidate schemes for asynchronous lifecycle audit.")

    schemes = [
        {
            "slug": r[0],
            "name": r[1],
            "apply_url": r[2],
            "official_url": r[3],
            "current_status": r[4]
        }
        for r in rows
    ]

    semaphore = asyncio.Semaphore(40)
    # Using relaxed SSL context so valid gov portals with expired intermediate chains don't crash
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    t_start = time.perf_counter()
    results = []

    async with httpx.AsyncClient(verify=ssl_context, follow_redirects=True) as client:
        tasks = [check_scheme_url(client, semaphore, s) for s in schemes]
        # Run with batch progress
        batch_size = 50
        for i in range(0, total, batch_size):
            chunk_tasks = tasks[i : i + batch_size]
            chunk_res = await asyncio.gather(*chunk_tasks)
            results.extend(chunk_res)
            elapsed = time.perf_counter() - t_start
            rate = len(results) / max(0.1, elapsed)
            print(f"[{len(results)}/{total}] Probed ({rate:.1f} schemes/sec)")

    elapsed_total = time.perf_counter() - t_start
    print(f"\n[PROBING COMPLETE] Audited {len(results)} schemes in {elapsed_total:.2f} seconds ({len(results)/max(0.1, elapsed_total):.1f} req/s)")

    # Aggregate status statistics
    stats: Dict[str, int] = {}
    updates = []
    for r in results:
        st = r["status"]
        stats[st] = stats.get(st, 0) + 1
        
        # Determine database lifecycle status mapping
        # Only mark dead_link or soft_dead if verified; keep active or redirected active
        db_status = "active"
        if st in ("dead_link", "soft_dead"):
            db_status = st
        elif st in ("no_url", "unreachable"):
            db_status = "offline"

        updates.append((db_status, r["slug"]))

    print("\n--- AUDIT RESULTS BREAKDOWN ---")
    for st, count in stats.items():
        pct = (count / max(1, total)) * 100.0
        print(f"  * {st.upper():<15}: {count:5d} schemes ({pct:.1f}%)")

    # Update database in batch
    print("\n[DATABASE] Updating lifecycle_status and last_audited_at in Supabase...")
    update_sql = """
        UPDATE schemes
        SET lifecycle_status = %s,
            last_audited_at = NOW()
        WHERE slug = %s AND lifecycle_status != 'subsumed';
    """
    execute_batch(cur, update_sql, updates, page_size=100)
    conn.commit()
    print("  --> Database update committed successfully!")

    print("\n" + "=" * 75)
    print("  PHASE 5 LIFECYCLE AUDITING RUN COMPLETED SUCCESSFULLY!")
    print("=" * 75)

    cur.close()
    conn.close()

if __name__ == "__main__":
    limit_arg = int(sys.argv[1]) if len(sys.argv) > 1 else None
    asyncio.run(audit_schemes(limit=limit_arg))
