export default function Toast({ message, type, onClose }) {
  if (!message) return null;
  const bgColor = type === 'error' ? '#e74c3c' : '#27ae60';
  const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';

  return (
    <div className="toast-anim" style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
        background: 'white', borderRadius: '8px', padding: '15px 20px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)', borderLeft: `5px solid ${bgColor}`,
        display: 'flex', alignItems: 'center', gap: '15px', minWidth: '300px'
    }}>
        <i className={`fas ${icon}`} style={{fontSize:'1.5rem', color: bgColor}}></i>
        <div style={{flex:1}}>
            <h5 style={{margin:0, fontSize:'0.95rem', color:'#333'}}>{type === 'error' ? 'Hata' : 'Başarılı'}</h5>
            <p style={{margin:0, fontSize:'0.85rem', color:'#666'}}>{message}</p>
        </div>
        <button onClick={onClose} style={{background:'none', border:'none', color:'#999', cursor:'pointer', fontSize:'1.2rem'}}>&times;</button>
    </div>
  );
}