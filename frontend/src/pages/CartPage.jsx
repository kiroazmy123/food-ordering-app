import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";

  if (items.length === 0) {
    return (
      <div className="container page">
        <h1 style={{ marginBottom: 16 }}>{t("cart.title")}</h1>
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p className="text-muted" style={{ marginBottom: 16 }}>
            {t("cart.empty")}
          </p>
          <Link to="/" className="btn btn-primary">
            {t("cart.browseMenu")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1 style={{ marginBottom: 24 }}>{t("cart.title")}</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map(({ product, quantity }) => {
          const name = isAr ? product.name_ar : product.name_en;
          return (
            <div
              key={product.id}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: 14,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  background: "var(--color-line)",
                  flexShrink: 0,
                }}
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600 }}>{name}</p>
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                  {product.price} {t("menu.egp")}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ padding: "6px 12px" }}
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  aria-label="decrease"
                >
                  −
                </button>
                <span style={{ minWidth: 24, textAlign: "center" }}>{quantity}</span>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ padding: "6px 12px" }}
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  aria-label="increase"
                >
                  +
                </button>
              </div>

              <p style={{ fontWeight: 700, minWidth: 70, textAlign: "end" }}>
                {(product.price * quantity).toFixed(0)} {t("menu.egp")}
              </p>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => removeItem(product.id)}
              >
                {t("cart.remove")}
              </button>
            </div>
          );
        })}
      </div>

      <div
        className="card"
        style={{
          marginTop: 24,
          padding: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
            {t("cart.subtotal")}
          </p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {subtotal.toFixed(0)} {t("menu.egp")}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/checkout")}>
          {t("cart.checkout")}
        </button>
      </div>
    </div>
  );
}
