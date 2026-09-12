import math
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.database.db import get_db
from app.models.scheme import (
    SchemeListItem,
    SchemeDetail,
    PaginatedSchemesResponse,
    CategoryStat,
    StateStat,
    GlobalStats
)
from app.services.rule_engine import parse_json_list, extract_benefit_amount

router = APIRouter()

@router.get("", response_model=PaginatedSchemesResponse)
async def list_schemes(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search keyword across title and benefits"),
    state: Optional[str] = Query(None, description="Filter by state (e.g. Central, Gujarat)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    gender: Optional[str] = Query(None, description="all, female, male"),
    bpl: Optional[bool] = Query(None, description="BPL targeted schemes"),
    disability: Optional[bool] = Query(None, description="Disability targeted schemes"),
    sort_by: str = Query("name", pattern="^(name|state|category)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$")
):
    """
    Paginated list of government welfare schemes with full-text search and multi-facet filtering.
    """
    conditions = []
    params = []

    if search:
        search_term = f"%{search.strip()}%"
        conditions.append("(name LIKE ? OR description LIKE ? OR benefits LIKE ? OR category LIKE ?)")
        params.extend([search_term, search_term, search_term, search_term])

    if state:
        if state.lower() == "central":
            conditions.append("state = 'Central'")
        elif state.lower() != "all":
            conditions.append("(state = ? OR eligibility_state LIKE ?)")
            params.extend([state, f"%{state}%"])

    if category and category.lower() != "all":
        conditions.append("category LIKE ?")
        params.append(f"%{category.strip()}%")

    if gender and gender.lower() != "all":
        conditions.append("eligibility_gender = ?")
        params.append(gender.lower())

    if bpl is not None:
        conditions.append("eligibility_bpl = ?")
        params.append(1 if bpl else 0)

    if disability is not None:
        conditions.append("eligibility_disability = ?")
        params.append(1 if disability else 0)

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    order_clause = f" ORDER BY {sort_by} {'DESC' if sort_order == 'desc' else 'ASC'}"

    offset = (page - 1) * page_size

    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Total count for pagination
        count_query = f"SELECT COUNT(*) FROM schemes{where_clause}"
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()[0]

        # 2. Paginated rows
        data_query = f"""
            SELECT slug, name, state, category, benefits, eligibility_gender, 
                   eligibility_income_max, eligibility_bpl, eligibility_disability
            FROM schemes
            {where_clause}
            {order_clause}
            LIMIT ? OFFSET ?
        """
        cursor.execute(data_query, params + [page_size, offset])
        rows = cursor.fetchall()

    items = []
    for r in rows:
        items.append(SchemeListItem(
            slug=r[0],
            name=r[1],
            state=r[2],
            category=r[3],
            benefits=r[4],
            eligibility_gender=r[5],
            eligibility_income_max=r[6],
            eligibility_bpl=bool(r[7]),
            eligibility_disability=bool(r[8])
        ))

    total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1

    return PaginatedSchemesResponse(
        items=items,
        total=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/meta/stats", response_model=GlobalStats)
async def get_global_stats():
    """Returns platform-wide statistics for landing page and dashboard."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM schemes")
        total = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM schemes WHERE state = 'Central'")
        central = c.fetchone()[0]
        
        c.execute("SELECT COUNT(DISTINCT state) FROM schemes WHERE state != 'Central'")
        states_count = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM schemes WHERE eligibility_gender = 'female'")
        women = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM schemes WHERE eligibility_bpl = 1")
        bpl = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM schemes WHERE eligibility_disability = 1")
        disability = c.fetchone()[0]
        
        c.execute("SELECT COUNT(DISTINCT category) FROM schemes")
        cats = c.fetchone()[0]

    return GlobalStats(
        total_schemes=total,
        central_schemes=central,
        state_schemes=total - central,
        categories_count=cats,
        states_count=states_count + 1,  # Including Central
        women_schemes_count=women,
        bpl_schemes_count=bpl,
        disability_schemes_count=disability
    )

@router.get("/meta/categories", response_model=List[CategoryStat])
async def get_categories():
    """Returns list of distinct scheme categories with scheme counts."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            SELECT category, COUNT(*) as cnt 
            FROM schemes 
            WHERE category IS NOT NULL AND category != ''
            GROUP BY category 
            ORDER BY cnt DESC 
            LIMIT 25
        """)
        rows = c.fetchall()

    return [CategoryStat(category=r[0], count=r[1]) for r in rows]

@router.get("/meta/states", response_model=List[StateStat])
async def get_states():
    """Returns list of states and union territories with scheme counts."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            SELECT state, COUNT(*) as cnt 
            FROM schemes 
            WHERE state IS NOT NULL AND state != ''
            GROUP BY state 
            ORDER BY cnt DESC
        """)
        rows = c.fetchall()

    return [StateStat(state=r[0], count=r[1]) for r in rows]

@router.get("/{slug}", response_model=SchemeDetail)
async def get_scheme_by_slug(slug: str):
    """Retrieves full details of a specific government scheme by unique slug."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            SELECT slug, name, description, ministry, department, state, category,
                   beneficiary_type, benefits, eligibility_text, application_process,
                   documents_required, apply_url, official_url, eligibility_age_min,
                   eligibility_age_max, eligibility_gender, eligibility_caste,
                   eligibility_income_max, eligibility_residence, eligibility_state,
                   eligibility_disability, eligibility_bpl, scraped_at
            FROM schemes
            WHERE slug = ?
        """, (slug,))
        row = c.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail=f"Scheme with slug '{slug}' not found")

    benefit_amount = extract_benefit_amount(row[8])
    caste_list = parse_json_list(row[17])
    state_list = parse_json_list(row[20])

    return SchemeDetail(
        slug=row[0],
        name=row[1],
        description=row[2],
        ministry=row[3],
        department=row[4],
        state=row[5],
        category=row[6],
        beneficiary_type=row[7],
        benefits=row[8],
        eligibility_text=row[9],
        application_process=row[10],
        documents_required=row[11],
        apply_url=row[12],
        official_url=row[13],
        eligibility_age_min=row[14],
        eligibility_age_max=row[15],
        eligibility_gender=row[16],
        eligibility_caste=row[17],
        eligibility_income_max=row[18],
        eligibility_residence=row[19],
        eligibility_state=row[20],
        eligibility_disability=bool(row[21]),
        eligibility_bpl=bool(row[22]),
        scraped_at=row[23],
        caste_list=caste_list,
        state_list=state_list,
        estimated_benefit_amount=benefit_amount
    )
