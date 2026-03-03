import Link from 'next/link';

export default function StatCard({ icon, label, value, color, bg, border, trend, link, prefix = '' }) {
  const trendPositive = trend >= 0;
  return (
    <Link href={link || '#'} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}>
      <div className="stat-card" style={{ '--card-accent': color }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color }}>
            <i className={icon} />
          </div>
          {typeof trend !== 'undefined' && trend !== null && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: trendPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: trendPositive ? '#22c55e' : '#ef4444' }}>
              <i className={`fas fa-arrow-${trendPositive ? 'up' : 'down'}`} style={{ marginRight: 3 }} />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 700, color: '#e6edf3', lineHeight: 1, marginBottom: 4 }}>
          {prefix}{value}
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#7d8590', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        <div className="stat-card-bar" />
      </div>
    </Link>
  );
}