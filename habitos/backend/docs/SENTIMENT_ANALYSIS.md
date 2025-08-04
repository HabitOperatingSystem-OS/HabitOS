# Sentiment Analysis Feature

This document describes the implementation of the AI-powered sentiment analysis feature for journal entries in HabitOS.

## Overview

The sentiment analysis feature automatically analyzes the emotional tone of journal entries using Google's Gemini AI and provides filtering capabilities based on sentiment categories.

## Features

### 1. AI Sentiment Analysis

- **Gemini Integration**: Uses Google's Gemini AI model for accurate sentiment classification
- **Sentiment Categories**: Supports 5 sentiment levels:
  - `very_negative`
  - `negative`
  - `neutral`
  - `positive`
  - `very_positive`
- **Sentiment Score**: Provides a numerical score from -1.0 to 1.0
- **Fallback Analysis**: Simple keyword-based analysis when AI is unavailable

### 2. Automatic Analysis

- **On Creation**: New journal entries are automatically analyzed when created
- **On Update**: Existing entries are re-analyzed when content is updated
- **Batch Processing**: Backfill script for processing existing entries

### 3. Filtering Support

- **API Filtering**: GET `/api/journals?sentiment=positive` supports sentiment filtering
- **Frontend Integration**: Journal page includes sentiment filter UI
- **Real-time Updates**: Filter changes trigger immediate re-fetch of entries

## Implementation Details

### Backend Components

#### 1. AI Service (`app/utils/ai_service.py`)

```python
# Analyze sentiment of journal content
def analyze_journal_sentiment(self, content: str) -> Dict[str, Any]:
    # Returns sentiment analysis with score, themes, and confidence
```

#### 2. Journal Entry Model (`app/models/journal_entry.py`)

```python
class SentimentType(Enum):
    VERY_NEGATIVE = "very_negative"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    POSITIVE = "positive"
    VERY_POSITIVE = "very_positive"

class JournalEntry(db.Model):
    sentiment = db.Column(db.Enum(SentimentType))
    sentiment_score = db.Column(db.Float)  # -1 to 1 scale

    def analyze_sentiment(self):
        # Performs AI analysis and updates sentiment fields
```

#### 3. API Routes (`app/routes/journal.py`)

- `GET /api/journals` - Supports `sentiment` query parameter
- `POST /api/dev/backfill-sentiment` - Admin endpoint for backfilling sentiment
- `GET /api/journals/sentiments` - Returns available sentiment options

### Frontend Components

#### 1. Journal Filters (`src/features/journal/JournalFilters.jsx`)

- Sentiment filter buttons (Positive, Neutral, Negative)
- Date range filtering
- AI data toggle

#### 2. Journal Hook (`src/shared/hooks/useJournal.js`)

- Manages filter state
- Handles API calls with sentiment parameters
- Provides sentiment options

#### 3. API Service (`src/services/api.js`)

```javascript
getJournalEntries: async (filters = {}) => {
  if (filters.sentiment) params.append("sentiment", filters.sentiment);
  // Makes API call with sentiment filter
};
```

## Database Schema

### Journal Entries Table

```sql
CREATE TABLE journal_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    sentiment ENUM('very_negative', 'negative', 'neutral', 'positive', 'very_positive'),
    sentiment_score FLOAT,
    -- other fields...
);
```

## Configuration

### Environment Variables

```bash
# Required for AI functionality
GEMINI_API_KEY=your_gemini_api_key_here

# Optional configuration
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=1024
GEMINI_TEMPERATURE=0.7
```

## Usage

### 1. Creating Journal Entries

Journal entries are automatically analyzed when created:

```javascript
const response = await journalAPI.createJournalEntry({
  content: "Today was amazing! I accomplished so much.",
  checkin_id: "checkin-uuid",
});
// Sentiment analysis happens automatically
```

### 2. Filtering by Sentiment

```javascript
// Frontend filtering
const { entries } = useJournal();
updateFilters({ sentiment: "positive" });

// Direct API call
const response = await journalAPI.getJournalEntries({
  sentiment: "positive",
});
```

### 3. Backfilling Existing Entries

```bash
# Run backfill script
cd backend
python scripts/backfill_sentiment.py --limit 100

# Or use admin endpoint
curl -X POST "http://localhost:5001/api/journal/dev/backfill-sentiment?limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Endpoints

### GET /api/journals

**Query Parameters:**

- `sentiment` (optional): Filter by sentiment type
- `start_date` (optional): Filter by start date
- `end_date` (optional): Filter by end date
- `include_ai_data` (optional): Include sentiment data in response

**Example:**

```bash
GET /api/journals?sentiment=positive&include_ai_data=true
```

### POST /api/dev/backfill-sentiment

**Query Parameters:**

- `limit` (optional): Maximum entries to process (default: 50)
- `force_reprocess` (optional): Reprocess entries with existing sentiment

**Example:**

```bash
POST /api/dev/backfill-sentiment?limit=100&force_reprocess=false
```

### GET /api/journals/sentiments

Returns available sentiment options:

```json
{
  "sentiments": [
    { "value": "very_negative", "label": "Very Negative" },
    { "value": "negative", "label": "Negative" },
    { "value": "neutral", "label": "Neutral" },
    { "value": "positive", "label": "Positive" },
    { "value": "very_positive", "label": "Very Positive" }
  ]
}
```

## Error Handling

### AI Service Failures

- Falls back to keyword-based analysis
- Logs errors for debugging
- Continues processing other entries

### Rate Limiting

- Handles Gemini API rate limits gracefully
- Implements caching to reduce API calls
- Provides fallback responses

## Performance Considerations

### Caching

- AI service implements prompt caching (5-minute TTL)
- Reduces API calls for repeated requests
- Configurable cache duration

### Batch Processing

- Backfill script processes entries in batches
- Commits every 10 entries to avoid long transactions
- Configurable limits for memory management

### Database Optimization

- Sentiment column is indexed for fast filtering
- Enum type ensures data integrity
- Efficient querying with proper indexes

## Testing

### Manual Testing

1. Create journal entries with different emotional content
2. Verify sentiment analysis results
3. Test filtering functionality
4. Run backfill script on existing data

### API Testing

```bash
# Test sentiment filtering
curl "http://localhost:5001/api/journals?sentiment=positive" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test backfill endpoint
curl -X POST "http://localhost:5001/api/journal/dev/backfill-sentiment" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Common Issues

1. **AI Service Not Working**

   - Check `GEMINI_API_KEY` environment variable
   - Verify internet connectivity
   - Check API rate limits

2. **Sentiment Not Updating**

   - Ensure content is not empty
   - Check for AI service errors in logs
   - Verify database connection

3. **Filtering Not Working**
   - Check sentiment enum values match
   - Verify API endpoint parameters
   - Check frontend filter state

### Logs

- AI service logs are in `backend/logs/`
- Backfill script logs to `backfill_sentiment.log`
- Application logs include sentiment analysis events

## Future Enhancements

1. **Advanced Analysis**

   - Emotional themes extraction
   - Mood trend analysis
   - Personalized insights

2. **Performance Improvements**

   - Async processing for large datasets
   - Redis caching for sentiment results
   - Background job processing

3. **User Experience**
   - Sentiment visualization charts
   - Mood tracking over time
   - Personalized recommendations
