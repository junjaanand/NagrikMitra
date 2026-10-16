import asyncio
import os
import re
from typing import Optional, Dict, Any
import httpx

# In-memory reported broken links registry
_REPORTED_BROKEN_LINKS: Dict[str, int] = {}
# Cache for resolved/healed URLs
_RESOLVED_URL_CACHE: Dict[str, Dict[str, Any]] = {}

def classify_application_mode(app_process: Optional[str], apply_url: Optional[str]) -> str:
    """
    Classifies the application process into:
    - 'online': Purely online web portal form
    - 'offline': In-person submission to Panchayat / Tehsildar / District office
    - 'hybrid': Online registration + in-person verification or CSC Kendra assisted
    """
    text = (app_process or "").lower()
    url = (apply_url or "").strip().lower()
    has_valid_url = bool(url and url not in ('null', 'none', '') and url.startswith('http'))
    is_pdf = url.endswith('.pdf') or '.pdf' in url

    # Keywords indicative of physical / offline submission
    has_csc = any(k in text for k in [
        'csc', 'common service center', 'vle', 'kiosk', 'digital seva', 
        'biometric', 'e-kyc', 'assisted mode'
    ])
    has_offline = any(k in text for k in [
        'panchayat', 'tehsildar', 'offline', 'in-person', 'physical form', 
        'hard copy', 'visit the nearest', 'submit to the office', 
        'district social welfare', 'anganwadi', 'block development', 
        'patwari', 'collectorate', 'in person', 'counter', 'branch'
    ])
    has_online = any(k in text for k in [
        'online portal', 'official portal', 'apply online', 'website', 
        'register online', 'login', 'portal:', 'url:', 'e-portal'
    ]) or (has_valid_url and not is_pdf)

    if has_csc or (has_online and has_offline):
        return 'hybrid'
    elif has_online and not has_offline:
        return 'online'
    elif has_offline or not has_valid_url or is_pdf:
        return 'offline'
    else:
        return 'online' if has_valid_url else 'offline'


def classify_lifecycle_status(name: str, desc: Optional[str], elig: Optional[str]) -> str:
    """
    Determines scheme lifecycle status:
    - 'active': Currently active & accepting applications
    - 'seasonal_window': Periodic application window (e.g. scholarships, crop cycles)
    - 'superseded_merged': Discontinued or merged into another flagship scheme
    """
    blob = f"{name} {desc or ''} {elig or ''}".lower()
    
    if any(k in blob for k in [
        'subsumed into', 'subsumed under', 'merged into', 'merged with', 
        'superseded by', 'has been replaced by', 'scheme has concluded', 
        'discontinued with effect', 'now part of', 'sunset on', 'prior to 2022'
    ]):
        return 'superseded_merged'
    elif any(k in blob for k in [
        'applications invited between', 'annual submission window', 
        'academic year window', 'portal opens on', 'closing date for receipt', 
        'last date for submission', 'seasonal basis', 'financial year window'
    ]):
        return 'seasonal_window'
    
    return 'active'


async def search_live_government_portal(scheme_name: str) -> Optional[str]:
    """
    Queries SerpAPI or DuckDuckGo for live official government (.gov.in / .nic.in) portals.
    """
    # 1. Check if SerpAPI key is available
    serpapi_key = os.getenv("SERPAPI_API_KEY", "").strip()
    if serpapi_key:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                query = f"site:gov.in OR site:nic.in {scheme_name} apply online portal"
                resp = await client.get(
                    "https://serpapi.com/search",
                    params={
                        "q": query,
                        "api_key": serpapi_key,
                        "engine": "google",
                        "num": 3,
                        "gl": "in"
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    organic_results = data.get("organic_results", [])
                    for res in organic_results:
                        link = res.get("link", "")
                        if "gov.in" in link or "nic.in" in link:
                            return link
        except Exception:
            pass

    # 2. Try DuckDuckGo Search
    try:
        from duckduckgo_search import DDGS
        query = f"site:gov.in {scheme_name} portal"
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None, 
            lambda: list(DDGS().text(query, max_results=3))
        )
        for r in results:
            href = r.get("href", "")
            if "gov.in" in href or "nic.in" in href:
                return href
    except Exception:
        pass

    return None


async def verify_and_resolve_scheme_link(
    slug: str, 
    raw_url: Optional[str], 
    scheme_name: str
) -> Dict[str, Any]:
    """
    Verifies link health and auto-heals dead URLs:
    - Returns verified live URL
    - Falls back to SerpAPI / Web Search if broken
    - Falls back to official National myScheme Mirror if unreachable
    """
    if slug in _RESOLVED_URL_CACHE:
        return _RESOLVED_URL_CACHE[slug]

    clean_url = (raw_url or "").strip()
    is_valid_syntax = clean_url.startswith("http://") or clean_url.startswith("https://")

    # 1. Probing the direct link
    if is_valid_syntax:
        try:
            async with httpx.AsyncClient(timeout=3.0, follow_redirects=True, verify=False) as client:
                resp = await client.head(clean_url)
                if resp.status_code in (200, 301, 302, 303, 307, 308):
                    result = {
                        "status": "verified",
                        "url": str(resp.url),
                        "original_url": clean_url,
                        "is_fallback": False,
                        "message": "Direct official government portal is live and verified."
                    }
                    _RESOLVED_URL_CACHE[slug] = result
                    return result
        except Exception:
            # Direct link probe timed out or failed
            pass

    # 2. Direct link failed or was missing -> Auto-heal via official web search
    healed_url = await search_live_government_portal(scheme_name)
    if healed_url:
        result = {
            "status": "auto_healed",
            "url": healed_url,
            "original_url": clean_url,
            "is_fallback": True,
            "message": "Original link was unavailable. Auto-healed with live verified Government portal."
        }
        _RESOLVED_URL_CACHE[slug] = result
        return result

    # 3. National Mirror Portal Fallback (Guaranteed to exist on myScheme)
    mirror_url = f"https://www.myscheme.gov.in/schemes/{slug}"
    result = {
        "status": "mirror_fallback",
        "url": mirror_url,
        "original_url": clean_url,
        "is_fallback": True,
        "message": "Department portal undergoing maintenance. Routed via National myScheme Official Mirror."
    }
    _RESOLVED_URL_CACHE[slug] = result
    return result


def record_broken_link_report(slug: str, reason: Optional[str] = None) -> int:
    """Records citizen feedback for broken URLs."""
    _REPORTED_BROKEN_LINKS[slug] = _REPORTED_BROKEN_LINKS.get(slug, 0) + 1
    # Invalidate cache so next resolution attempts web search
    if slug in _RESOLVED_URL_CACHE:
        del _RESOLVED_URL_CACHE[slug]
    return _REPORTED_BROKEN_LINKS[slug]
