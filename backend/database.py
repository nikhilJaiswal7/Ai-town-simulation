import sqlite3
import os

DB_PATH = "town_state.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Characters Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        name TEXT,
        personality TEXT,
        x REAL,
        y REAL
    )
    ''')
    
    # Relationships Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS relationships (
        source TEXT,
        target TEXT,
        type TEXT,
        strength INTEGER,
        PRIMARY KEY (source, target, type)
    )
    ''')
    
    # Seed data if empty
    cursor.execute("SELECT COUNT(*) FROM characters")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO characters VALUES (?, ?, ?, ?, ?)", 
                       ("n1", "Elias", "A reclusive clockmaker who speaks in metaphors about time and decay.", 100, 150))
        cursor.execute("INSERT INTO characters VALUES (?, ?, ?, ?, ?)", 
                       ("n2", "Sera", "A former poet who lost her voice but communicates through intense, quiet presence.", 200, 200))
        
        cursor.execute("INSERT INTO relationships VALUES (?, ?, ?, ?)", ("n1", "n2", "Friends", 5))
        cursor.execute("INSERT INTO relationships VALUES (?, ?, ?, ?)", ("n1", "n3", "Obsession", 10)) # Object link
        
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

if __name__ == "__main__":
    init_db()
