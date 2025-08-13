# About the Project [(Deployed Link)](https://habitos-frontend.onrender.com/)

<img width="1050" height="1180" alt="Screenshot 2025-08-13 at 12 34 51 PM" src="https://github.com/user-attachments/assets/a1c88e6f-dd51-48d7-aa7c-e3f44f62032e" />

## What
- HabitOS is a mindful self-development web app designed to help users build consistent habits, track emotional well-being, and visualize progress over time. It combines habit streak tracking, mood journaling, interactive dashboards, and optional AI insights to promote long-term behavioral and emotional growth.

## Why
- Students and early professionals often struggle to maintain productive routines while balancing work, school, and mental health. HabitOS helps users stay consistent with small wins while fostering self-awareness and reflection without relying on gamification or oversimplification.
  
## Who
- Target users are students, young professionals, and self-improvement enthusiasts aged 18–35 who seek to build meaningful, consistent habits and better emotional clarity.
  
## Project Tech Stack 
- **Backend:** Python, Flask, SQLAlchemy, Alembic, PostgreSQL, Google Gemini API
- **Frontend:** React, Vite, Tailwind CSS, Radix UI, Framer Motion, Chart.js
- **Deployment:** Docker, Render

## Project Set Up Instructions:
Before you begin, ensure you have the following installed on your system:

- **Docker & Docker Compose** - For running the application stack
- **Node.js** (v18 or higher) - For frontend development
- **Python** (v3.8 or higher) - For backend development
- **Git** - For cloning the repository

The fastest way to get started is using Docker Compose, which will set up all services automatically:

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd habitos
   ```
2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env file with your preferred values
   ```
3. **Start the application**
   ```bash
   ./start.sh
   ```
   Or manually with Docker Compose:
   ```bash
   docker-compose up -d
   ```
4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

# **Happy Habit Building! 🎯**
