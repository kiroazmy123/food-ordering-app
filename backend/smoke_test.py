"""
One-shot smoke test: starts uvicorn, exercises auth/products/orders/admin
endpoints, then shuts the server down. Run with:
    python3 smoke_test.py
"""
import json
import subprocess
import sys
import time

import requests

BASE = "http://localhost:8000"


def main():
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    try:
        # Wait for server to be ready
        for _ in range(30):
            try:
                r = requests.get(f"{BASE}/", timeout=1)
                if r.status_code == 200:
                    break
            except requests.exceptions.ConnectionError:
                time.sleep(0.3)
        else:
            raise RuntimeError("Server did not start in time")

        print("1. Root:", requests.get(f"{BASE}/").json())

        products = requests.get(f"{BASE}/api/products").json()
        print(f"2. Products count: {len(products)}")
        assert len(products) > 0, "No products seeded"

        categories = requests.get(f"{BASE}/api/categories").json()
        print(f"3. Categories count: {len(categories)}")

        # Customer login
        login = requests.post(
            f"{BASE}/api/auth/login",
            data={"username": "customer@food.app", "password": "customer123"},
        )
        assert login.status_code == 200, f"Customer login failed: {login.text}"
        customer_token = login.json()["access_token"]
        print("4. Customer login OK")

        # Place an order (COD)
        order_resp = requests.post(
            f"{BASE}/api/orders",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={
                "items": [
                    {"product_id": products[0]["id"], "quantity": 2},
                    {"product_id": products[3]["id"], "quantity": 1},
                ],
                "payment_method": "cod",
                "delivery_address": "6 October City, Cairo",
            },
        )
        assert order_resp.status_code == 201, f"Order placement failed: {order_resp.text}"
        order = order_resp.json()
        print(f"5. Order placed: id={order['id']}, total={order['total_price']}, status={order['status']}")

        # Customer views own orders
        my_orders = requests.get(
            f"{BASE}/api/orders/my", headers={"Authorization": f"Bearer {customer_token}"}
        ).json()
        print(f"6. Customer's own orders count: {len(my_orders)}")

        # Online payment order
        online_order = requests.post(
            f"{BASE}/api/orders",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={
                "items": [{"product_id": products[1]["id"], "quantity": 1}],
                "payment_method": "online",
                "delivery_address": "Nasr City, Cairo",
            },
        ).json()
        print(f"7. Online-paid order is_paid={online_order['is_paid']} (should be True)")
        assert online_order["is_paid"] is True

        # Admin login
        admin_login = requests.post(
            f"{BASE}/api/auth/login",
            data={"username": "admin@food.app", "password": "admin123"},
        )
        assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
        admin_token = admin_login.json()["access_token"]
        print("8. Admin login OK")

        # Non-admin blocked from admin route
        forbidden = requests.get(
            f"{BASE}/api/admin/orders", headers={"Authorization": f"Bearer {customer_token}"}
        )
        print(f"9. Customer hitting admin route -> {forbidden.status_code} (should be 403)")
        assert forbidden.status_code == 403

        # Admin views all orders
        all_orders = requests.get(
            f"{BASE}/api/admin/orders", headers={"Authorization": f"Bearer {admin_token}"}
        ).json()
        print(f"10. Admin sees all orders, count={len(all_orders)}")
        assert len(all_orders) >= 2

        # Admin updates order status
        status_update = requests.patch(
            f"{BASE}/api/admin/orders/{order['id']}/status",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": "preparing"},
        )
        assert status_update.status_code == 200, status_update.text
        print(f"11. Order status updated -> {status_update.json()['status']}")

        # Admin creates a new product
        new_product = requests.post(
            f"{BASE}/api/admin/products",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name_en": "Test Falafel",
                "name_ar": "فلافل تجريبي",
                "price": 25.0,
                "category_id": categories[0]["id"],
            },
        )
        assert new_product.status_code == 200, new_product.text
        print(f"12. Admin created product id={new_product.json()['id']}")

        # Verify product count increased
        products_after = requests.get(f"{BASE}/api/products").json()
        assert len(products_after) == len(products) + 1
        print(f"13. Product count after creation: {len(products_after)} (was {len(products)})")

        print("\nALL CHECKS PASSED")
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()


if __name__ == "__main__":
    main()
