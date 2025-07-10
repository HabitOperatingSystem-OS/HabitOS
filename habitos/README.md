# HabitOS

A mindful self-development web app for building consistent habits and tracking emotional well-being.

## Quick Start

1. **Clone and Setup:**
   ```bash
   git clone <your-repo>
   cd habitos
   ```

2. **Start with Docker:**
   ```bash
   docker-compose up
   ```

3. **Or Manual Setup:**
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Setup database
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   
   # Run backend
   python run.py
   ```

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/health` - Health check

## Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp backend/.env.example backend/.env
```

## Database Setup

```bash
cd backend
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Development

- Backend runs on http://localhost:5000
- Database runs on localhost:5432
- API documentation: http://localhost:5000/api/health

## Next Steps

1. Set up frontend React app
2. Implement remaining API endpoints
3. Add authentication middleware
4. Create database migrations
5. Add testing suite
