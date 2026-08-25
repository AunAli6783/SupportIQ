import sys
import sqlite3
import pandas as pd
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from src.config.settings import settings

def inspect_chroma_db():
    db_path = settings.CHROMA_PERSIST_DIR / "chroma.sqlite3"
    print(f"==================================================")
    print(f"Connecting to ChromaDB SQLite File at:")
    print(f"Path: {db_path}")
    print(f"Size: {db_path.stat().st_size / (1024*1024):.2f} MB")
    print(f"==================================================\n")

    conn = sqlite3.connect(db_path)
    
    # 1. Fetch Collections
    collections_df = pd.read_sql_query("SELECT id, name FROM collections", conn)
    print("=== 1. COLLECTIONS TABLE ===")
    print(collections_df)
    print("\n" + "="*60 + "\n")

    # 2. Fetch Document Metadata
    meta_query = """
    SELECT 
        id AS chunk_id,
        key,
        string_value
    FROM embedding_metadata
    WHERE key IN ('source', 'category', 'department', 'chunk_id')
    LIMIT 24
    """
    meta_df = pd.read_sql_query(meta_query, conn)
    print("=== 2. SAMPLE CHUNK METADATA (embedding_metadata) ===")
    print(meta_df.to_string(index=False))
    print("\n" + "="*60 + "\n")

    # 3. Fetch Document Text Chunks
    text_query = """
    SELECT 
        rowid AS chunk_num,
        SUBSTR(string_value, 1, 100) || '...' AS text_preview
    FROM embedding_fulltext_search
    LIMIT 10
    """
    text_df = pd.read_sql_query(text_query, conn)
    print("=== 3. SAMPLE DOCUMENT TEXT CHUNKS (embedding_fulltext_search) ===")
    print(text_df.to_string(index=False))

if __name__ == "__main__":
    inspect_chroma_db()
