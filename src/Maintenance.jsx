// src/Maintenance.jsx
export default function Maintenance() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ff9a9e, #fad0c4)',
      fontFamily: 'Playfair Display, serif'
    }}>
      <span style={{ fontSize: '80px' }}>🔧</span>
      <h1 style={{ color: '#7a1143', fontSize: '28px', fontWeight: 800 }}>
        Under Maintenance
      </h1>
      <p style={{ color: '#ff5f9e', fontSize: '16px', fontWeight: 600 }}>
        Something special is being prepared for you... 💝
      </p>
    </div>
  );
}