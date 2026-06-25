import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import api from "../api/axios";
import DashboardTab from "../components/DashboardTab";
import ProductFormModal from "../components/ProductFormModal";
import StatusBadge from "../components/StatusBadge";

const ORDER_STATUSES = ["placed", "preparing", "out_for_delivery", "delivered", "cancelled"];

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(undefined); // undefined = closed, null = new

  const loadAll = () => {
    Promise.all([api.get("/products"), api.get("/categories"), api.get("/admin/orders")]).then(
      ([p, c, o]) => {
        setProducts(p.data);
        setCategories(c.data);
        setOrders(o.data);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveProduct = async (data) => {
    if (editingProduct?.id) {
      await api.put(`/admin/products/${editingProduct.id}`, data);
    } else {
      await api.post("/admin/products", data);
    }
    setEditingProduct(undefined);
    loadAll();
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    await api.delete(`/admin/products/${id}`);
    loadAll();
  };

  const handleStatusChange = async (orderId, status) => {
    await api.patch(`/admin/orders/${orderId}/status`, { status });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  if (loading) {
    return (
      <div className="center-page">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container page">
      <h1 style={{ marginBottom: 24 }}>{t("admin.title")}</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {["dashboard", "orders", "products"].map((tabName) => (
          <button
            key={tabName}
            className="btn btn-sm"
            onClick={() => setTab(tabName)}
            style={{
              background: tab === tabName ? "var(--color-ink)" : "transparent",
              color: tab === tabName ? "#fff" : "var(--color-ink)",
              border: "1.5px solid var(--color-ink)",
            }}
          >
            {t(`admin.${tabName}`)}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab />}

      {tab === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div>
                  <p style={{ fontWeight: 700 }}>
                    {t("orders.order")} #{order.id} — {t("admin.customer")} #{order.user_id}
                  </p>
                  <p className="text-muted" style={{ fontSize: "0.82rem" }}>
                    {new Date(order.created_at).toLocaleString(isAr ? "ar-EG" : "en-US")} ·{" "}
                    {order.payment_method === "cod" ? t("checkout.cod") : t("checkout.online")}
                    {order.payment_method === "online" && order.is_paid ? " ✓" : ""}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div style={{ fontSize: "0.88rem", marginBottom: 10 }}>
                {order.items.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>
                      {item.quantity}× {isAr ? item.product?.name_ar : item.product?.name_en}
                    </span>
                    <span>{(item.price_at_purchase * item.quantity).toFixed(0)} {t("menu.egp")}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--color-line)",
                  paddingTop: 10,
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontWeight: 700 }}>
                  {t("orders.total")}: {order.total_price.toFixed(0)} {t("menu.egp")}
                </span>
                <select
                  className="input"
                  style={{ maxWidth: 220 }}
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(`status.${s}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <>
          <button className="btn btn-primary" onClick={() => setEditingProduct(null)} style={{ marginBottom: 18 }}>
            {t("admin.addProduct")}
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {products.map((product) => (
              <div
                key={product.id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    background: "var(--color-line)",
                    flexShrink: 0,
                  }}
                >
                  {product.image_url && (
                    <img src={product.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600 }}>
                    {product.name_en} / {product.name_ar}
                  </p>
                  <p className="text-muted" style={{ fontSize: "0.82rem" }}>
                    {product.price} {t("menu.egp")} {!product.is_available && `· ${t("menu.unavailable")}`}
                  </p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => setEditingProduct(product)}>
                  {t("admin.edit")}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(product.id)}>
                  {t("admin.delete")}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {editingProduct !== undefined && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => setEditingProduct(undefined)}
        />
      )}
    </div>
  );
}