from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db

router = APIRouter(prefix="/api", tags=["orders"])


@router.post("/orders", response_model=schemas.OrderOut, status_code=201)
def place_order(
    payload: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    total_price = 0.0
    order_items = []
    for item in payload.items:
        product = (
            db.query(models.Product).filter(models.Product.id == item.product_id).first()
        )
        if not product or not product.is_available:
            raise HTTPException(
                status_code=400, detail=f"Product {item.product_id} is unavailable"
            )
        if item.quantity < 1:
            raise HTTPException(status_code=400, detail="Quantity must be at least 1")

        total_price += product.price * item.quantity
        order_items.append(
            models.OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price_at_purchase=product.price,
            )
        )

    order = models.Order(
        user_id=current_user.id,
        total_price=round(total_price, 2),
        payment_method=payload.payment_method,
        # Online payment is mocked: we mark it paid immediately since there's
        # no real payment gateway integration in this prototype.
        is_paid=(payload.payment_method == models.PaymentMethod.online),
        delivery_address=payload.delivery_address,
        items=order_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders/my", response_model=List[schemas.OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.Order)
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )


@router.get("/orders/{order_id}", response_model=schemas.OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return order


# ---------- Admin ----------
@router.get("/admin/orders", response_model=List[schemas.OrderOut])
def list_all_orders(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_current_admin),
):
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()


@router.patch("/admin/orders/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_current_admin),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


@router.get("/admin/analytics", response_model=schemas.AnalyticsSummary)
def get_analytics(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.get_current_admin),
):
    # Cancelled orders are excluded from revenue figures; everything else
    # (placed/preparing/out_for_delivery/delivered) counts as real revenue,
    # matching what's shown in the admin order list.
    orders = (
        db.query(models.Order)
        .filter(models.Order.status != models.OrderStatus.cancelled)
        .all()
    )

    total_revenue = sum(o.total_price for o in orders)
    total_orders = len(orders)
    average_order_value = round(total_revenue / total_orders, 2) if total_orders else 0.0

    # --- Revenue over time (grouped by calendar day) ---
    by_day: dict[str, dict] = {}
    for o in orders:
        day = o.created_at.strftime("%Y-%m-%d")
        bucket = by_day.setdefault(day, {"revenue": 0.0, "order_count": 0})
        bucket["revenue"] += o.total_price
        bucket["order_count"] += 1
    revenue_over_time = [
        schemas.RevenuePoint(date=day, revenue=round(v["revenue"], 2), order_count=v["order_count"])
        for day, v in sorted(by_day.items())
    ]

    # --- Orders by status (all orders, including cancelled, for a true count) ---
    all_orders = db.query(models.Order).all()
    status_counts: dict[str, int] = {}
    for o in all_orders:
        status_counts[o.status.value] = status_counts.get(o.status.value, 0) + 1
    orders_by_status = [
        schemas.StatusCount(status=status, count=count)
        for status, count in status_counts.items()
    ]

    # --- Top products by quantity sold ---
    product_stats: dict[int, dict] = {}
    for o in orders:
        for item in o.items:
            stats = product_stats.setdefault(
                item.product_id,
                {"quantity_sold": 0, "revenue": 0.0, "name_en": "", "name_ar": ""},
            )
            stats["quantity_sold"] += item.quantity
            stats["revenue"] += item.price_at_purchase * item.quantity
            if item.product:
                stats["name_en"] = item.product.name_en
                stats["name_ar"] = item.product.name_ar

    top_products = sorted(
        (
            schemas.TopProduct(
                product_id=pid,
                name_en=s["name_en"] or f"Product {pid}",
                name_ar=s["name_ar"] or f"منتج {pid}",
                quantity_sold=s["quantity_sold"],
                revenue=round(s["revenue"], 2),
            )
            for pid, s in product_stats.items()
        ),
        key=lambda p: p.quantity_sold,
        reverse=True,
    )[:5]

    # --- Revenue by payment method ---
    payment_stats: dict[str, dict] = {}
    for o in orders:
        bucket = payment_stats.setdefault(
            o.payment_method.value, {"order_count": 0, "revenue": 0.0}
        )
        bucket["order_count"] += 1
        bucket["revenue"] += o.total_price
    revenue_by_payment_method = [
        schemas.PaymentBreakdown(
            payment_method=method,
            order_count=v["order_count"],
            revenue=round(v["revenue"], 2),
        )
        for method, v in payment_stats.items()
    ]

    return schemas.AnalyticsSummary(
        total_revenue=round(total_revenue, 2),
        total_orders=total_orders,
        average_order_value=average_order_value,
        revenue_over_time=revenue_over_time,
        orders_by_status=orders_by_status,
        top_products=top_products,
        revenue_by_payment_method=revenue_by_payment_method,
    )