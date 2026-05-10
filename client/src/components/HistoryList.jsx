import { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, Tag, Fish, Eye } from 'lucide-react';

export default function HistoryList({ theme }) {
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockCaptures = [
    {
      id: 1,
      species: "Dorada Real",
      location: "Playa de la Malagueta, Málaga",
      date: "2026-05-09T10:00:00Z",
      rating: 5,
      tags: ["Dorada", "Cebo de Playa"],
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 2,
      species: "Lubina",
      location: "Puerto de Benalmádena",
      date: "2026-05-08T07:30:00Z",
      rating: 4,
      tags: ["Lubina", "Al amanecer"],
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 3,
      species: "Sargo",
      location: "Acantilados de Maro",
      date: "2026-05-05T18:45:00Z",
      rating: 4,
      tags: ["Sargo", "Rockfishing"],
      image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=400"
    }
  ];

  useEffect(() => {
    fetch('/api/capturas')
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          setCaptures(mockCaptures);
        } else {
          setCaptures([...data, ...mockCaptures]);
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback a mock data si falla la conexión (útil en dev)
        setCaptures(mockCaptures);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="history-view"><div className="history-status">Cargando historial...</div></div>;

  return (
    <div className="history-view">
      <div className="history-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Historial</h2>
        <p style={{ color: 'var(--placeholder-color)', fontSize: '0.9rem' }}>Tus rutas y puntos de pesca</p>
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
                src={capture.image || "https://images.unsplash.com/photo-1599058917210-9285702dfab3?auto=format&fit=crop&q=80&w=200"}
                alt={capture.species}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div className="capture-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-color)', fontSize: '1rem' }}>{capture.species || "Captura"}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--placeholder-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {new Date(capture.created_at || capture.date).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--placeholder-color)', fontSize: '0.85rem' }}>
                <MapPin size={14} color="#38bdf8" />
                <span className="truncate">{capture.location || "Coordinadas guardadas"}</span>
              </div>

              <div style={{ marginTop: '0.25rem' }}>
                <button className="action-btn" style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: '700', padding: 0 }}>
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
