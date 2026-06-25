import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const emptyForm = {
  name_en: "",
  name_ar: "",
  description_en: "",
  description_ar: "",
  price: "",
  image_url: "",
  category_id: "",
  is_available: true,
};

export default function ProductFormModal({ product, categories, onSave, onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name_en: product.name_en || "",
        name_ar: product.name_ar || "",
        description_en: product.description_en || "",
        description_ar: product.description_ar || "",
        price: product.price ?? "",
        image_url: product.image_url || "",
        category_id: product.category_id || "",
        is_available: product.is_available,
      });
    } else {
      setForm(emptyForm);
    }
  }, [product]);

  const update = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        price: parseFloat(form.price),
        category_id: form.category_id ? parseInt(form.category_id, 10) : null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(43,33,26,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          padding: 28,
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginBottom: 20, fontSize: "1.3rem" }}>
          {product ? t("admin.edit") : t("admin.addProduct")}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label>{t("admin.nameEn")}</label>
            <input className="input" value={form.name_en} onChange={update("name_en")} required />
          </div>
          <div className="field">
            <label>{t("admin.nameAr")}</label>
            <input className="input" value={form.name_ar} onChange={update("name_ar")} required dir="rtl" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label>{t("admin.descEn")}</label>
            <textarea className="input" rows={2} value={form.description_en} onChange={update("description_en")} />
          </div>
          <div className="field">
            <label>{t("admin.descAr")}</label>
            <textarea className="input" rows={2} value={form.description_ar} onChange={update("description_ar")} dir="rtl" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label>{t("admin.price")}</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={update("price")}
              required
            />
          </div>
          <div className="field">
            <label>{t("admin.category")}</label>
            <select className="input" value={form.category_id} onChange={update("category_id")}>
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>{t("admin.image")}</label>
          <input className="input" value={form.image_url} onChange={update("image_url")} />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: "0.9rem" }}>
          <input type="checkbox" checked={form.is_available} onChange={update("is_available")} />
          {t("admin.available")}
        </label>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>
            {t("admin.cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
            {saving ? t("common.loading") : t("admin.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
