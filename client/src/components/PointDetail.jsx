import { useState } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';

export default function PointDetail({ point, onClose, theme }) {
  const [userRating, setUserRating] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([
    { id: 1, user: 'Pescador_Almeria', text: 'Buena zona para doradas en esta época.', date: 'Hace 2 días' },
    { id: 2, user: 'Juan_Nautico', text: 'Confirmo, saqué un par de kilos ayer.', date: 'Hace 1 día' }
  ]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (commentInput.trim()) {
      setComments([
        ...comments,
        { id: Date.now(), user: 'Tú', text: commentInput.trim(), date: 'Ahora mismo' }
      ]);
      setCommentInput('');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar"><X size={24} /></button>
        
        {/* Foto o Placeholder */}
        <div style={{ width: '100%', height: '200px', borderRadius: '1rem', overflow: 'hidden' }}>
          {point.photo_url ? (
            <img 
              src={`/api${point.photo_url}`} 
              alt="Captura" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--btn-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--placeholder-color)' }}>
              Sin foto cargada
            </div>
          )}
        </div>

        {/* Info Básica */}
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Zona de Pesca #{point.id}</h3>
          <div className="tags-list" style={{ justifyContent: 'flex-start' }}>
            {(point.tags || []).map(tag => (
              <span key={tag} className="tag-badge">{tag}</span>
            ))}
          </div>
        </div>

        {/* Puntuación Media y Tu Puntuación */}
        <div style={{ background: 'var(--btn-bg)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--btn-border)' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--placeholder-color)', display: 'block', marginBottom: '0.25rem' }}>Puntuación Media</label>
          <div style={{ color: '#fbbf24', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            {'★'.repeat(point.rating)}{'☆'.repeat(5 - point.rating)}
          </div>
          
          <label style={{ fontSize: '0.8rem', color: 'var(--placeholder-color)', display: 'block', marginBottom: '0.25rem' }}>Tu valoración para este sitio</label>
          <div className="rating-container" style={{ justifyContent: 'flex-start', marginTop: '0.25rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={24} 
                className={`star ${star <= userRating ? 'filled' : ''}`}
                onClick={() => setUserRating(star)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        {/* Comentarios */}
        <div>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} /> Comentarios ({comments.length})
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
            {comments.map(comment => (
              <div key={comment.id} style={{ background: 'var(--btn-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong>{comment.user}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--placeholder-color)' }}>{comment.date}</span>
                </div>
                <p style={{ margin: 0 }}>{comment.text}</p>
              </div>
            ))}
          </div>

          {/* Formulario de comentarios */}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={commentInput} 
              onChange={(e) => setCommentInput(e.target.value)} 
              placeholder="Escribe un comentario..." 
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--btn-border)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
            />
            <button type="submit" className="submit-btn" style={{ width: 'auto', padding: '0 1rem' }}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
