import { useTranslation } from "react-i18next";

import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const isAr = i18n.language === "ar";

  const name = isAr ? product.name_ar : product.name_en;
  const description = isAr ? product.description_ar : product.description_en;

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          background: "var(--color-line)",
          overflow: "hidden",
        }}
      >
        {product.image_url && (
          <img
            src={product.image_url}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        )}
      </div>

      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <h3 style={{ fontSize: "1.05rem" }}>{name}</h3>
          <span style={{ fontWeight: 700, color: "var(--color-spice)", whiteSpace: "nowrap" }}>
            {product.price} {t("menu.egp")}
          </span>
        </div>

        {description && (
          <p className="text-muted" style={{ fontSize: "0.88rem", flex: 1 }}>
            {description}
          </p>
        )}

        <button
          className="btn btn-primary btn-block btn-sm"
          disabled={!product.is_available}
          onClick={() => addItem(product, 1)}
          style={{ marginTop: 8 }}
        >
          {product.is_available ? t("menu.addToCart") : t("menu.unavailable")}
        </button>
      </div>
    </div>
  );
}
