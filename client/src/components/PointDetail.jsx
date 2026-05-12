import { useState, useEffect } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';

export default function PointDetail({ point, onClose, theme, currentUser, onNavigateToProfile }) {
  console.log("Rendering PointDetail, point:", point, "currentUser:", currentUser);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(point.rating || 0);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Cargar detalles reales
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const userId = currentUser ? currentUser.id : '';
        const res = await fetch(`/api/capturas/${point.id}/detalles?current_user_id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comentarios || []);
          if (data.media) setAverageRating(data.media);
          if (data.tu_valoracion) setUserRating(data.tu_valoracion);
        }
      } catch (err) {
        console.error("Error al cargar detalles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [point.id, currentUser]);

  const handleRate = async (star) => {
    if (!currentUser) return alert('Debes iniciar sesión para valorar.');
    setUserRating(star);
    setIsSubmittingRating(true);
    
    try {
      const res = await fetch(`/api/capturas/${point.id}/valorar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, puntuacion: star })
      });
      if (res.ok) {
        // Recargar media
        const detailsRes = await fetch(`/api/capturas/${point.id}/detalles?current_user_id=${currentUser.id}`);
        if (detailsRes.ok) {
          const data = await detailsRes.json();
          if (data.media) setAverageRating(data.media);
        }
      }
    } catch (err) {
      console.error("Error al valorar:", err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    if (!currentUser) return alert('Debes iniciar sesión para comentar.');

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/capturas/${point.id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, texto: commentInput.trim() })
      });
      if (res.ok) {
        const nuevo = await res.json();
        // Insertar al principio para verlo inmediatamente
        setComments([nuevo, ...comments]);
        setCommentInput('');
      }
    } catch (err) {
      console.error("Error al comentar:", err);
    } finally {
      setIsSubmittingComment(false);
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
          <h3 style={{ margin: '0 0 0.5rem 0' }}>{point.titulo || `Zona de Pesca #${point.id}`}</h3>
          <div className="tags-list" style={{ justifyContent: 'flex-start' }}>
            {(point.tags || []).map(tag => (
              <span key={tag} className="tag-badge">{tag}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            <span style={{ color: 'var(--placeholder-color)' }}>Por:</span>
            <button 
              onClick={() => point.username && onNavigateToProfile(point.username)}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                color: '#38bdf8', 
                fontWeight: 'bold', 
                cursor: point.username ? 'pointer' : 'default',
                textDecoration: point.username ? 'underline' : 'none'
              }}
            >
              {point.username ? `@${point.username}` : 'Anónimo'}
            </button>
          </div>
        </div>

        {/* Puntuación Media y Tu Puntuación */}
        <div style={{ background: 'var(--btn-bg)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--btn-border)' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--placeholder-color)', display: 'block', marginBottom: '0.25rem' }}>Puntuación Media</label>
          <div style={{ color: '#fbbf24', fontSize: '1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {averageRating > 0 ? (
              <>
                <span>{Number(averageRating).toFixed(1)}</span>
                <span style={{ fontSize: '1.2rem' }}>★</span>
              </>
            ) : (
              <span style={{ fontSize: '1rem', color: 'var(--placeholder-color)' }}>Sin valoraciones</span>
            )}
          </div>
          
          <label style={{ fontSize: '0.8rem', color: 'var(--placeholder-color)', display: 'block', marginBottom: '0.25rem' }}>Tu valoración para este sitio</label>
          <div className="rating-container" style={{ justifyContent: 'flex-start', marginTop: '0.25rem', opacity: isSubmittingRating ? 0.5 : 1 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={24} 
                className={`star ${star <= userRating ? 'filled' : ''}`}
                onClick={() => handleRate(star)}
                style={{ cursor: isSubmittingRating ? 'wait' : 'pointer' }}
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
            {loading ? (
              <p style={{ color: 'var(--placeholder-color)', textAlign: 'center', margin: '1rem 0' }}>Cargando comentarios...</p>
            ) : comments.length === 0 ? (
              <p style={{ color: 'var(--placeholder-color)', textAlign: 'center', margin: '1rem 0' }}>Aún no hay comentarios. ¡Sé el primero!</p>
            ) : (
              comments.map(comment => {
                const isMine = currentUser && currentUser.username === comment.user;
                const d = new Date(comment.created_at);
                const isRecent = isNaN(d.getTime()); // 'Ahora mismo'
                const dateStr = isRecent ? comment.date : d.toLocaleDateString();
                
                return (
                  <div key={comment.id} style={{ background: isMine ? 'rgba(14, 165, 233, 0.1)' : 'var(--btn-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem', border: isMine ? '1px solid rgba(14, 165, 233, 0.3)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ color: isMine ? '#38bdf8' : 'inherit' }}>{comment.user}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--placeholder-color)' }}>{dateStr}</span>
                    </div>
                    <p style={{ margin: 0 }}>{comment.texto}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Formulario de comentarios */}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem', opacity: isSubmittingComment ? 0.5 : 1 }}>
            <input 
              type="text" 
              value={commentInput} 
              onChange={(e) => setCommentInput(e.target.value)} 
              placeholder={currentUser ? "Escribe un comentario..." : "Inicia sesión para comentar"} 
              disabled={!currentUser || isSubmittingComment}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--btn-border)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
            />
            <button type="submit" className="submit-btn" style={{ width: 'auto', padding: '0 1rem' }} disabled={!currentUser || isSubmittingComment || !commentInput.trim()}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
