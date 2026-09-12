import os
import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Any, Optional

# Path to persistent ChromaDB storage
CHROMA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "chroma_db"))

def get_chroma_client():
    """Returns a persistent ChromaDB client."""
    os.makedirs(CHROMA_PATH, exist_ok=True)
    return chromadb.PersistentClient(path=CHROMA_PATH)

def get_or_create_schemes_collection(name: str = "nagrikmitra_schemes"):
    """Gets or creates the vector collection for schemes."""
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=name,
        metadata={"description": "Vector collection for NagrikMitra government schemes"}
    )

def add_schemes_to_vector_store(
    schemes: List[Dict[str, Any]],
    collection_name: str = "nagrikmitra_schemes"
):
    """
    Adds a list of schemes to ChromaDB vector store.
    Each scheme dictionary should contain: slug, name, category, benefits, eligibility_text.
    """
    collection = get_or_create_schemes_collection(collection_name)
    
    ids = []
    documents = []
    metadatas = []
    
    for s in schemes:
        slug = s.get("slug")
        if not slug:
            continue
            
        doc_text = (
            f"Scheme Name: {s.get('name', '')}\n"
            f"State: {s.get('state', 'Central')}\n"
            f"Category: {s.get('category', '')}\n"
            f"Benefits: {s.get('benefits', '')[:1000]}\n"
            f"Eligibility: {s.get('eligibility_text', '')[:1000]}\n"
            f"Documents: {s.get('documents_required', '')[:500]}"
        )
        
        ids.append(slug)
        documents.append(doc_text)
        metadatas.append({
            "name": str(s.get("name", "")),
            "state": str(s.get("state", "Central")),
            "category": str(s.get("category", "")),
            "slug": str(slug)
        })
        
    if ids:
        collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
        
    return len(ids)

def query_similar_schemes(
    query: str,
    n_results: int = 5,
    collection_name: str = "nagrikmitra_schemes"
) -> Dict[str, Any]:
    """Queries the ChromaDB collection for schemes matching the query."""
    collection = get_or_create_schemes_collection(collection_name)
    results = collection.query(query_texts=[query], n_results=n_results)
    return results
