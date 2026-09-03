import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from src.config.settings import settings
from src.utils.logger import logger
from src.database.models import Base

# Ensure storage directory exists
storage_dir = settings.BASE_DIR / "storage"
storage_dir.mkdir(parents=True, exist_ok=True)

# SQLite connect args
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Create all database tables if they do not exist."""
    try:
        logger.info(f"Initializing database tables on: {settings.DATABASE_URL}")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}")
        raise

def get_db():
    """FastAPI Dependency for database session management."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
