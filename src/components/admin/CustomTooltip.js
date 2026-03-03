export default function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', fontSize: '0.8rem', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 1000 }}>
        <p style={{ color: '#7d8590', marginBottom: 4, fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: 0 }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
}