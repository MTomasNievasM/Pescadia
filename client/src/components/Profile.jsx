import { useState, useEffect } from 'react';
import { MessageCircle, Heart, Share2, Star, MapPin, Calendar, Tag, X, Grid, Camera, Fish, Eye } from 'lucide-react';

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
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1511216335778-0cb4f62ff536?auto=format&fit=crop&q=80&w=400"
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
        const mockCapturas = [
          { id: 'm1', species: "Dorada Real", location: "Playa de la Malagueta", rating: 5, tags: ['Dorada', 'Cebo vivo'], date: new Date(Date.now() - 86400000).toISOString(), image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600" },
          { id: 'm2', species: "Lubina", location: "Puerto de Benalmádena", rating: 4, tags: ['Lubina', 'Al amanecer'], date: new Date(Date.now() - 86400000 * 3).toISOString(), image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600" }
        ];
        setCaptures(mockCapturas);
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
            <div className="captures-feed" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {loadingCaptures ? (
                <div className="history-status">Cargando publicaciones...</div>
              ) : captures.length === 0 ? (
                <div className="history-status">Aún no hay publicaciones.</div>
              ) : (
                captures.map(capture => (
                  <div key={capture.id} className="capture-post-card" style={{
                    background: 'var(--btn-bg)',
                    borderRadius: '1.25rem',
                    overflow: 'hidden',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 4px 15px var(--shadow-color)'
                  }}>
                    {/* Imagen de la publicación */}
                    <div className="post-image" style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
                      <img
                        src={capture.image || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600"}
                        alt={capture.species}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div className="post-content" style={{ padding: '1.25rem' }}>
                      <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{capture.species || "Nueva Captura"}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--placeholder-color)' }}>
                          {new Date(capture.created_at || capture.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="location" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--placeholder-color)' }}>
                        <MapPin size={16} color="#38bdf8" />
                        <span style={{ fontSize: '0.9rem' }}>{capture.location || "Punto de pesca"}</span>
                      </div>

                      <div className="post-actions" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border-light)'
                      }}>
                        <div style={{ display: 'flex', gap: '1.25rem' }}>
                          <button className="action-btn">
                            <Heart size={20} /> <span>Me gusta</span>
                          </button>
                          <button className="action-btn">
                            <Share2 size={20} />
                          </button>
                        </div>
                        <button className="action-btn" style={{ color: '#38bdf8', fontWeight: '800' }}>
                          <Eye size={18} style={{ marginRight: '4px' }} /> Ver pesca
                        </button>
                      </div>
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
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-section">
                <label>Biografía</label>
                <textarea
                  className="tag-input"
                  style={{ width: '100%', boxSizing: 'border-box', minHeight: '100px', resize: 'vertical' }}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  maxLength="200"
                ></textarea>
              </div>
              <div className="form-section">
                <label>Foto de Perfil</label>
                <div className="file-upload-container">
                  <img src={editForm.avatar} alt="Avatar preview" className="preview-avatar" />
                  <label className="file-upload-btn">
                    <Camera size={20} />
                    <span>Cambiar foto de perfil</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageUpload(e, 'avatar')}
                    />
                  </label>
                </div>
              </div>
              <div className="form-section">
                <label>Foto de Portada</label>
                <div className="file-upload-container">
                  <img src={editForm.cover} alt="Cover preview" className="preview-cover" />
                  <label className="file-upload-btn">
                    <Camera size={20} />
                    <span>Cambiar foto de portada</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageUpload(e, 'cover')}
                    />
                  </label>
                </div>
              </div>
              <button type="submit" className="submit-btn">Guardar Cambios</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
