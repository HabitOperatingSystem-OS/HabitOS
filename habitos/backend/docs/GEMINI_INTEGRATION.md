# Gemini AI Integration for HabitOS

This document provides a comprehensive guide to the Google Gemini AI integration in HabitOS, which powers personalized journal insights and reflective prompts.

## 🚀 Overview

The Gemini AI integration enhances HabitOS with intelligent features that provide personalized insights and contextual journaling prompts based on user data, habits, goals, and journaling patterns.

## 🔧 Configuration

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Google Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.7

# Feature Flags
ENABLE_AI_INSIGHTS=true
ENABLE_JOURNAL_PROMPTS=true
ENABLE_SENTIMENT_ANALYSIS=true
```

### 2. Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key to your `.env` file

### 3. Model Configuration

- **Model**: `gemini-1.5-flash` (recommended for speed and cost-effectiveness)
- **Max Tokens**: 2048 (adjust based on your needs)
- **Temperature**: 0.7 (balanced creativity and consistency)

## 🧠 Features

### 1. Sentiment Analysis

**Endpoint**: `POST /api/journal/sentiment-analysis`

Analyzes the emotional tone of journal entries using Gemini AI.

```json
{
  "content": "Today was amazing! I completed all my goals and felt really productive."
}
```

**Response**:

```json
{
  "sentiment": "positive",
  "sentiment_score": 0.8,
  "emotional_themes": ["achievement", "productivity", "satisfaction"],
  "confidence": 0.9,
  "reasoning": "The text contains positive words like 'amazing' and expresses satisfaction with goal completion."
}
```

### 2. Personalized Insights

**Endpoint**: `GET /api/journal/insights/<entry_id>`

Generates comprehensive insights for individual journal entries.

**Response**:

```json
{
  "entry_id": "uuid",
  "insights": {
    "summary": "Reflection on a productive day with goal achievement",
    "emotional_patterns": ["satisfaction", "motivation"],
    "habit_alignment": "Entry shows strong alignment with productivity habits",
    "wellness_recommendations": [
      "Continue celebrating small wins",
      "Maintain this positive momentum"
    ],
    "growth_opportunities": [
      "Document what made this day successful",
      "Apply these strategies to future days"
    ],
    "key_themes": ["productivity", "goal achievement", "positive mindset"],
    "action_items": [
      "Reflect on what contributed to today's success",
      "Plan tomorrow with similar strategies"
    ]
  }
}
```

### 3. Reflective Prompts

**Endpoint**: `GET /api/journal/prompts?type=general`

Generates contextual journaling prompts based on user data.

**Query Parameters**:

- `type`: `general`, `habit-focused`, `goal-oriented`, `emotional`, `gratitude`, `challenge`, `wellness`

**Response**:

```json
{
  "prompts": [
    {
      "category": "productivity",
      "text": "What made today's workout session particularly effective?",
      "focus_area": "habit optimization"
    },
    {
      "category": "gratitude",
      "text": "Reflect on three moments today that brought you joy or satisfaction.",
      "focus_area": "positive reflection"
    }
  ],
  "prompt_type": "general",
  "count": 5
}
```

### 4. Pattern Analysis

**Endpoint**: `GET /api/journal/patterns?days_back=30&limit=20`

Analyzes patterns across multiple journal entries.

**Query Parameters**:

- `days_back`: Number of days to analyze (default: 30)
- `limit`: Maximum entries to analyze (default: 20)

**Response**:

```json
{
  "patterns": {
    "recurring_themes": ["productivity", "work-life balance"],
    "emotional_patterns": ["morning motivation", "evening reflection"],
    "habit_patterns": ["consistent workout tracking", "goal progress"],
    "writing_patterns": ["detailed morning entries", "brief evening summaries"],
    "growth_indicators": ["increased self-awareness", "habit consistency"],
    "recommendations": [
      "Continue morning reflection routine",
      "Explore work-life balance themes further"
    ]
  },
  "analysis_period": "Last 30 days",
  "entries_analyzed": 15
}
```

### 5. Batch Analysis

**Endpoint**: `POST /api/journal/insights/batch`

Analyzes multiple journal entries at once.

**Request**:

```json
{
  "entry_ids": ["uuid1", "uuid2", "uuid3"]
}
```

## 🏗️ Architecture

### 1. Gemini Service (`app/utils/gemini_service.py`)

The core service that handles all Gemini AI interactions:

- **Sentiment Analysis**: Analyzes emotional tone and themes
- **Insight Generation**: Creates personalized insights
- **Prompt Generation**: Generates contextual prompts
- **Pattern Analysis**: Identifies trends across entries

### 2. Enhanced Journal Model

The `JournalEntry` model has been updated to:

- Use Gemini for sentiment analysis
- Generate personalized insights
- Include user context (habits, goals, mood trends)
- Provide fallback methods when AI is disabled

### 3. User Context Building

The system builds rich user context including:

- Current habits and their titles
- Active goals and progress
- Recent mood trends from check-ins
- Previous journal entry themes
- Time of day for contextual prompts

## 🔄 API Endpoints

### Core Journal Endpoints

| Method | Endpoint            | Description              |
| ------ | ------------------- | ------------------------ |
| GET    | `/api/journal/`     | Get all journal entries  |
| POST   | `/api/journal/`     | Create new journal entry |
| GET    | `/api/journal/<id>` | Get specific entry       |
| PUT    | `/api/journal/<id>` | Update entry             |
| DELETE | `/api/journal/<id>` | Delete entry             |

### AI-Powered Endpoints

| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/api/journal/prompts`            | Get personalized prompts |
| GET    | `/api/journal/insights/<id>`      | Get entry insights       |
| GET    | `/api/journal/patterns`           | Analyze entry patterns   |
| POST   | `/api/journal/insights/batch`     | Batch analyze entries    |
| GET    | `/api/journal/prompts/categories` | Get prompt categories    |

