export default function ActivityItem({ icon, color, bg, title, desc, time }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>
        <i className={icon} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: '0.75rem', color: '#7d8590', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</div>
      </div>
      <div style={{ fontSize: '0.7rem', color: '#484f58', flexShrink: 0, marginTop: 2 }}>{time}</div>
    </div>
  );
}