import { useState, useEffect } from 'react';
import { MessageCircle, Heart, Share2, Star, MapPin, Calendar, Tag, X, Grid, Camera, Fish, Eye, Settings, LogOut, User } from 'lucide-react';

export default function Profile({ theme, currentUser, targetUsername, onLogout, onSelectPoint }) {
  const [activeTab, setActiveTab] = useState('capturas');
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [captures, setCaptures] = useState([]);
  const [loadingCaptures, setLoadingCaptures] = useState(true);

  // Inicialmente vacío, se llenará con el fetch
  const [profileData, setProfileData] = useState({
    name: "Cargando...",
    username: "@...",
    bio: "",
    avatar: "",
    cover: "",
    followersCount: 0,
    followingCount: 0,
    capturesCount: 0,
    isFollowing: false,
    isOwnProfile: false
  });

  const [editForm, setEditForm] = useState(profileData);

  // Determinar qué usuario buscar
  const usernameToFetch = targetUsername || (currentUser ? currentUser.username : null);

  useEffect(() => {
    if (!usernameToFetch) return;

    fetch(`/api/users/${usernameToFetch.replace('@', '')}?current_user_id=${currentUser?.id || ''}`)
      .then(res => res.json())
      .then(data => {
        const isOwnProfile = !targetUsername || targetUsername.replace('@', '') === currentUser?.username;
        
        if (data.error) {
          console.error(data.error);
          if (data.error === 'Usuario no encontrado' && isOwnProfile) {
            alert('Sesión caducada o base de datos reiniciada. Por favor, vuelve a iniciar sesión.');
            if (onLogout) onLogout();
          } else if (data.error === 'Usuario no encontrado') {
            setProfileData(prev => ({ ...prev, name: "Usuario no encontrado", bio: "Este usuario no existe o ha sido borrado." }));
          }
          return;
        }


        setProfileData({
          id: data.id,
          name: data.display_name || data.username,
          username: `@${data.username}`,
          bio: data.bio || "¡Hola! Soy nuevo en Pescadia. 🌊🎣",
          avatar: data.avatar || "",
          cover: data.cover || "",
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0,
          capturesCount: data.capturesCount || 0,
          isFollowing: data.isFollowing || false,
          isOwnProfile
        });

        if (isOwnProfile) {
          setEditForm({
            name: data.display_name || data.username,
            username: `@${data.username}`,
            bio: data.bio || "¡Hola! Soy nuevo en Pescadia. 🌊🎣",
            avatar: data.avatar || "",
            cover: data.cover || ""
          });

          // Sincronizar localStorage
          const savedUser = localStorage.getItem('pescadia-user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            localStorage.setItem('pescadia-user', JSON.stringify({ 
              ...user, 
              bio: data.bio, 
              avatar: data.avatar, 
              display_name: data.display_name,
              cover: data.cover
            }));
          }
        }
      })
      .catch(err => console.error("Error fetching profile", err));

    fetch(`/api/capturas?user_id=${currentUser?.id || ''}`)
      .then(res => res.json())
      .then(data => {
        // Filtrar capturas por usuario
        const userCaptures = data.filter(c => c.username === usernameToFetch.replace('@', ''));
        setCaptures(userCaptures);
        setLoadingCaptures(false);
      })
      .catch(() => {
        setCaptures([]);
        setLoadingCaptures(false);
      });
  }, [usernameToFetch, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/users/${profileData.username.replace('@', '')}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_user_id: currentUser.id })
      });
      const result = await response.json();
      
      if (response.ok) {
        setProfileData(prev => ({
          ...prev,
          isFollowing: result.isFollowing,
          followersCount: result.isFollowing ? prev.followersCount + 1 : prev.followersCount - 1
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (captureId) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/capturas/${captureId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id })
      });
      const result = await response.json();
      
      if (response.ok) {
        setCaptures(prev => prev.map(c => {
          if (c.id === captureId) {
            return {
              ...c,
              liked: result.liked,
              likes: result.liked ? (parseInt(c.likes) || 0) + 1 : (parseInt(c.likes) || 1) - 1
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Crear una imagen para poder redimensionarla en un canvas
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400; // Redimensionamos a un máximo de 400px de ancho
          const scaleSize = MAX_WIDTH / img.width;
          
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convertimos a JPEG con un 70% de calidad para que no pese nada
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setEditForm({ ...editForm, [field]: compressedBase64 });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteCapture = async (captureId) => {
    if (!window.confirm('¿Estás seguro de que quieres borrar esta publicación?')) return;
    
    try {
      const response = await fetch(`/api/capturas/${captureId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id })
      });
      
      if (response.ok) {
        setCaptures(captures.filter(c => c.id !== captureId));
        setProfileData(prev => ({ ...prev, capturesCount: Math.max(0, prev.capturesCount - 1) }));
      } else {
        const data = await response.json();
        alert(data.error || 'Error al borrar la captura');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al borrar la captura');
    }
  };

  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // { captureId, commentId }
  const [replyText, setReplyText] = useState('');
  const [quickComment, setQuickComment] = useState({});
  const [expandedCommentReplies, setExpandedCommentReplies] = useState({});

  const toggleLikeCount = (item) => {
    const likeCount = Number(item.likes || 0);
    const liked = Boolean(item.liked);
    return {
      ...item,
      liked: !liked,
      likes: liked ? Math.max(0, likeCount - 1) : likeCount + 1
    };
  };

  const publishedComments = captures
    .flatMap(capture => {
      const commentsList = capture.commentsList || [];

      const commentItems = commentsList
        .filter(comment => comment.author === profileData.name)
        .map(comment => ({
          key: `comment-${capture.id}-${comment.id}`,
          type: 'comment',
          itemId: comment.id,
          captureId: capture.id,
          author: comment.author,
          text: comment.text,
          date: comment.date || capture.created_at || capture.date || new Date().toISOString(),
          likes: comment.likes || 0,
          liked: Boolean(comment.liked),
          replies: comment.replies || [],
          captureSpecies: capture.species || 'Nueva Captura'
        }));

      const replyItems = commentsList.flatMap(comment =>
        (comment.replies || [])
          .filter(reply => reply.author === profileData.name)
          .map(reply => ({
            key: `reply-${capture.id}-${comment.id}-${reply.id}`,
            type: 'reply',
            itemId: reply.id,
            captureId: capture.id,
            parentCommentId: comment.id,
            author: reply.author,
            text: reply.text,
            date: reply.date || comment.date || capture.created_at || capture.date || new Date().toISOString(),
            likes: reply.likes || 0,
            liked: Boolean(reply.liked),
            replies: [],
            captureSpecies: capture.species || 'Nueva Captura',
            repliedTo: comment.author
          }))
      );

      return [...commentItems, ...replyItems];
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleProfileCommentLike = (commentItem) => {
    setCaptures(prevCaptures =>
      prevCaptures.map(capture => {
        if (capture.id !== commentItem.captureId) return capture;

        return {
          ...capture,
          commentsList: (capture.commentsList || []).map(comment => {
            if (commentItem.type === 'comment' && comment.id === commentItem.itemId) {
              return toggleLikeCount(comment);
            }

            if (commentItem.type === 'reply' && comment.id === commentItem.parentCommentId) {
              return {
                ...comment,
                replies: (comment.replies || []).map(reply =>
                  reply.id === commentItem.itemId ? toggleLikeCount(reply) : reply
                )
              };
            }

            return comment;
          })
        };
      })
    );
  };

  const handleShare = async (capture) => {
    const shareData = {
      title: `Pesca de ${capture.species}`,
      text: `Mira la captura de ${capture.species} en ${capture.location}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('¡Enlace copiado al portapapeles!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const newC = { id: Date.now(), author: profileData.name, text: newComment, replies: [] };
    setCaptures(captures.map(c =>
      c.id === selectedPost.id ? { ...c, commentsList: [...(c.commentsList || []), newC] } : c
    ));
    setSelectedPost(prev => ({ ...prev, commentsList: [...(prev.commentsList || []), newC] }));
    setNewComment('');
  };

  const handleQuickComment = (e, captureId) => {
    e.preventDefault();
    const text = quickComment[captureId];
    if (!text?.trim()) return;
    const newC = { id: Date.now(), author: profileData.name, text, replies: [] };
    setCaptures(captures.map(cap =>
      cap.id === captureId ? { ...cap, commentsList: [...(cap.commentsList || []), newC] } : cap
    ));
    setQuickComment({ ...quickComment, [captureId]: '' });
  };

  const handleReply = (captureId, commentId) => {
    if (!replyText.trim()) return;
    const newReply = { id: Date.now(), author: profileData.name, text: replyText };
    const updater = (cap) =>
      cap.id === captureId ? {
        ...cap,
        commentsList: cap.commentsList.map(c =>
          c.id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c
        )
      } : cap;
    setCaptures(captures.map(updater));
    // También actualizar el selectedPost si está abierto el modal
    if (selectedPost?.id === captureId) {
      setSelectedPost(prev => updater(prev));
    }
    setReplyText('');
    setReplyingTo(null);
  };

  // Cerrar el input de respuesta al hacer click fuera de él
  useEffect(() => {
    if (!replyingTo) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-reply-form]')) {
        setReplyingTo(null);
        setReplyText('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [replyingTo]);

  // Pez sencillo mirando a la derecha
  const FishIcon = ({ fill = 'transparent', color = 'currentColor', size = 22 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Cuerpo del pez (elipse) */}
      <ellipse cx="11" cy="12" rx="7" ry="4.5" fill={fill} stroke={color} />
      {/* Cola bifurcada a la izquierda */}
      <path d="M4 12 L1 8 M4 12 L1 16" stroke={color} fill="none" />
      {/* Ojo */}
      <circle cx="15" cy="11" r="0.8" fill={color} stroke="none" />
    </svg>
  );

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: profileData.username.replace('@', ''), // Quitamos el @ para el servidor
          bio: editForm.bio,
          avatar: editForm.avatar,
          display_name: editForm.name,
          cover: editForm.cover
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Algo salió mal');
      }

      setProfileData(editForm);
      setIsEditing(false);
      
      // Actualizamos también el localStorage para que persista al recargar
      const savedUser = localStorage.getItem('pescadia-user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        localStorage.setItem('pescadia-user', JSON.stringify({ 
          ...user, 
          bio: editForm.bio, 
          avatar: editForm.avatar, 
          display_name: editForm.name,
          cover: editForm.cover
        }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="profile-view">
      <div className="profile-header">
        <div className="profile-cover">
          {profileData.cover ? (
            <img
              src={profileData.cover}
              alt="Fondo de perfil"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f172a, #1e293b)' }} />
          )}
        </div>
        <div className="profile-info-container">
          <div className="profile-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#cbd5e1' }}>
            {profileData.avatar ? (
              <img
                src={profileData.avatar}
                alt={`Avatar de ${profileData.name}`}
              />
            ) : (
              <User size={48} style={{ color: '#64748b' }} />
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {profileData.isOwnProfile ? (
              <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Editar Perfil</button>
            ) : (
              <button 
                className="edit-profile-btn" 
                onClick={handleFollowToggle}
                style={{ 
                  background: profileData.isFollowing ? 'transparent' : '#38bdf8', 
                  color: profileData.isFollowing ? 'var(--text-color)' : '#fff',
                  border: profileData.isFollowing ? '1px solid var(--border-light)' : 'none'
                }}
              >
                {profileData.isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            )}
            
            <button 
              className="action-btn" 
              onClick={() => setShowSettings(true)}
              style={{ 
                background: 'var(--btn-bg)', 
                border: '1px solid var(--border-light)', 
                borderRadius: '0.75rem', 
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Ajustes"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        <div className="profile-details">
          <h2>{profileData.name}</h2>
          <p className="profile-username">{profileData.username}</p>
          <p className="profile-bio">{profileData.bio}</p>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{profileData.capturesCount}</span>
              <span className="stat-label">Capturas</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profileData.followersCount}</span>
              <span className="stat-label">Seguidores</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profileData.followingCount}</span>
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
              {publishedComments.length === 0 ? (
                <div className="history-status">Aún no hay comentarios publicados por este usuario.</div>
              ) : (
                publishedComments.map(comment => (
                  <div key={comment.key} className="comment-card">
                    <div className="comment-header">
                      <img
                        src={profileData.avatar}
                        alt="Avatar"
                        className="comment-avatar-small"
                      />
                      <div className="comment-meta">
                        <span className="comment-author">{comment.author}</span>
                        <span className="comment-date">{new Date(comment.date).toLocaleDateString()} · En {comment.captureSpecies}</span>
                      </div>
                    </div>
                    <p className="comment-text">
                      {comment.type === 'reply' ? `Respuesta a ${comment.repliedTo}: ` : ''}
                      {comment.text}
                    </p>
                    <div className="comment-actions">
                      <button
                        className="action-btn"
                        onClick={() => handleProfileCommentLike(comment)}
                        style={{ color: comment.liked ? '#38bdf8' : 'inherit' }}
                      >
                        <FishIcon fill={comment.liked ? '#38bdf8' : 'transparent'} color={comment.liked ? '#38bdf8' : 'currentColor'} size={22} />
                        <span>{comment.likes || 0}</span>
                      </button>

                      {comment.type === 'comment' && comment.replies.length > 0 && (
                        <button
                          className="action-btn"
                          onClick={() =>
                            setExpandedCommentReplies(prev => ({
                              ...prev,
                              [comment.key]: !prev[comment.key]
                            }))
                          }
                        >
                          <MessageCircle size={16} />
                          <span>{expandedCommentReplies[comment.key] ? 'Ocultar respuestas' : `Ver respuestas (${comment.replies.length})`}</span>
                        </button>
                      )}
                    </div>

                    {comment.type === 'comment' && comment.replies.length > 0 && expandedCommentReplies[comment.key] && (
                      <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                        {comment.replies.map(reply => (
                          <div key={reply.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <div style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.6rem', fontWeight: '700', color: '#fff', flexShrink: 0
                            }}>
                              {reply.author.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>
                              <span style={{ fontWeight: '700', color: 'var(--text-color)', marginRight: '0.35rem' }}>{reply.author}</span>
                              <span style={{ color: 'var(--placeholder-color)' }}>{reply.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
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
                    {/* Imagen de la publicación - Condicional */}
                    {capture.photo_url && (
                      <div className="post-image" style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
                        <img
                          src={`${window.location.origin}/api${capture.photo_url}`}
                          alt={capture.species}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}

                    <div className="post-content" style={{ padding: '1.25rem' }}>
                      <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{capture.titulo || capture.species || 'Nueva Captura'}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {profileData.isOwnProfile && (
                            <button 
                              onClick={() => handleDeleteCapture(capture.id)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                              title="Borrar publicación"
                            >
                              <X size={18} />
                            </button>
                          )}
                          <span style={{ fontSize: '0.8rem', color: 'var(--placeholder-color)' }}>
                            {new Date(capture.created_at || capture.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="location" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--placeholder-color)' }}>
                        <MapPin size={16} color="#38bdf8" />
                        <span style={{ fontSize: '0.9rem' }}>{capture.location || 'Punto de pesca'}</span>
                      </div>

                      <div className="post-actions" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border-light)'
                      }}>
                        <div style={{ display: 'flex', gap: '1.25rem' }}>
                          <button
                            className="action-btn"
                            onClick={() => handleLike(capture.id)}
                            style={{ color: capture.liked ? '#38bdf8' : 'inherit' }}
                          >
                            <FishIcon fill={capture.liked ? '#38bdf8' : 'transparent'} color={capture.liked ? '#38bdf8' : 'currentColor'} size={24} />
                            <span>{capture.likes || 0}</span>
                          </button>

                          <button
                            className="action-btn"
                            onClick={() => setSelectedPost(capture)}
                          >
                            <MessageCircle size={20} />
                            <span>{(capture.commentsList || []).length}</span>
                          </button>

                          <button
                            className="action-btn"
                            onClick={() => handleShare(capture)}
                          >
                            <Share2 size={20} />
                          </button>
                        </div>

                        <button 
                          className="action-btn" 
                          style={{ color: '#38bdf8', fontWeight: '800' }}
                          onClick={() => onSelectPoint && onSelectPoint(capture)}
                        >
                          <Eye size={18} style={{ marginRight: '4px' }} /> Ver pesca
                        </button>
                      </div>

                      {/* Comentarios inline - solo los 2 más recientes + barra de comentario rápido */}
                      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {capture.commentsList && capture.commentsList.length > 0 && (
                          <>
                            {capture.commentsList.length > 2 && (
                              <button
                                className="action-btn"
                                onClick={() => setSelectedPost(capture)}
                                style={{ alignSelf: 'flex-start', fontSize: '0.82rem', color: 'var(--placeholder-color)', padding: 0, marginBottom: '0.1rem' }}
                              >
                                Ver los {capture.commentsList.length} comentarios
                              </button>
                            )}
                            {capture.commentsList.slice(-2).map(c => (
                              <div key={c.id}>
                                {/* Comentario principal */}
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                  <div style={{
                                    width: '26px', height: '26px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.6rem', fontWeight: '700', color: '#fff', flexShrink: 0
                                  }}>
                                    {c.author.charAt(0).toUpperCase()}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <div style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--text-color)', marginRight: '0.4rem' }}>{c.author}</span>
                                        <span style={{ color: 'var(--placeholder-color)' }}>{c.text}</span>
                                      </div>
                                      <button
                                        className="action-btn"
                                        onClick={() => setReplyingTo(replyingTo?.commentId === c.id ? null : { captureId: capture.id, commentId: c.id })}
                                        style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '700', padding: '0.1rem 0.4rem', border: '1px solid #38bdf820', borderRadius: '0.5rem', background: '#38bdf810', flexShrink: 0, marginLeft: '0.5rem' }}
                                      >
                                        Responder
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                {/* Respuestas anidadas */}
                                {c.replies && c.replies.length > 0 && (
                                  <div style={{ marginLeft: '2rem', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                    {c.replies.map(r => (
                                      <div key={r.id} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                                        <div style={{
                                          width: '20px', height: '20px', borderRadius: '50%',
                                          background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          fontSize: '0.55rem', fontWeight: '700', color: '#fff', flexShrink: 0
                                        }}>
                                          {r.author.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                                          <span style={{ fontWeight: '700', color: 'var(--text-color)', marginRight: '0.35rem' }}>{r.author}</span>
                                          <span style={{ color: 'var(--placeholder-color)' }}>{r.text}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* Input de respuesta */}
                                {replyingTo?.commentId === c.id && (
                                  <div data-reply-form style={{ marginLeft: '2rem', marginTop: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      className="tag-input"
                                      placeholder={`Responder a ${c.author}...`}
                                      value={replyText}
                                      onChange={e => setReplyText(e.target.value)}
                                      onKeyDown={e => e.key === 'Enter' && handleReply(capture.id, c.id)}
                                      style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderRadius: '1rem' }}
                                      autoFocus
                                    />
                                    <button
                                      className="submit-btn"
                                      onClick={() => handleReply(capture.id, c.id)}
                                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', margin: 0, borderRadius: '1rem' }}
                                    >
                                      Enviar
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </>
                        )}
                        {/* Barra de comentario rápido */}
                        <form
                          onSubmit={e => handleQuickComment(e, capture.id)}
                          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.35rem' }}
                        >
                          <div style={{
                            width: '26px', height: '26px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.6rem', fontWeight: '700', color: '#fff', flexShrink: 0
                          }}>
                            {profileData.name.charAt(0).toUpperCase()}
                          </div>
                          <input
                            type="text"
                            className="tag-input"
                            placeholder="Añade un comentario..."
                            value={quickComment[capture.id] || ''}
                            onChange={e => setQuickComment({ ...quickComment, [capture.id]: e.target.value })}
                            style={{ flex: 1, padding: '0.35rem 0.75rem', fontSize: '0.82rem', borderRadius: '1rem' }}
                          />
                          {quickComment[capture.id]?.trim() && (
                            <button
                              type="submit"
                              className="action-btn"
                              style={{ color: '#38bdf8', fontWeight: '700', fontSize: '0.82rem', padding: 0 }}
                            >
                              Publicar
                            </button>
                          )}
                        </form>
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

      {/* Modal de Comentarios */}
      {selectedPost && (
        <div className="modal-overlay">
          <div className="modal-content profile-edit-modal" style={{ maxWidth: '400px' }}>
            <button className="modal-close" onClick={() => setSelectedPost(null)}>
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '1rem' }}>Comentarios - {selectedPost.species}</h3>

            <div className="comments-section" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedPost.commentsList && selectedPost.commentsList.length > 0 ? (
                selectedPost.commentsList.map(c => (
                  <div key={c.id}>
                    {/* Comentario principal */}
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: '700', color: '#fff', flexShrink: 0
                      }}>
                        {c.author.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ background: 'var(--btn-bg)', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontWeight: '700', color: 'var(--text-color)', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>{c.author}</span>
                            <span style={{ color: 'var(--placeholder-color)', fontSize: '0.85rem' }}>{c.text}</span>
                          </div>
                          <button
                            className="action-btn"
                            onClick={() => setReplyingTo(replyingTo?.commentId === c.id ? null : { captureId: selectedPost.id, commentId: c.id })}
                            style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '700', padding: '0.15rem 0.5rem', border: '1px solid #38bdf830', borderRadius: '0.5rem', background: '#38bdf815', flexShrink: 0, whiteSpace: 'nowrap' }}
                          >
                            Responder
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Respuestas anidadas */}
                    {c.replies && c.replies.length > 0 && (
                      <div style={{ marginLeft: '2.5rem', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {c.replies.map(r => (
                          <div key={r.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <div style={{
                              width: '26px', height: '26px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.6rem', fontWeight: '700', color: '#fff', flexShrink: 0
                            }}>
                              {r.author.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ background: 'var(--btn-bg)', borderRadius: '0.75rem', padding: '0.4rem 0.65rem', flex: 1 }}>
                              <span style={{ fontWeight: '700', color: 'var(--text-color)', fontSize: '0.8rem', display: 'block', marginBottom: '0.1rem' }}>{r.author}</span>
                              <span style={{ color: 'var(--placeholder-color)', fontSize: '0.8rem' }}>{r.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Input de respuesta en modal */}
                    {replyingTo?.commentId === c.id && (
                      <div data-reply-form style={{ marginLeft: '2.5rem', marginTop: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="tag-input"
                          placeholder={`Responder a ${c.author}...`}
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleReply(selectedPost.id, c.id)}
                          style={{ flex: 1, padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '1rem' }}
                          autoFocus
                        />
                        <button
                          className="submit-btn"
                          onClick={() => handleReply(selectedPost.id, c.id)}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', margin: 0, borderRadius: '1rem' }}
                        >
                          Enviar
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--placeholder-color)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
                  Aún no hay comentarios. ¡Sé el primero!
                </p>
              )}
            </div>

            <form onSubmit={handleAddComment}>
              <textarea
                className="tag-input"
                placeholder="Escribe un comentario..."
                style={{ width: '100%', boxSizing: 'border-box', minHeight: '80px', marginBottom: '1rem', padding: '1rem' }}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button type="submit" className="submit-btn" style={{ margin: 0, width: '100%' }}>Publicar Comentario</button>
            </form>
          </div>
        </div>
      )}

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

      {/* Modal de Ajustes */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content profile-edit-modal" style={{ maxWidth: '300px' }}>
            <button className="modal-close" onClick={() => setShowSettings(false)}>
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '1.5rem' }}>Ajustes</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                className="action-btn" 
                style={{ 
                  justifyContent: 'flex-start', 
                  padding: '0.75rem', 
                  borderRadius: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444'
                }}
                onClick={() => {
                  setShowSettings(false);
                  onLogout();
                }}
              >
                <LogOut size={18} />
                <span style={{ fontWeight: '700' }}>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