## 🛡️ Error Handling

The integration includes comprehensive error handling:

1. **API Key Missing**: Graceful fallback to basic analysis
2. **Network Issues**: Retry logic with exponential backoff
3. **Rate Limiting**: Respects Gemini API limits
4. **Invalid Responses**: JSON parsing with fallbacks
5. **Service Unavailable**: Fallback to keyword-based analysis

## 🧪 Testing

### Manual Testing

1. **Set up environment**:

   ```bash
   cp env.example .env
   # Add your Gemini API key
   ```

2. **Test sentiment analysis**:

   ```bash
   curl -X POST http://localhost:5000/api/journal/sentiment-analysis \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"content": "Today was wonderful!"}'
   ```

3. **Test prompts generation**:
   ```bash
   curl -X GET "http://localhost:5000/api/journal/prompts?type=gratitude" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Feature Flags

Control AI features with environment variables:

```bash
ENABLE_AI_INSIGHTS=true      # Enable insight generation
ENABLE_JOURNAL_PROMPTS=true  # Enable prompt generation
ENABLE_SENTIMENT_ANALYSIS=true # Enable sentiment analysis
```

## 📊 Performance Considerations

### 1. Caching

Consider implementing caching for:

- User context (habits, goals, mood trends)
- Generated prompts (cache for 1 hour)
- Pattern analysis results (cache for 24 hours)

### 2. Rate Limiting

- Monitor Gemini API usage
- Implement request throttling
- Use batch operations when possible

### 3. Cost Optimization

- Use `gemini-1.5-flash` for speed and cost
- Limit token usage with `max_tokens`
- Cache frequently requested data

## 🔮 Future Enhancements

### 1. Advanced Features

- **Mood Prediction**: Predict mood based on patterns
- **Habit Recommendations**: Suggest habit improvements
- **Goal Optimization**: Recommend goal adjustments
- **Writing Style Analysis**: Analyze writing patterns

### 2. Integration Opportunities

- **Calendar Integration**: Contextual prompts based on schedule
- **Weather Integration**: Mood correlation with weather
- **Health Data**: Wellness insights from health metrics
- **Social Context**: Prompts based on social interactions

### 3. Personalization

- **Learning User Preferences**: Adapt to writing style
- **Custom Prompt Categories**: User-defined prompt types
- **Insight Customization**: Tailored insight categories
- **Progress Tracking**: AI-powered progress insights

## 🚨 Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY not configured"**

   - Check your `.env` file
   - Verify API key is valid
   - Restart the application

2. **"Failed to initialize Gemini service"**

   - Check internet connection
   - Verify API key permissions
   - Check Gemini service status

3. **"Error parsing JSON response"**
   - Check Gemini API response format
   - Verify prompt structure
   - Review error logs

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=DEBUG
```

### Fallback Mode

When AI features are disabled, the system falls back to:

- Keyword-based sentiment analysis
- Basic insights generation
- Static prompt library

## 📚 Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini Model Guide](https://ai.google.dev/models/gemini)
- [HabitOS Documentation](./README.md)

---

**Note**: This integration requires a valid Gemini API key and internet connectivity. Features gracefully degrade when AI services are unavailable.
