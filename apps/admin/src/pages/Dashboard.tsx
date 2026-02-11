export function Dashboard() {
  const cards = [
    ["Total Products", "—"],
    ["Orders Today", "—"],
    ["Pending Orders", "—"],
    ["Low Stock", "—"]
  ];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 1000, fontSize: 18 }}>Dashboard</div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>Live stats will connect to API next.</div>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {cards.map(([t, v]) => (
          <div key={t} className="card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 900 }}>{t}</div>
            <div style={{ fontSize: 24, fontWeight: 1000 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
