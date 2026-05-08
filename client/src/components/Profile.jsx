import { useState, useEffect } from 'react';
import { MessageCircle, Heart, Share2, Star, MapPin, Calendar, Tag, X, Grid } from 'lucide-react';

export default function Profile({ theme }) {
  const [activeTab, setActiveTab] = useState('capturas');
  const [isEditing, setIsEditing] = useState(false);
  const [captures, setCaptures] = useState([]);
  const [loadingCaptures, setLoadingCaptures] = useState(true);

  const [profileData, setProfileData] = useState({
    name: "Adriana",
    username: "@adriana_pesca",
    bio: "Amante del mar y la pesca deportiva. 🌊🎣 Siempre buscando la próxima gran captura y explorando nuevas costas.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    cover: "https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?auto=format&fit=crop&q=80&w=1000"
  });

  const [editForm, setEditForm] = useState(profileData);

  const [comments] = useState([
    {
      id: 1,
      text: "¡Qué buena zona de pesca! Ayer estuve por ahí y saqué un par de doradas impresionantes. Recomiendo usar cebo vivo en este punto.",
      date: "2026-05-07T14:30:00Z",
      likes: 12
    },
    {
      id: 2,
      text: "Ojo con la corriente en esta parte, se pone fuerte a partir de las 6 de la tarde. Por lo demás, excelente lugar, muy tranquilo y sin gente.",
      date: "2026-05-05T09:15:00Z",
      likes: 5
    }
  ]);

  // Fotos de ejemplo
  const [photos] = useState([
    "https://images.unsplash.com/photo-1599058917210-9285702dfab3?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1616086708761-1250fbd18b8f?auto=format&fit=crop&q=80&w=400"
  ]);

  useEffect(() => {
    fetch('/api/capturas')
      .then(res => res.json())
      .then(data => {
        // Añadimos algunas capturas de prueba si la base de datos está vacía para que no se vea vacío
        const mockCapturas = [
          { id: 'm1', latitude: 36.72016, longitude: -4.42034, rating: 5, tags: ['Dorada', 'Cebo vivo'], created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 'm2', latitude: 36.52016, longitude: -4.32034, rating: 4, tags: ['Lubina', 'Al amanecer'], created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
          { id: 'm3', latitude: 36.62016, longitude: -4.52034, rating: 3, tags: ['Sargo'], created_at: new Date(Date.now() - 86400000 * 7).toISOString() }
        ];
        
        if (data.length === 0) {
          setCaptures(mockCapturas);
        } else {
          setCaptures([...data, ...mockCapturas]);
        }
        setLoadingCaptures(false);
      })
      .catch(() => {
        setLoadingCaptures(false);
      });
  }, []);
  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileData(editForm);
    setIsEditing(false);
  };

  return (
    <div className="profile-view">
      <div className="profile-header">
        <div className="profile-cover">
          <img 
            src={profileData.cover} 
            alt="Fondo de perfil" 
          />
        </div>
        <div className="profile-info-container">
          <div className="profile-avatar">
            <img 
              src={profileData.avatar} 
              alt={`Avatar de ${profileData.name}`} 
            />
          </div>
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Editar Perfil</button>
        </div>
        <div className="profile-details">
          <h2>{profileData.name}</h2>
          <p className="profile-username">{profileData.username}</p>
          <p className="profile-bio">{profileData.bio}</p>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{captures.length}</span>
              <span className="stat-label">Capturas</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">1.2k</span>
              <span className="stat-label">Seguidores</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">340</span>
              <span className="stat-label">Siguiendo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="content-tabs profile-tabs-scroll">
          <button 
            className={`tab-btn ${activeTab === 'capturas' ? 'active' : ''}`}
            onClick={() => setActiveTab('capturas')}
          >
            Capturas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'comentarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('comentarios')}
          >
            Comentarios
          </button>
          <button 
            className={`tab-btn ${activeTab === 'fotos' ? 'active' : ''}`}
            onClick={() => setActiveTab('fotos')}
          >
            Fotos
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'comentarios' && (
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <img 
                      src={profileData.avatar} 
                      alt="Avatar" 
                      className="comment-avatar-small" 
                    />
                    <div className="comment-meta">
                      <span className="comment-author">{profileData.name}</span>
                      <span className="comment-date">{new Date(comment.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  <div className="comment-actions">
                    <button className="action-btn">
                      <Heart size={16} /> <span>{comment.likes}</span>
                    </button>
                    <button className="action-btn">
                      <MessageCircle size={16} /> <span>Responder</span>
                    </button>
                    <button className="action-btn">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'capturas' && (
            <div className="history-list profile-history">
              {loadingCaptures ? (
                <div className="history-status">Cargando capturas...</div>
              ) : captures.length === 0 ? (
                <div className="history-status">Aún no hay capturas registradas.</div>
              ) : (
                captures.map(capture => (
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
                ))
              )}
            </div>
          )}

          {activeTab === 'fotos' && (
            <div className="photo-grid">
              {photos.map((photo, idx) => (
                <div key={idx} className="photo-item">
                  <img src={photo} alt={`Foto de pesca ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edición de Perfil */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content profile-edit-modal">
            <button className="modal-close" onClick={() => setIsEditing(false)}>
              <X size={24} />
            </button>
            <h3>Editar Perfil</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-section">
                <label>Nombre</label>
                <input 
                  type="text" 
                  className="tag-input" 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-section">
                <label>Usuario</label>
                <input 
                  type="text" 
                  className="tag-input" 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-section">
                <label>Biografía</label>
                <textarea 
                  className="tag-input" 
                  style={{ width: '100%', boxSizing: 'border-box', minHeight: '100px', resize: 'vertical' }}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  maxLength="200"
                ></textarea>
              </div>
              <div className="form-section">
                <label>Foto de Perfil</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="tag-input" 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  onChange={(e) => handleImageUpload(e, 'avatar')}
                />
              </div>
              <div className="form-section">
                <label>Foto de Portada</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="tag-input" 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  onChange={(e) => handleImageUpload(e, 'cover')}
                />
              </div>
              <button type="submit" className="submit-btn">Guardar Cambios</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
