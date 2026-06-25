import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import seed
from .database import Base, SessionLocal, engine
from .models import User
from .routers import auth_router, orders_router, products_router

logger = logging.getLogger("uvicorn.error")

Base.metadata.create_all(bind=engine)

# Auto-seed on first boot if the database is empty. Locally you'd normally
# run `python -m app.seed` once by hand, but on a host like Render/Railway
# there's no interactive shell, so the app seeds itself the first time it
# starts. Using the uvicorn logger (not print) so this reliably shows up
# in the platform's log viewer, and wrapping in try/except so a failure
# here is visible instead of silently leaving the database empty.
try:
    _db = SessionLocal()
    try:
        user_count = _db.query(User).count()
        logger.info(f"Startup check: {user_count} users currently in database.")
        if user_count == 0:
            logger.info("Database is empty — running seed...")
            seed.run()
            logger.info("Seed finished.")
        else:
            logger.info("Database already has data — skipping seed.")
    finally:
        _db.close()
except Exception:
    logger.exception("Seeding failed with an exception:")

app = FastAPI(title="Food Ordering API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://kiroazmy123.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(products_router.router)
app.include_router(orders_router.router)


@app.get("/")
def root():
    return {"message": "Food Ordering API is running"}