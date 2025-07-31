from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.journal_entry import JournalEntry
from app.utils.ai_service import get_ai_service
from datetime import datetime, timedelta
import json

ai_routes_bp = Blueprint('ai_routes', __name__)



@ai_routes_bp.route('/journal/monthly-summary', methods=['POST'])
@jwt_required()
def generate_monthly_summary():
    """Generate monthly summary from journal entries"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        month = data.get('month')  # Format: 'YYYY-MM'
        
        # Calculate date range for the month
        if month:
            year, month_num = month.split('-')
            start_date = datetime(int(year), int(month_num), 1).date()
            if int(month_num) == 12:
                end_date = datetime(int(year) + 1, 1, 1).date()
            else:
                end_date = datetime(int(year), int(month_num) + 1, 1).date()
        else:
            # Default to current month
            now = datetime.utcnow()
            start_date = datetime(now.year, now.month, 1).date()
            if now.month == 12:
                end_date = datetime(now.year + 1, 1, 1).date()
            else:
                end_date = datetime(now.year, now.month + 1, 1).date()
        
        # Get entries for the month
        entries = JournalEntry.query.filter(
            JournalEntry.user_id == current_user_id,
            JournalEntry.entry_date >= start_date,
            JournalEntry.entry_date < end_date
        ).order_by(JournalEntry.entry_date.desc()).all()
        
        # Convert to dict format for AI service
        entries_data = []
        for entry in entries:
            # Get mood rating from associated check-in if available
            mood_rating = None
            if entry.check_in and entry.check_in.mood_rating:
                mood_rating = entry.check_in.mood_rating
            
            entries_data.append({
                'content': entry.content,
                'entry_date': entry.entry_date.isoformat(),
                'mood_rating': mood_rating
            })
        
        # Generate monthly summary
        ai_service = get_ai_service()
        summary_result = ai_service.generate_monthly_summary(entries_data)
        
        return jsonify({
            "success": True,
            "summary": summary_result,
            "month": month or f"{now.year}-{now.month:02d}",
            "entry_count": len(entries)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_routes_bp.route('/journal/prompts', methods=['GET'])
@jwt_required()
def get_journal_prompts():
    """Get AI-generated journal writing prompts"""
    try:
        count = request.args.get('count', 5, type=int)
        count = min(count, 10)  # Limit to 10 prompts max
        
        ai_service = get_ai_service()
        prompts = ai_service.generate_prompts(count)
        
        return jsonify({
            "success": True,
            "prompts": prompts
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_routes_bp.route('/journal/health', methods=['GET'])
@jwt_required()
def check_ai_health():
    """Check AI service health and status"""
    try:
        ai_service = get_ai_service()
        
        return jsonify({
            "success": True,
            "ai_enabled": ai_service.enabled,
            "service_type": getattr(ai_service, 'service_type', 'none'),
            "status": "healthy" if ai_service.enabled else "fallback_mode"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "ai_enabled": False,
            "error": str(e),
            "status": "error"
        }), 500 