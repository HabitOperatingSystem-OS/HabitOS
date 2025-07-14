# Dashboard Features

## Overview

The HabitOS Dashboard provides a comprehensive overview of user's habit tracking progress with interactive components and real-time data visualization.

## Features Implemented

### 1. Streak Chart (Chart.js)

- **Component**: `StreakChart.jsx`
- **Library**: Chart.js with react-chartjs-2
- **Features**:
  - Line chart showing habit completion over the last 7 days
  - Smooth curved lines with gradient fill
  - Interactive tooltips with detailed information
  - Responsive design that adapts to screen size
  - Average and best day statistics displayed below chart

### 2. Today's Habit Check-in List

- **Component**: `TodayHabits.jsx`
- **Features**:
  - Interactive checkboxes to mark habits as complete
  - Visual indicators for completion status
  - Mood badges with emojis for completed habits
  - Streak counters for each habit
  - Category and time information
  - Progress tracking (X of Y completed)
  - Empty state when no habits are scheduled

### 3. Mood Summary

- **Component**: `MoodSummary.jsx`
- **Features**:
  - Average mood display with emoji
  - Mood breakdown with percentage bars
  - Color-coded mood indicators
  - Recent mood insights
  - Based on recent check-ins data

### 4. Statistics Cards

- **Component**: `StatsCard.jsx`
- **Features**:
  - Active Habits count
  - Current Streak (days)
  - Completion Rate (percentage)
  - Goals Achieved count
  - Trend indicators (positive/negative changes)
  - Color-coded icons for each metric

### 5. API Integration

- **Service**: `api.js`
- **Hook**: `useDashboard.js`
- **Features**:
  - RESTful API calls to `/api/dashboard`
  - Automatic authentication with JWT tokens
  - Error handling and fallback to mock data
  - Loading states and error states
  - Data refresh functionality

## Technical Implementation

### Frontend Architecture

```
src/
├── components/
│   ├── dashboard/
│   │   ├── StreakChart.jsx      # Chart.js visualization
│   │   ├── TodayHabits.jsx      # Habit list with interactions
│   │   ├── MoodSummary.jsx      # Mood analytics
│   │   └── StatsCard.jsx        # Reusable stat cards
│   └── common/
│       └── LoadingSpinner.jsx   # Loading state component
├── hooks/
│   └── useDashboard.js          # Data fetching and state management
├── services/
│   └── api.js                   # API service layer
└── pages/
    └── Dashboard.jsx            # Main dashboard page
```

### Backend API

- **Endpoint**: `GET /api/dashboard`
- **Authentication**: JWT required
- **Response**: Aggregated dashboard data including:
  - Statistics (habits, streaks, completion rates)
  - Streak chart data (7-day history)
  - Today's habits with completion status
  - Mood summary from recent check-ins

### Data Flow

1. Dashboard component loads
2. `useDashboard` hook fetches data from API
3. If API fails, falls back to mock data
4. Components render with fetched data
5. User interactions trigger data updates

## Responsive Design

The dashboard uses Tailwind CSS for responsive design:

- **Mobile**: Single column layout
- **Tablet**: Two-column grid for habits and mood
- **Desktop**: Full three-column layout with sidebar

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live data
2. **Advanced Analytics**: More detailed charts and insights
3. **Customization**: User-configurable dashboard layout
4. **Export Features**: PDF/CSV export of dashboard data
5. **Notifications**: Real-time alerts for habit reminders

## Usage

1. Navigate to `/dashboard` in the application
2. View your habit progress and statistics
3. Click checkboxes to mark habits as complete
4. Switch between tabs for different views
5. Use quick action buttons for common tasks

## Dependencies

- `chart.js`: Chart visualization library
- `react-chartjs-2`: React wrapper for Chart.js
- `lucide-react`: Icon library
- `axios`: HTTP client for API calls
- `tailwindcss`: Styling framework
