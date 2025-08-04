#!/usr/bin/env python3
"""
Debug script to check database schema and sentiment enum
"""

import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from app import create_app, db
from app.models.journal_entry import JournalEntry, SentimentType
from sqlalchemy import text

def debug_schema():
    """Debug the database schema and sentiment enum"""
    app = create_app()
    
    with app.app_context():
        try:
            # Check SentimentType enum
            print("=== SentimentType Enum ===")
            for sentiment in SentimentType:
                print(f"  {sentiment.name} = '{sentiment.value}'")
            
            # Check database schema
            print("\n=== Database Schema ===")
            inspector = db.inspect(db.engine)
            
            # Check if journal_entries table exists
            tables = inspector.get_table_names()
            print(f"Tables: {tables}")
            
            if 'journal_entries' in tables:
                # Get columns for journal_entries
                columns = inspector.get_columns('journal_entries')
                print(f"\nJournal entries columns:")
                for col in columns:
                    print(f"  {col['name']}: {col['type']}")
                
                # Check if sentimenttype enum exists
                print(f"\n=== Checking Enum Types ===")
                result = db.session.execute(text("SELECT typname FROM pg_type WHERE typname = 'sentimenttype'"))
                enum_exists = result.fetchone()
                print(f"sentimenttype enum exists: {enum_exists is not None}")
                
                if enum_exists:
                    # Check enum values in database
                    result = db.session.execute(text("SELECT unnest(enum_range(NULL::sentimenttype)) as enum_value"))
                    enum_values = [row[0] for row in result]
                    print(f"Database enum values: {enum_values}")
                
                # Check if there are any journal entries
                count = JournalEntry.query.count()
                print(f"\n=== Journal Entries Count ===")
                print(f"Total journal entries: {count}")
                
                if count > 0:
                    # Check sentiment values in existing entries
                    result = db.session.execute(text("SELECT DISTINCT sentiment FROM journal_entries WHERE sentiment IS NOT NULL"))
                    existing_sentiments = [row[0] for row in result]
                    print(f"Existing sentiment values: {existing_sentiments}")
            
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    debug_schema() 