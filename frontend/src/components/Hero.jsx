import { useState } from "react";
import { useTranslation } from "react-i18next";
import heroImage from "../assets/hero.jpg";

export default function Hero({ onSearch }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
    document.getElementById("menu-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(rgba(43,33,26,0.55), rgba(43,33,26,0.45)), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        textAlign: "center",
        padding: "60px 20px",
      }}
    >
      <div style={{ maxWidth: 680, width: "100%" }}>
        <h1
          style={{
            color: "#fff",
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            lineHeight: 1.15,
            marginBottom: 16,
            textShadow: "0 2px 12px rgba(0,0,0,0.25)",
          }}
        >
          {isAr ? "اكتشف وتذوّق أشهى الأطباق" : "Discover & order the food you love."}
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "1.05rem",
            marginBottom: 32,
          }}
        >
          {isAr
            ? "أطباق طازجة تحضّر عند الطلب، توصيل سريع لباب بيتك"
            : "Fresh dishes made to order, delivered straight to your door."}
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: 10,
            background: "#fff",
            borderRadius: "var(--radius-md)",
            padding: 8,
            boxShadow: "var(--shadow-pop)",
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAr ? "بحث عن طبق..." : "Find a dish..."}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              padding: "10px 16px",
              fontSize: "1rem",
              fontFamily: "inherit",
              background: "transparent",
              color: "var(--color-ink)",
            }}
          />
          <button type="submit" className="btn btn-primary">
            {isAr ? "بحث" : "Search"}
          </button>
        </form>
      </div>
    </section>
  );
}