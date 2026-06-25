import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signup({ ...form, phone: form.phone || null });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || t("auth.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page" style={{ display: "flex", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 32, width: "100%", maxWidth: 420 }}>
        <h1 style={{ marginBottom: 24, fontSize: "1.6rem" }}>{t("auth.signupTitle")}</h1>

        <div className="field">
          <label htmlFor="name">{t("auth.name")}</label>
          <input id="name" className="input" value={form.name} onChange={update("name")} required />
        </div>

        <div className="field">
          <label htmlFor="email">{t("auth.email")}</label>
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={update("email")}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="phone">{t("auth.phone")}</label>
          <input id="phone" className="input" value={form.phone} onChange={update("phone")} />
        </div>

        <div className="field">
          <label htmlFor="password">{t("auth.password")}</label>
          <input
            id="password"
            type="password"
            className="input"
            value={form.password}
            onChange={update("password")}
            required
            minLength={6}
          />
        </div>

        {error && (
          <p style={{ color: "var(--color-danger)", fontSize: "0.88rem", marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? t("common.loading") : t("auth.signupButton")}
        </button>

        <p className="text-muted" style={{ marginTop: 16, textAlign: "center", fontSize: "0.9rem" }}>
          {t("auth.haveAccount")}{" "}
          <Link to="/login" style={{ color: "var(--color-spice)", fontWeight: 600 }}>
            {t("nav.login")}
          </Link>
        </p>
      </form>
    </div>
  );
}
