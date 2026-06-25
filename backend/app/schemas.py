from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr

from .models import OrderStatus, PaymentMethod, UserRole


# ---------- Auth ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Category ----------
class CategoryOut(BaseModel):
    id: int
    name_en: str
    name_ar: str

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name_en: str
    name_ar: str


# ---------- Product ----------
class ProductBase(BaseModel):
    name_en: str
    name_ar: str
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_available: bool = True
    category_id: Optional[int] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    category_id: Optional[int] = None


class ProductOut(ProductBase):
    id: int

    class Config:
        from_attributes = True


# ---------- Order ----------
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    payment_method: PaymentMethod
    delivery_address: str


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_purchase: float
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    user_id: int
    total_price: float
    payment_method: PaymentMethod
    is_paid: bool
    status: OrderStatus
    delivery_address: str
    created_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# ---------- Analytics ----------
class RevenuePoint(BaseModel):
    date: str  # YYYY-MM-DD
    revenue: float
    order_count: int


class StatusCount(BaseModel):
    status: OrderStatus
    count: int


class TopProduct(BaseModel):
    product_id: int
    name_en: str
    name_ar: str
    quantity_sold: int
    revenue: float


class PaymentBreakdown(BaseModel):
    payment_method: PaymentMethod
    order_count: int
    revenue: float


class AnalyticsSummary(BaseModel):
    total_revenue: float
    total_orders: int
    average_order_value: float
    revenue_over_time: List[RevenuePoint]
    orders_by_status: List[StatusCount]
    top_products: List[TopProduct]
    revenue_by_payment_method: List[PaymentBreakdown]