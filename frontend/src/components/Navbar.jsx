import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const toggleLang = () => {
    const next = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      style={{
        borderBottom: "1px solid var(--color-line)",
        background: "var(--color-surface)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
          gap: 20,
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--color-spice)",
          }}
        >
          {t("nav.brand")}
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link to="/" className="text-muted">
            {t("nav.menu")}
          </Link>

          {user && (
            <Link to="/orders" className="text-muted">
              {t("nav.orders")}
            </Link>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" className="text-muted">
              {t("nav.admin")}
            </Link>
          )}

          <Link
            to="/cart"
            style={{ position: "relative", display: "flex", alignItems: "center" }}
            aria-label={t("nav.cart")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="20" r="1.4" fill="currentColor" />
              <circle cx="17" cy="20" r="1.4" fill="currentColor" />
            </svg>
            {itemCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  insetInlineEnd: -10,
                  background: "var(--color-spice)",
                  color: "#fff",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  borderRadius: "100px",
                  minWidth: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          <button
            onClick={toggleLang}
            className="btn btn-outline btn-sm"
            aria-label="Toggle language"
          >
            {i18n.language === "ar" ? "EN" : "ع"}
          </button>

          {user ? (
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              {t("nav.logout")}
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              {t("nav.login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
