# backend/test_config.py
import os
from dotenv import load_dotenv
from app.config.config import config

load_dotenv()

def test_config():
    # Test development config
    dev_config = config['development']()
    
    print("Configuration Test Results:")
    print("-" * 50)
    print(f"Environment: development")
    print(f"Debug: {dev_config.DEBUG}")
    print(f"Database URI: {dev_config.SQLALCHEMY_DATABASE_URI}")
    print(f"JWT Secret: {'[SET]' if dev_config.JWT_SECRET_KEY else '[NOT SET]'}")
    print(f"Mail Server: {dev_config.MAIL_SERVER}")
    print(f"Mail Username: {dev_config.MAIL_USERNAME or '[NOT SET]'}")
    print(f"OpenAI API Key: {'[SET]' if dev_config.OPENAI_API_KEY else '[NOT SET]'}")
    print("-" * 50)

if __name__ == "__main__":
    test_config()