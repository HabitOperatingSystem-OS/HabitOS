# Goals Backend Testing Guide

This document explains how to test the goals functionality in the HabitOS backend.

## Overview

The goals testing suite includes:

1. **Integration Tests** (`test_goals.py`) - End-to-end API testing
2. **Unit Tests** (`tests/test_goals.py`) - Isolated component testing
3. **Test Runner** (`run_goals_tests.py`) - Automated test execution

## Test Coverage

### Integration Tests

- ✅ Complete API endpoint testing
- ✅ Authentication and authorization
- ✅ Goal CRUD operations
- ✅ Goal filtering and search
- ✅ Goal progress tracking
- ✅ Goal completion logic
- ✅ Error handling and validation
- ✅ Specialized endpoints (active, overdue, habit-specific)

### Unit Tests

- ✅ Goal model functionality
- ✅ Validation utilities
- ✅ API endpoint behavior
- ✅ Authorization and security
- ✅ Edge cases and error conditions

## Prerequisites

1. **Backend Setup**: Ensure the backend is properly configured
2. **Database**: PostgreSQL database should be running
3. **Dependencies**: Install required packages
4. **Test User**: The tests use a default test user

## Running Tests

### Option 1: Automated Test Runner (Recommended)

```bash
cd habitos/backend
python run_goals_tests.py
```

This will:

- Check if the backend is running
- Run integration tests (if backend is available)
- Run unit tests
- Provide a summary of results

### Option 2: Manual Integration Tests

```bash
cd habitos/backend

# Start the backend (in a separate terminal)
python run.py

# Run integration tests
python test_goals.py
```

### Option 3: Manual Unit Tests

```bash
cd habitos/backend

# Install pytest if not already installed
pip install pytest

# Run unit tests
python -m pytest tests/test_goals.py -v
```

## Test Configuration

### Test User

The tests use a default test user:

- Email: `test@example.com`
- Password: `testpassword123`

### Test Data

The integration tests will:

1. Create test habits if none exist
2. Create multiple test goals with different configurations
3. Test various goal types (count, duration, custom)
4. Test different priorities and statuses
5. Test overdue goals
6. Clean up test data (optional)

## What the Tests Verify

### API Endpoints Tested

- `GET /api/goals/` - List all goals with filtering
- `POST /api/goals/` - Create new goal
- `GET /api/goals/{id}` - Get specific goal
- `PUT /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal
- `PUT /api/goals/{id}/progress` - Update goal progress
- `GET /api/goals/active` - Get active goals
- `GET /api/goals/overdue` - Get overdue goals
- `GET /api/goals/habit/{habit_id}` - Get goals for specific habit
- `GET /api/goals/types` - Get available goal types
- `GET /api/goals/statuses` - Get available goal statuses
- `GET /api/goals/priorities` - Get available goal priorities

### Functionality Tested

- ✅ Goal creation with all required fields
- ✅ Goal validation (enum values, required fields)
- ✅ Goal progress tracking and completion
- ✅ Goal filtering by status, priority, and habit
- ✅ Goal overdue detection
- ✅ Goal serialization and API responses
- ✅ Error handling for invalid data
- ✅ Authorization and user isolation
- ✅ Database operations and rollbacks

### Edge Cases Tested

- ✅ Empty goal lists
- ✅ Invalid enum values
- ✅ Missing required fields
- ✅ Non-existent goals
- ✅ Cross-user access attempts
- ✅ Goal completion edge cases
- ✅ Date parsing and validation

## Expected Test Output

### Successful Integration Test

```
🎯 Testing Goals Functionality
============================================================

1. Logging in...
✅ Login successful

2. Getting available goal options...
✅ Found 5 goal types:
   - Count (count)
   - Duration (duration)
   - Distance (distance)
   - Weight (weight)
   - Custom (custom)
✅ Found 3 goal statuses:
   - In Progress (in_progress)
   - Completed (completed)
   - Abandoned (abandoned)
✅ Found 3 goal priorities:
   - Low (low)
   - Medium (medium)
   - High (high)

3. Getting available habits...
✅ Found 1 habits
   Using existing habit: Test Habit (ID: ...)

4. Creating test goals...
✅ Created goal 1: Exercise 30 times this month (ID: ...)
   Progress: 0/30 (0.0%)
✅ Created goal 2: Read for 100 hours (ID: ...)
   Progress: 0/100 (0.0%)
✅ Created goal 3 (overdue): Complete project by last week (ID: ...)
   Due date: 2024-01-01 (Overdue: True)

[... more test steps ...]

