export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div style={{
        position:'fixed', top:0, left:0, width:'100%', height:'100%',
        background:'rgba(0,0,0,0.5)', zIndex:10000,
        display:'flex', alignItems:'center', justifyContent:'center', backdropFilter: 'blur(3px)'
    }}>
        <div className="modal-anim" style={{background:'white', borderRadius:'12px', padding:'30px', width:'400px', maxWidth:'90%', textAlign:'center', boxShadow:'0 10px 40px rgba(0,0,0,0.3)'}}>
            <h3 style={{margin:'0 0 10px', color:'#333'}}>Emin misiniz?</h3>
            <p style={{color:'#666', marginBottom:'25px', lineHeight:'1.5'}}>{message}</p>
            <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                <button onClick={onCancel} className="btn" style={{background:'#f1f1f1', color:'#555', padding:'10px 25px', borderRadius:'30px', fontWeight:'600'}}>Vazgeç</button>
                <button onClick={onConfirm} className="btn" style={{background:'#e74c3c', color:'white', padding:'10px 25px', borderRadius:'30px', fontWeight:'600', boxShadow:'0 4px 10px rgba(231, 76, 60, 0.3)'}}>Evet, Sil</button>
            </div>
        </div>
    </div>
  );
}