# Occurrence Days Feature for Habits

## Overview

The Occurrence Days feature allows users to specify exactly which days their weekly and monthly habits should occur on, making habit tracking more precise and intuitive.

## Features

### 🗓️ Weekly Habits

- Users can select one or more days of the week (Monday through Sunday)
- Habits are only due on the selected days
- Example: "Gym Workout" on Monday, Wednesday, Friday

### 📅 Monthly Habits

- Users can select specific dates of the month (1st through 31st)
- Habits are only due on the selected dates
- Example: "Pay Bills" on the 1st and 15th of each month

### 📝 Daily Habits

- No changes to existing functionality
- Habits occur every day as before

## Implementation Details

### Backend Changes

#### Database Schema

- Added `occurrence_days` column to the `habits` table
- Stores JSON array of selected days
- For weekly habits: `["Monday", "Wednesday", "Friday"]`
- For monthly habits: `[1, 15, 28]`

#### Model Updates (`habitos/backend/app/models/habit.py`)

```python
# New field
occurrence_days = db.Column(db.Text, default='[]')

# Property for easy access
@property
def occurrence_days_list(self):
    return json.loads(self.occurrence_days) if self.occurrence_days else []

# Updated is_due_today method
def is_due_today(self):
    # Checks if today matches the selected occurrence days
    return self._is_scheduled_day(today)
```

#### API Updates (`habitos/backend/app/routes/habits.py`)

- Create and update endpoints now accept `occurrence_days` parameter
- Validation ensures at least one day is selected for weekly/monthly habits

### Frontend Changes

#### Form Component (`habitos/frontend/src/features/habits/HabitFormModal.jsx`)

- New `DaySelector` component for weekly and monthly habits
- Dynamic UI that shows day picker based on selected frequency
- Form validation requires day selection for weekly/monthly habits

#### Day Selector UI

- **Weekly**: 7-day grid with day abbreviations (Mon, Tue, Wed, etc.)
- **Monthly**: Calendar-style grid with numbers 1-31
- **Smart Selection**: Prevents selecting more days than frequency_count
- **Progress Indicators**: Shows how many days selected vs. required
- **Visual Feedback**: Color-coded status messages (blue for in-progress, green for complete)
- **Responsive Design**: Hover effects and smooth transitions

#### Habit Cards (`habitos/frontend/src/features/habits/HabitCard.jsx`)

- Display selected days in the frequency text
- Weekly: "Weekly • Mon, Wed, Fri"
- Monthly: "Monthly • 1, 15"

## Usage Examples

### Creating a Weekly Habit

1. Click "New Habit"
2. Enter title: "Gym Workout"
3. Select category: "Fitness"
4. Select frequency: "Weekly"
5. Set frequency count: 3 (e.g., 3 times per week)
6. **Day selector appears** - select exactly 3 days (e.g., Monday, Wednesday, Friday)
7. Save habit

### Creating a Monthly Habit

1. Click "New Habit"
2. Enter title: "Pay Bills"
3. Select category: "Personal"
4. Select frequency: "Monthly"
5. Set frequency count: 2 (e.g., 2 times per month)
6. **Day selector appears** - select exactly 2 dates (e.g., 1st and 15th)
7. Save habit

## Technical Implementation

### Database Migration

```sql
-- Migration: add_occurrence_days_to_habits
ALTER TABLE habits ADD COLUMN occurrence_days TEXT DEFAULT '[]';
```

### Data Structure

```json
{
  "id": "habit-uuid",
  "title": "Gym Workout",
  "frequency": "weekly",
  "occurrence_days": ["Monday", "Wednesday", "Friday"],
  "frequency_count": 3
}
```

### Validation Rules

- **Weekly habits**: Must select exactly the number of days specified in frequency_count
  - If frequency_count is 2, user must select exactly 2 days of the week
  - If frequency_count is 1 (or empty), user must select exactly 1 day
- **Monthly habits**: Must select exactly the number of dates specified in frequency_count
  - If frequency_count is 3, user must select exactly 3 dates of the month
  - If frequency_count is 1 (or empty), user must select exactly 1 date
- **Daily habits**: No day selection required
- **UI Feedback**: Shows progress indicators and prevents over-selection
- **Backend Validation**: Server-side validation ensures data integrity

## Benefits

1. **Precision**: Users can specify exact days for their habits
2. **Flexibility**: Support for complex scheduling patterns
3. **Intuitive**: Visual day picker makes selection easy
4. **Consistent**: Works seamlessly with existing habit tracking
5. **Scalable**: Easy to extend for future scheduling features

## Testing

### Manual Testing

1. Start backend: `cd backend && pipenv run python run.py`
2. Start frontend: `cd frontend && npm run dev`
3. Create habits with different frequencies
4. Verify day selection works correctly
5. Check that habits only appear as "due" on selected days

### Automated Testing

Run the test script: `cd backend && pipenv run python test_occurrence_days.py`

## Future Enhancements

- **Custom intervals**: "Every 3 days", "Every 2 weeks"
- **Time-based scheduling**: Specific times of day
- **Recurring patterns**: "First Monday of month"
- **Calendar integration**: Sync with external calendars
- **Smart suggestions**: AI-powered day recommendations

## Files Modified

### Backend

- `app/models/habit.py` - Added occurrence_days field and logic
- `app/routes/habits.py` - Updated API endpoints
- `migrations/versions/3a9902290eb4_add_occurrence_days_to_habits.py` - Database migration

### Frontend

- `src/features/habits/HabitFormModal.jsx` - Added DaySelector component
- `src/features/habits/HabitCard.jsx` - Updated to display occurrence days

### Documentation

- `OCCURRENCE_DAYS_FEATURE.md` - This documentation file
- `test_occurrence_days.py` - Test script for verification

## Conclusion

The Occurrence Days feature significantly improves the habit tracking experience by allowing users to create more precise and realistic habit schedules. The implementation is robust, user-friendly, and maintains backward compatibility with existing habits.
