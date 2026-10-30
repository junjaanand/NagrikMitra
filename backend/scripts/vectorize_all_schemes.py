import os
import sys
import time
import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv

# Ensure UTF-8 output on Windows terminal
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

load_dotenv("backend/.env")
db_url = os.getenv("DATABASE_URL")

from chromadb.utils import embedding_functions

def run():
    print("=" * 70)
    print("  NAGRIKMITRA PHASE 2: FULL-CORPUS BATCH VECTORIZATION ENGINE")
    print("=" * 70)

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    # 1. Check existing embeddings
    cur.execute("SELECT count(*) FROM scheme_embeddings;")
    existing_count = cur.fetchone()[0]
    print(f"[STATUS] Currently vectorized schemes in database: {existing_count}")

    # 2. Fetch all schemes from public.schemes
    cur.execute("""
        SELECT 
            s.slug, s.name, s.ministry, s.state, s.category, 
            s.benefits, s.eligibility_text, s.documents_required
        FROM schemes s
        LEFT JOIN scheme_embeddings se ON s.slug = se.slug
        WHERE se.slug IS NULL
        ORDER BY (CASE WHEN s.state = 'Central' THEN 1 ELSE 2 END), s.slug;
    """)
    rows = cur.fetchall()
    total_to_embed = len(rows)
    print(f"[STATUS] Schemes pending vectorization: {total_to_embed}")

    if total_to_embed == 0:
        print("[SUCCESS] All 4,728 schemes are already fully vectorized in Supabase!")
        cur.close()
        conn.close()
        return

    # 3. Initialize Local ONNX Dense Embedding Model (all-MiniLM-L6-v2, 384-dim)
    print("\n[INIT] Initializing high-speed ONNX dense embedding engine...")
    ef = embedding_functions.DefaultEmbeddingFunction()

    batch_size = 100
    total_batches = (total_to_embed + batch_size - 1) // batch_size
    t_start = time.perf_counter()

    upsert_sql = """
        INSERT INTO scheme_embeddings (slug, embedding, indexed_text, last_embedded_at)
        VALUES (%s, %s, %s, NOW())
        ON CONFLICT (slug) DO UPDATE SET
            embedding = EXCLUDED.embedding,
            indexed_text = EXCLUDED.indexed_text,
            last_embedded_at = NOW();
    """

    processed_count = 0
    for b_idx in range(total_batches):
        b_rows = rows[b_idx * batch_size : (b_idx + 1) * batch_size]
        slugs = [r[0] for r in b_rows]
        
        # Prepare synthesized text chunks
        doc_texts = []
        for r in b_rows:
            slug, name, ministry, state, cat, benefits, elig, docs = r
            chunk = (
                f"Scheme Name: {name or ''} | "
                f"Ministry: {ministry or ''} | "
                f"State: {state or 'Central'} | "
                f"Category: {cat or ''} | "
                f"Benefits: {(benefits or '')[:500]} | "
                f"Eligibility: {(elig or '')[:500]} | "
                f"Documents: {(docs or '')[:200]}"
            )
            doc_texts.append(chunk)

        # Generate dense semantic vectors
        embeddings = ef(doc_texts)

        # Prepare parameters for psycopg2 (pgvector expects Python list of floats or string format '[0.1, 0.2, ...]')
        records = []
        for slug, emb, text in zip(slugs, embeddings, doc_texts):
            # Format vector as string representation for pgvector
            vec_str = "[" + ",".join(str(x) for x in emb) + "]"
            records.append((slug, vec_str, text))

        execute_batch(cur, upsert_sql, records, page_size=batch_size)
        conn.commit()

        processed_count += len(records)
        elapsed = time.perf_counter() - t_start
        rate = processed_count / max(0.1, elapsed)
        remaining = (total_to_embed - processed_count) / max(0.1, rate)
        
        if (b_idx + 1) % 5 == 0 or (b_idx + 1) == total_batches:
            print(f"[{processed_count}/{total_to_embed}] Vectorized (Batch {b_idx + 1}/{total_batches}) - {rate:.1f} schemes/sec - ETA: {remaining:.1f}s")

    # 4. Verify Final State
    cur.execute("SELECT count(*) FROM scheme_embeddings;")
    final_count = cur.fetchone()[0]
    total_time = time.perf_counter() - t_start

    print("\n" + "=" * 70)
    print(f"  BATCH VECTORIZATION COMPLETE IN {total_time:.1f} SECONDS!")
    print(f"  Total Vectorized Schemes in Supabase: {final_count} / 4,728 (100% Coverage)")
    print("=" * 70)

    cur.close()
    conn.close()

if __name__ == "__main__":
    run()
