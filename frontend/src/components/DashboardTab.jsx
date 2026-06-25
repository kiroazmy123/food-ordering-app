import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../api/axios";

const STATUS_COLORS = {
  placed: "#5c6b4f",
  preparing: "#e3a23d",
  out_for_delivery: "#2b5e9e",
  delivered: "#2c7a3c",
  cancelled: "#b3261e",
};

const PAYMENT_COLORS = {
  cod: "#c1502e",
  online: "#5c6b4f",
};

function ChartCard({ title, children, height = 280 }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: "1.05rem", marginBottom: 16 }}>{title}</h3>
      <div style={{ width: "100%", height }}>{children}</div>
    </div>
  );
}

export default function DashboardTab() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/analytics")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="center-page" style={{ minHeight: 200 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!data || data.total_orders === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <p className="text-muted">{t("admin.noData")}</p>
      </div>
    );
  }

  const revenueData = data.revenue_over_time.map((p) => ({
    date: p.date.slice(5), // MM-DD, shorter for axis labels
    revenue: p.revenue,
    orders: p.order_count,
  }));

  const statusData = data.orders_by_status.map((s) => ({
    name: t(`status.${s.status}`),
    value: s.count,
    key: s.status,
  }));

  const topProductsData = data.top_products.map((p) => ({
    name: isAr ? p.name_ar : p.name_en,
    quantity: p.quantity_sold,
    revenue: p.revenue,
  }));

  const paymentData = data.revenue_by_payment_method.map((p) => ({
    name: p.payment_method === "cod" ? t("checkout.cod") : t("checkout.online"),
    revenue: p.revenue,
    orders: p.order_count,
    key: p.payment_method,
  }));

  return (
    <div>
      {/* Summary stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: 18 }}>
          <p className="text-muted" style={{ fontSize: "0.82rem", marginBottom: 6 }}>
            {t("admin.totalRevenue")}
          </p>
          <p style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-spice)" }}>
            {data.total_revenue.toFixed(0)} {t("menu.egp")}
          </p>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <p className="text-muted" style={{ fontSize: "0.82rem", marginBottom: 6 }}>
            {t("admin.totalOrders")}
          </p>
          <p style={{ fontSize: "1.6rem", fontWeight: 700 }}>{data.total_orders}</p>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <p className="text-muted" style={{ fontSize: "0.82rem", marginBottom: 6 }}>
            {t("admin.avgOrderValue")}
          </p>
          <p style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            {data.average_order_value.toFixed(0)} {t("menu.egp")}
          </p>
        </div>
      </div>

      {/* Charts grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 18,
        }}
      >
        <ChartCard title={t("admin.revenueOverTime")}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid stroke="#ece2d4" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b5d51" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b5d51" />
              <Tooltip
                formatter={(value, name) =>
                  name === "revenue" ? [`${value} ${t("menu.egp")}`, t("admin.totalRevenue")] : [value, name]
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#c1502e"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#c1502e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("admin.ordersByStatus")}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || "#999"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("admin.topProducts")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="#ece2d4" strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6b5d51" />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 12 }}
                stroke="#6b5d51"
              />
              <Tooltip formatter={(value) => [value, t("admin.quantitySold")]} />
              <Bar dataKey="quantity" fill="#e3a23d" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("admin.revenueByPayment")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentData}>
              <CartesianGrid stroke="#ece2d4" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b5d51" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b5d51" />
              <Tooltip
                formatter={(value, name) =>
                  name === "revenue" ? [`${value} ${t("menu.egp")}`, t("admin.totalRevenue")] : [value, name]
                }
              />
              <Legend />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {paymentData.map((entry) => (
                  <Cell key={entry.key} fill={PAYMENT_COLORS[entry.key] || "#999"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}