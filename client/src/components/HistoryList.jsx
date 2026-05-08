import { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, Tag } from 'lucide-react';

export default function HistoryList({ theme }) {
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/capturas')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar historial');
        return res.json();
      })
      .then(data => {
        setCaptures(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="history-view"><div className="history-status">Cargando historial...</div></div>;
  if (error) return <div className="history-view"><div className="history-status error">{error}</div></div>;
  if (captures.length === 0) return <div className="history-view"><div className="history-status">Aún no hay capturas registradas. ¡Anímate a pescar!</div></div>;

  return (
    <div className="history-view">
      <div className="history-header">
        <h2>Historial de Capturas</h2>
        <p>Tus momentos en el agua</p>
      </div>
      <div className="history-list">
        {captures.map(capture => (
          <div key={capture.id} className="history-card">
            <div className="history-card-header">
              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < capture.rating ? 'star filled' : 'star'} 
                    fill={i < capture.rating ? "currentColor" : "transparent"} 
                  />
                ))}
              </div>
              <span className="date">
                <Calendar size={14} /> {new Date(capture.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <div className="history-card-body">
              <div className="location">
                <MapPin size={16} /> 
                <span>{parseFloat(capture.latitude).toFixed(4)}, {parseFloat(capture.longitude).toFixed(4)}</span>
              </div>
              
              {capture.tags && capture.tags.length > 0 && (
                <div className="tags-list history-tags">
                  <Tag size={14} />
                  {capture.tags.map((tag, idx) => (
                    <span key={idx} className="tag-badge small">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
