# Sufra — Online Food Ordering (Prototype)

A full-stack food ordering web app prototype.

**Stack:** React (Vite) + FastAPI + SQLite

## Features

- Menu with images, prices, categories (filterable)
- Cart + checkout with Cash on Delivery or mocked Online Payment
- JWT-based auth (signup/login)
- Order status tracking (`placed → preparing → out_for_delivery → delivered`), auto-refreshing every 15s
- Admin dashboard: manage products (create/edit/delete), view & update order status
- Full Arabic + English UI with RTL layout switch

## 1. Run the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed              # creates DB + sample menu + demo users
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. Interactive API docs: `http://localhost:8000/docs`.

## 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Demo accounts (created by the seed script)

| Role     | Email              | Password    |
|----------|--------------------|-------------|
| Admin    | admin@food.app     | admin123    |
| Customer | customer@food.app  | customer123 |

You can also sign up a new customer account from the UI.

## Project structure

```
backend/
  app/
    main.py          # FastAPI app, CORS, router registration
    models.py        # SQLAlchemy models (User, Product, Category, Order, OrderItem)
    schemas.py        # Pydantic request/response schemas
    auth.py           # JWT creation/validation, password hashing
    seed.py            # Sample data + demo users
    routers/
      auth_router.py
      products_router.py
      orders_router.py
  smoke_test.py        # End-to-end API test script (optional, for verification)

frontend/
  src/
    api/axios.js        # Axios instance with JWT interceptor
    context/             # Auth + Cart React contexts
    i18n/                 # en.json / ar.json + i18next config
    components/
    pages/
```

## Notes on scope (24h prototype decisions)

- **Payment:** "Online payment" is mocked — selecting it just marks the order `is_paid=True` immediately. No real payment gateway is integrated.
- **Order tracking:** simple polling (every 15s) rather than websockets — easiest reliable way to show live-ish status in the time available.
- **Database:** SQLite file, zero setup. Swap `SQLALCHEMY_DATABASE_URL` in `database.py` for Postgres if needed later.
- **Auth:** JWT bearer tokens, 24h expiry, stored in `localStorage` on the frontend.
