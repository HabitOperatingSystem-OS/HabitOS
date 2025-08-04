#!/usr/bin/env python3
"""
Script to backfill sentiment analysis for existing journal entries
This script can be run independently to process all entries that don't have sentiment data.
"""

import os
import sys
import logging
from datetime import datetime

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app, db
from app.models.journal_entry import JournalEntry
from app.utils.ai_service import get_ai_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backfill_sentiment.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def backfill_sentiment_analysis(limit=None, force_reprocess=False, user_id=None):
    """
    Backfill sentiment analysis for journal entries
    
    Args:
        limit (int): Maximum number of entries to process (None for all)
        force_reprocess (bool): Whether to reprocess entries that already have sentiment
        user_id (str): Specific user ID to process (None for all users)
    """
    app = create_app()
    
    with app.app_context():
        try:
            # Initialize AI service
            ai_service = get_ai_service()
            if not ai_service.enabled:
                logger.error("AI service is not enabled. Please check GEMINI_API_KEY configuration.")
                return False
            
            # Build query
            query = JournalEntry.query
            
            if user_id:
                query = query.filter_by(user_id=user_id)
            
            if not force_reprocess:
                # Only process entries that don't have sentiment data
                query = query.filter(JournalEntry.sentiment.is_(None))
            
            # Order by most recent first
            query = query.order_by(JournalEntry.created_at.desc())
            
            if limit:
                query = query.limit(limit)
            
            entries = query.all()
            
            if not entries:
                logger.info("No entries found for sentiment analysis")
                return True
            
            logger.info(f"Found {len(entries)} entries to process")
            
            # Process entries
            processed = 0
            skipped = 0
            errors = []
            
            for i, entry in enumerate(entries, 1):
                try:
                    logger.info(f"Processing entry {i}/{len(entries)}: {entry.id}")
                    
                    # Skip if already has sentiment and not forcing reprocess
                    if entry.sentiment and not force_reprocess:
                        logger.info(f"Skipping entry {entry.id} - already has sentiment")
                        skipped += 1
                        continue
                    
                    # Analyze sentiment
                    entry.analyze_sentiment()
                    processed += 1
                    
                    logger.info(f"Successfully processed entry {entry.id} - sentiment: {entry.sentiment.value if entry.sentiment else 'None'}")
                    
                    # Commit every 10 entries to avoid long transactions
                    if processed % 10 == 0:
                        db.session.commit()
                        logger.info(f"Committed {processed} entries so far")
                    
                except Exception as e:
                    logger.error(f"Error processing entry {entry.id}: {e}")
                    errors.append({
                        'entry_id': entry.id,
                        'error': str(e)
                    })
                    skipped += 1
            
            # Final commit
            db.session.commit()
            
            logger.info(f"Backfill completed!")
            logger.info(f"Processed: {processed}")
            logger.info(f"Skipped: {skipped}")
            logger.info(f"Errors: {len(errors)}")
            
            if errors:
                logger.error("Errors encountered:")
                for error in errors:
                    logger.error(f"  Entry {error['entry_id']}: {error['error']}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to backfill sentiment: {e}")
            db.session.rollback()
            return False

def main():
    """Main function to run the backfill script"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Backfill sentiment analysis for journal entries')
    parser.add_argument('--limit', type=int, help='Maximum number of entries to process')
    parser.add_argument('--force-reprocess', action='store_true', help='Reprocess entries that already have sentiment')
    parser.add_argument('--user-id', type=str, help='Process entries for specific user only')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be processed without making changes')
    
    args = parser.parse_args()
    
    if args.dry_run:
        logger.info("DRY RUN MODE - No changes will be made")
        # For dry run, we'll just count entries
        app = create_app()
        with app.app_context():
            query = JournalEntry.query
            if args.user_id:
                query = query.filter_by(user_id=args.user_id)
            if not args.force_reprocess:
                query = query.filter(JournalEntry.sentiment.is_(None))
            
            count = query.count()
            logger.info(f"Would process {count} entries")
            return
    
    logger.info("Starting sentiment analysis backfill...")
    logger.info(f"Limit: {args.limit or 'No limit'}")
    logger.info(f"Force reprocess: {args.force_reprocess}")
    logger.info(f"User ID: {args.user_id or 'All users'}")
    
    start_time = datetime.now()
    success = backfill_sentiment_analysis(
        limit=args.limit,
        force_reprocess=args.force_reprocess,
        user_id=args.user_id
    )
    end_time = datetime.now()
    
    duration = end_time - start_time
    logger.info(f"Backfill completed in {duration}")
    
    if success:
        logger.info("Backfill completed successfully!")
        sys.exit(0)
    else:
        logger.error("Backfill failed!")
        sys.exit(1)

if __name__ == '__main__':
    main() 