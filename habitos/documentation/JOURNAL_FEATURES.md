# Journal Features Documentation

## Overview

The Journal page (`/journals`) provides a comprehensive view of all journal entries from past check-ins, with advanced filtering, search, and AI-powered insights.

## Features

### 1. Chronological Journal Entries Display

- **Date-based ordering**: Entries are displayed chronologically (newest first by default)
- **Sort options**: Toggle between newest first and oldest first
- **Rich entry cards**: Each entry shows date, content, mood rating, and sentiment

### 2. Mood Rating Visualization

- **Emoji representation**: Mood ratings (1-10) are displayed as intuitive emojis
- **Color coding**: Different mood ranges have distinct colors
  - 8-10: 😍 Green (Excellent)
  - 6-7: 😊 Yellow (Good)
  - 4-5: 😕 Orange (Okay)
  - 1-3: 😭 Red (Poor)
- **Average mood tracking**: Dashboard shows overall mood statistics

### 3. Content Management

- **Text truncation**: Long entries are truncated with "Read More" functionality
- **Expandable content**: Click to expand/collapse full journal entries
- **Whitespace preservation**: Maintains formatting and line breaks

### 4. Advanced Filtering System

#### Date Range Filters

- **Custom date range**: Select start and end dates
- **Quick presets**: Last 7 days, Last 30 days, Last year
- **Active filter display**: Shows currently applied date filters

#### Sentiment Filters

- **AI-generated sentiments**: Filter by Very Positive, Positive, Neutral, Negative, Very Negative
- **Visual indicators**: Color-coded sentiment tags
- **Removable filters**: Easy to clear individual filters

#### AI Data Toggle

- **Optional AI insights**: Toggle display of AI-generated summaries and insights
- **Performance optimization**: Hide AI data for faster loading

### 5. Search Functionality

- **Full-text search**: Search across journal content, AI summaries, and insights
- **Real-time filtering**: Instant results as you type
- **Search term highlighting**: Clear indication of active search terms

### 6. AI-Powered Features

#### Sentiment Analysis

- **Automatic analysis**: AI analyzes journal content for sentiment
- **Sentiment scoring**: -1 to 1 scale with detailed categorization
- **Real-time analysis**: Available for new entries

#### AI Summaries

- **Automatic summaries**: AI generates concise summaries of journal entries
- **Expandable display**: Click to show/hide AI insights
- **Contextual insights**: AI provides additional reflections and observations

### 7. Responsive Design

- **Mobile-friendly**: Optimized for all screen sizes
- **Accessible**: Full keyboard navigation and screen reader support
- **Touch-friendly**: Large touch targets for mobile devices

### 8. Statistics Dashboard

- **Total entries**: Count of all journal entries
- **Monthly tracking**: Entries created this month
- **Average mood**: Calculated average mood rating with emoji

## Technical Implementation

### Frontend Components

1. **JournalPage.jsx**: Main page component with filtering and search
2. **JournalEntryCard.jsx**: Individual entry display with expand/collapse
3. **JournalFilters.jsx**: Advanced filtering interface
4. **Tag.jsx**: Reusable tag component for filters and status badges
5. **useJournal.js**: Custom hook for journal data management

### Backend API

1. **Journal Routes**: Full CRUD operations for journal entries
2. **Sentiment Analysis**: AI-powered sentiment analysis endpoint
3. **Filtering Support**: Date range, sentiment, and AI data filtering
4. **Check-in Integration**: Links journal entries to check-ins for mood data

### Database Schema

```sql
-- Journal entries table
CREATE TABLE journal_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    checkin_id VARCHAR(36),
    content TEXT NOT NULL,
    entry_date DATE NOT NULL,
    sentiment ENUM('very_negative', 'negative', 'neutral', 'positive', 'very_positive'),
    sentiment_score FLOAT,
    ai_insights TEXT,
    ai_summary TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

## Usage Guide

### Creating Journal Entries

1. Navigate to `/check-ins`
2. Complete a check-in with mood rating
3. Add journal content in the reflection section
4. Journal entry is automatically created with AI analysis

### Filtering Entries

1. Click "Show Filters" in the journal page
2. Select date range or use quick presets
3. Choose sentiment filter if desired
4. Toggle AI data display as needed

### Searching Entries

1. Use the search bar at the top of the page
2. Type keywords to search across content and AI summaries
3. Results update in real-time
4. Clear search with the X button

### Managing Entries

- **Edit**: Click edit button to modify entries (redirects to check-ins page)
- **Delete**: Click delete button with confirmation modal
- **View AI insights**: Expand AI summary sections for additional insights

## Accessibility Features

- **Keyboard navigation**: Full keyboard support for all interactions
- **Screen reader support**: Proper ARIA labels and semantic HTML
- **Focus management**: Clear focus indicators and logical tab order
- **Color contrast**: High contrast ratios for readability
- **Alternative text**: Descriptive text for all interactive elements

## Performance Considerations

- **Lazy loading**: AI data loaded on demand
- **Pagination ready**: Architecture supports future pagination
- **Efficient filtering**: Client-side filtering for immediate response
- **Optimized queries**: Backend uses efficient database queries

## Future Enhancements

- **Export functionality**: Export journal entries to PDF/CSV
- **Advanced analytics**: Mood trends and patterns over time
- **Journal templates**: Pre-defined reflection prompts
- **Collaboration**: Share journal entries with trusted contacts
- **Offline support**: Work with journal entries offline
