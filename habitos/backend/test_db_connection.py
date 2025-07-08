# test_db_connection.py
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

def test_connection():
    try:
        conn = psycopg2.connect(os.getenv('postgresql://azim:123@localhost:5432/habitos'))
        print("✅ Database connection successful!")
        
        # Test query
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        print(f"PostgreSQL version: {cursor.fetchone()[0]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

if __name__ == "__main__":
    test_connection()