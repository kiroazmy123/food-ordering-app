import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import api from "../api/axios";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";

export default function MenuPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.get("/products"), api.get("/categories")])
      .then(([productsRes, categoriesRes]) => {
        if (cancelled) return;
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      })
      .catch(() => {
        if (!cancelled) setError(t("common.error"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory) {
      result = result.filter((p) => p.category_id === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name_en.toLowerCase().includes(q) ||
          p.name_ar.includes(searchQuery) ||
          (p.description_en || "").toLowerCase().includes(q) ||
          (p.description_ar || "").includes(searchQuery)
      );
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="center-page">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page">
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Hero onSearch={setSearchQuery} />

      <div className="container page" id="menu-grid">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "2.2rem" }}>{t("menu.title")}</h1>
          <p className="text-muted" style={{ marginTop: 6 }}>
            {t("menu.subtitle")}
          </p>
        </div>

        {searchQuery && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              fontSize: "0.9rem",
            }}
          >
            <span className="text-muted">
              {isAr ? `نتائج البحث عن "${searchQuery}"` : `Search results for "${searchQuery}"`}
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setSearchQuery("")}
              style={{ padding: "4px 12px" }}
            >
              {isAr ? "إلغاء" : "Clear"}
            </button>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            marginBottom: 28,
            paddingBottom: 4,
          }}
        >
          <button
            className="btn btn-sm"
            onClick={() => setActiveCategory(null)}
            style={{
              background: activeCategory === null ? "var(--color-ink)" : "transparent",
              color: activeCategory === null ? "#fff" : "var(--color-ink)",
              border: "1.5px solid var(--color-ink)",
              whiteSpace: "nowrap",
            }}
          >
            {t("menu.all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="btn btn-sm"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                background: activeCategory === cat.id ? "var(--color-ink)" : "transparent",
                color: activeCategory === cat.id ? "#fff" : "var(--color-ink)",
                border: "1.5px solid var(--color-ink)",
                whiteSpace: "nowrap",
              }}
            >
              {isAr ? cat.name_ar : cat.name_en}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <p className="text-muted">
              {isAr ? "لا توجد أطباق مطابقة لبحثك." : "No dishes match your search."}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}