import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# DB_PATH lets us point SQLite at a persistent mounted volume on hosts like
# Railway (set DB_PATH=/data/food_ordering.db there), while still defaulting
# to a plain local file for development on your own machine.
DB_PATH = os.getenv("DB_PATH", "./food_ordering.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()