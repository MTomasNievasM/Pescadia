import { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, Tag, Fish, Eye } from 'lucide-react';

export default function HistoryList({ theme, onNavigateToProfile, onSelectPoint, currentUser }) {
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    fetch(`/api/feed?user_id=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        setCaptures(data);
        setLoading(false);
      })
      .catch(() => {
        setCaptures([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="history-view"><div className="history-status">Cargando historial...</div></div>;

  return (
    <div className="history-view">
      <div className="history-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Feed</h2>
        <p style={{ color: 'var(--placeholder-color)', fontSize: '0.9rem' }}>Publicaciones de las personas que sigues</p>
      </div>

      <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-light)', gap: '1rem', marginLeft: '0.5rem' }}>
        {captures.map(capture => (
          <div key={capture.id} className="history-compact-card" style={{
            background: 'var(--btn-bg)',
            borderRadius: '1.25rem',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid var(--border-light)',
            boxShadow: '0 2px 8px var(--shadow-color)',
            position: 'relative'
          }}>
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '-1.15rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#38bdf8',
              border: '3px solid var(--app-bg)',
              zIndex: 1
            }}></div>

            <div className="capture-thumb" style={{
              width: '70px',
              height: '70px',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              flexShrink: 0,
              background: '#000'
            }}>
              <img
                src={(capture.photo_url && capture.photo_url.trim() !== '') ? `${window.location.origin}/api${capture.photo_url}` : "https://images.unsplash.com/photo-1599058917210-9285702dfab3?auto=format&fit=crop&q=80&w=200"}
                alt={capture.species}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div className="capture-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-color)', fontSize: '1rem' }}>{capture.titulo || capture.species || "Captura"}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--placeholder-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {new Date(capture.created_at || capture.date).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--placeholder-color)', fontSize: '0.85rem' }}>
                <MapPin size={14} color="#38bdf8" />
                <span className="truncate">{capture.location || "Coordinadas guardadas"}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--placeholder-color)' }}>Por:</span>
                <button 
                  onClick={() => capture.username && onNavigateToProfile(capture.username)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    padding: 0, 
                    color: '#38bdf8', 
                    fontWeight: 'bold', 
                    cursor: capture.username ? 'pointer' : 'default',
                    textDecoration: capture.username ? 'underline' : 'none'
                  }}
                >
                  {capture.username ? `@${capture.username}` : 'Anónimo'}
                </button>
              </div>

              <div style={{ marginTop: '0.25rem' }}>
                <button 
                  className="action-btn" 
                  style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: '700', padding: 0 }}
                  onClick={() => onSelectPoint && onSelectPoint(capture)}
                >
                  Ver pesca
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
