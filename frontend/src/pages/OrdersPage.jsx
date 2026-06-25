import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";

const POLL_INTERVAL_MS = 15000;

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    api
      .get("/orders/my")
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // Order tracking is intentionally simple for this prototype: poll
    // periodically instead of a websocket connection.
    const interval = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="center-page">
        <div className="spinner" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container page">
        <h1 style={{ marginBottom: 16 }}>{t("orders.title")}</h1>
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p className="text-muted">{t("orders.empty")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1 style={{ marginBottom: 24 }}>{t("orders.title")}</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orders.map((order) => (
          <div
            key={order.id}
            className="card"
            style={{
              padding: 20,
              border:
                highlightId && Number(highlightId) === order.id
                  ? "2px solid var(--color-spice)"
                  : undefined,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <p style={{ fontWeight: 700 }}>
                  {t("orders.order")} #{order.id}
                </p>
                <p className="text-muted" style={{ fontSize: "0.82rem" }}>
                  {new Date(order.created_at).toLocaleString(isAr ? "ar-EG" : "en-US")}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}
                >
                  <span>
                    {item.quantity}× {isAr ? item.product?.name_ar : item.product?.name_en}
                  </span>
                  <span>
                    {(item.price_at_purchase * item.quantity).toFixed(0)} {t("menu.egp")}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: "1px solid var(--color-line)",
                paddingTop: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                {t("orders.payment")}:{" "}
                {order.payment_method === "cod" ? t("checkout.cod") : t("checkout.online")}
                {order.payment_method === "online" && order.is_paid ? " ✓" : ""}
              </span>
              <span style={{ fontWeight: 700 }}>
                {t("orders.total")}: {order.total_price.toFixed(0)} {t("menu.egp")}
              </span>
            </div>
            <p className="text-muted" style={{ fontSize: "0.82rem", marginTop: 8 }}>
              {t("orders.address")}: {order.delivery_address}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
