import Link from 'next/link';

export default function QuickAction({ icon, label, color, bg, link }) {
  return (
    <Link href={link || '#'} style={{ textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.18s', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = color + '40'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
          <i className={icon} />
        </div>
        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#c9d1d9' }}>{label}</span>
        <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#484f58' }} />
      </div>
    </Link>
  );
}