"""
Vyuha Database Connection
Attempts connecting to PostgreSQL first.
If Postgres is unavailable or auth fails, falls back automatically to a local SQLite database (vyuha.db).
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
SQLITE_URL = "sqlite:///vyuha.db"

# Try connecting to Postgres first
try:
    print(f"Connecting to primary database: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL, echo=False)
    # Test connection immediately
    with engine.connect() as conn:
        pass
    print("Successfully connected to primary PostgreSQL database.")
except (OperationalError, Exception) as e:
    print(f"PostgreSQL connection failed ({e}). Falling back to local SQLite database: {SQLITE_URL}")
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False}, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency: yields a DB session and ensures it closes after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