🎉 Goals functionality test completed!
📊 Summary:
   - Created 3 test goals
   - Tested all major endpoints
   - Verified filtering and specialized endpoints
   - Tested error handling
   - Validated goal completion logic
```

### Successful Unit Test

```
🧪 Running Goals Unit Tests
==================================================
============================= test session starts ==============================
platform darwin -- Python 3.9.7, pytest-6.2.5, py-1.10.0, pluggy-0.13.1
rootdir: /path/to/habitos/backend
plugins: hypothesis-6.75.3, cov-4.1.0, reportlog-0.3.0, timeout-2.1.0
collected 25 items

tests/test_goals.py::TestGoalValidation::test_validate_goal_status_valid PASSED
tests/test_goals.py::TestGoalValidation::test_validate_goal_status_invalid PASSED
tests/test_goals.py::TestGoalValidation::test_validate_goal_priority_valid PASSED
tests/test_goals.py::TestGoalValidation::test_validate_goal_priority_invalid PASSED
tests/test_goals.py::TestGoalValidation::test_validate_goal_type_valid PASSED
tests/test_goals.py::TestGoalValidation::test_validate_goal_type_invalid PASSED
tests/test_goals.py::TestGoalModel::test_goal_creation PASSED
tests/test_goals.py::TestGoalModel::test_goal_progress_calculation PASSED
tests/test_goals.py::TestGoalModel::test_goal_overdue_detection PASSED
tests/test_goals.py::TestGoalModel::test_goal_to_dict PASSED
tests/test_goals.py::TestGoalsAPI::test_get_goal_types PASSED
tests/test_goals.py::TestGoalsAPI::test_get_goal_statuses PASSED
tests/test_goals.py::TestGoalsAPI::test_get_goal_priorities PASSED
tests/test_goals.py::TestGoalsAPI::test_create_goal_success PASSED
tests/test_goals.py::TestGoalsAPI::test_create_goal_missing_required_fields PASSED
tests/test_goals.py::TestGoalsAPI::test_create_goal_invalid_enum_values PASSED
tests/test_goals.py::TestGoalsAPI::test_get_goals_empty PASSED
tests/test_goals.py::TestGoalsAPI::test_get_goals_with_data PASSED
tests/test_goals.py::TestGoalsAPI::test_get_goals_with_filters PASSED
tests/test_goals.py::TestGoalsAPI::test_get_goal_by_id PASSED
tests/test_goals.py::TestGoalsAPI::test_get_goal_by_id_not_found PASSED
tests/test_goals.py::TestGoalsAPI::test_update_goal PASSED
tests/test_goals.py::TestGoalsAPI::test_update_goal_progress PASSED
tests/test_goals.py::TestGoalsAPI::test_update_goal_progress_completion PASSED
tests/test_goals.py::TestGoalsAPI::test_delete_goal PASSED
tests/test_goals.py::TestGoalsAPI::test_get_active_goals PASSED
tests/test_goals.py::TestGoalsAPI::test_get_overdue_goals PASSED
tests/test_goals.py::TestGoalsAPI::test_get_habit_goals PASSED
tests/test_goals.py::TestGoalsAuthorization::test_goals_require_authentication PASSED
tests/test_goals.py::TestGoalsAuthorization::test_user_cannot_access_other_user_goals PASSED

============================== 25 passed in 2.34s ==============================
✅ Unit tests completed successfully
```

## Troubleshooting

### Common Issues

1. **Backend not running**

   ```
   ❌ Could not connect to server. Make sure the backend is running.
   ```

   Solution: Start the backend with `python run.py`

2. **Database connection issues**

   ```
   ❌ Failed to create goal: 500
   ```

   Solution: Check database configuration and ensure PostgreSQL is running

3. **Authentication failures**

   ```
   ❌ Login failed: 401
   ```

   Solution: Ensure the test user exists or create it manually

4. **Missing dependencies**
   ```
   ❌ pytest not available. Install with: pip install pytest
   ```
   Solution: Install pytest with `pip install pytest`

### Debug Mode

To run tests with more verbose output:

```bash
# Integration tests with debug
python test_goals.py

# Unit tests with debug
python -m pytest tests/test_goals.py -v -s
```

## Contributing

When adding new goals functionality:

1. Add corresponding integration tests to `test_goals.py`
2. Add corresponding unit tests to `tests/test_goals.py`
3. Update this documentation
4. Ensure all tests pass before submitting

## Test Data Cleanup

The integration tests will ask if you want to clean up test data:

```
11. Cleaning up test data...
Do you want to delete the test goals? (y/N):
```

- Answer `y` to delete test goals
- Answer `n` to keep test data for manual inspection

Test data is automatically cleaned up in unit tests.
