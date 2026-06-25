import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError(t("auth.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page" style={{ display: "flex", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 32, width: "100%", maxWidth: 420 }}>
        <h1 style={{ marginBottom: 24, fontSize: "1.6rem" }}>{t("auth.loginTitle")}</h1>

        <div className="field">
          <label htmlFor="email">{t("auth.email")}</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">{t("auth.password")}</label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p style={{ color: "var(--color-danger)", fontSize: "0.88rem", marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? t("common.loading") : t("auth.loginButton")}
        </button>

        <p className="text-muted" style={{ marginTop: 16, textAlign: "center", fontSize: "0.9rem" }}>
          {t("auth.noAccount")}{" "}
          <Link to="/signup" style={{ color: "var(--color-spice)", fontWeight: 600 }}>
            {t("nav.signup")}
          </Link>
        </p>
      </form>
    </div>
  );
}
