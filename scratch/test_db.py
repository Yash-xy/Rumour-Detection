import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app.config import DATABASE_URL
    print(f"Testing connection to: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL, connect_args={'connect_timeout': 5})
    connection = engine.connect()
    print("Connection successful!")
    from sqlalchemy import text
    result = connection.execute(text("SELECT count(*) FROM history"))
    count = result.scalar()
    print(f"Row count in history table: {count}")
    connection.close()
except Exception as e:
    print(f"Connection failed: {e}")
