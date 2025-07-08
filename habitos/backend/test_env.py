# backend/test_env.py
import os
from dotenv import load_dotenv

load_dotenv()

def test_env_vars():
    required_vars = [
        'DATABASE_URL',
        'JWT_SECRET_KEY',
        'SECRET_KEY',
        'FLASK_ENV',
        'FLASK_APP'
    ]
    
    print("Environment Variables Status:")
    print("-" * 40)
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Don't print full secrets, just confirm they exist
            if 'SECRET' in var or 'PASSWORD' in var:
                print(f"✅ {var}: [HIDDEN - {len(value)} chars]")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NOT SET")
    
    print("-" * 40)

if __name__ == "__main__":
    test_env_vars()