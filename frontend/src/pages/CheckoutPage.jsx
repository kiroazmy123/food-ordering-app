import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  if (!user) {
    return (
      <div className="container page">
        <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
          <p style={{ marginBottom: 16 }}>{t("checkout.loginRequired")}</p>
          <Link to="/login" className="btn btn-primary">
            {t("nav.login")}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError(t("common.error"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post("/orders", {
        items: items.map(({ product, quantity }) => ({
          product_id: product.id,
          quantity,
        })),
        payment_method: paymentMethod,
        delivery_address: address.trim(),
      });
      clearCart();
      navigate(`/orders?highlight=${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <h1 style={{ marginBottom: 24 }}>{t("checkout.title")}</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
          <div className="field">
            <label htmlFor="address">{t("checkout.address")}</label>
            <textarea
              id="address"
              className="input"
              rows={3}
              placeholder={t("checkout.addressPlaceholder")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>{t("checkout.paymentMethod")}</label>
            <div style={{ display: "flex", gap: 12 }}>
              {["cod", "online"].map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className="btn"
                  style={{
                    flex: 1,
                    border: "1.5px solid",
                    borderColor:
                      paymentMethod === method ? "var(--color-spice)" : "var(--color-line)",
                    background:
                      paymentMethod === method ? "rgba(193,80,46,0.06)" : "transparent",
                    color: paymentMethod === method ? "var(--color-spice)" : "var(--color-ink)",
                  }}
                >
                  {method === "cod" ? t("checkout.cod") : t("checkout.online")}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color: "var(--color-danger)", fontSize: "0.88rem", marginBottom: 12 }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? t("common.loading") : t("checkout.placeOrder")}
          </button>
        </form>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 14, fontSize: "1.1rem" }}>{t("cart.title")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}
              >
                <span>
                  {quantity}× {product.name_en}
                </span>
                <span>{(product.price * quantity).toFixed(0)} {t("menu.egp")}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: "1px solid var(--color-line)",
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 700,
            }}
          >
            <span>{t("checkout.total")}</span>
            <span>{subtotal.toFixed(0)} {t("menu.egp")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
