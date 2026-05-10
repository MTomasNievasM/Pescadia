import { useState } from 'react';
import { User, Lock, Fish, ArrowRight, Mail } from 'lucide-react';

export default function Auth({ onLogin, theme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isLogin ? { username, password } : { username, password, email, display_name: displayName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Algo salió mal');
      }

      localStorage.setItem('pescadia-user', JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      padding: '1rem',
      background: 'transparent'
    }}>
      <div className="auth-card" style={{
        background: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.6)',
        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
        borderRadius: '1.25rem',
        padding: '1.75rem',
        width: '100%',
        maxWidth: '340px',
        boxShadow: theme === 'dark' 
          ? '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
          : '0 20px 40px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)', // Para soporte en Safari
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            width: '50px',
            height: '50px',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            boxShadow: '0 8px 20px rgba(56, 189, 248, 0.3)'
          }}>
            <Fish size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text-color)' }}>
            {isLogin ? '¡Hola de nuevo!' : 'Crea tu cuenta'}
          </h2>
          <p style={{ color: 'var(--placeholder-color)', fontSize: '0.85rem' }}>
            {isLogin ? 'Entra para ver tus puntos' : 'Únete a la comunidad'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '0.6rem',
            borderRadius: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem', display: 'block', color: 'var(--text-color)', opacity: 0.9 }}>USUARIO</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--placeholder-color)' }} />
              <input
                type="text"
                className="tag-input"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ 
                  width: '100%', 
                  boxSizing: 'border-box', 
                  paddingLeft: '2.5rem',
                  paddingTop: '0.6rem',
                  paddingBottom: '0.6rem',
                  fontSize: '0.9rem',
                  background: theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  border: '1px solid var(--border-light)'
                }}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem', display: 'block', color: 'var(--text-color)', opacity: 0.9 }}>NOMBRE DE USUARIO (PARA MOSTRAR)</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--placeholder-color)' }} />
                  <input
                    type="text"
                    className="tag-input"
                    placeholder="Tu nombre para mostrar"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{ 
                      width: '100%', 
                      boxSizing: 'border-box', 
                      paddingLeft: '2.5rem',
                      paddingTop: '0.6rem',
                      paddingBottom: '0.6rem',
                      fontSize: '0.9rem',
                      background: theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                      border: '1px solid var(--border-light)'
                    }}
                    required
                  />
                </div>
              </div>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem', display: 'block', color: 'var(--text-color)', opacity: 0.9 }}>CORREO ELECTRÓNICO</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--placeholder-color)' }} />
                  <input
                    type="email"
                    className="tag-input"
                    placeholder="Tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ 
                      width: '100%', 
                      boxSizing: 'border-box', 
                      paddingLeft: '2.5rem',
                      paddingTop: '0.6rem',
                      paddingBottom: '0.6rem',
                      fontSize: '0.9rem',
                      background: theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                      border: '1px solid var(--border-light)'
                    }}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem', display: 'block', color: 'var(--text-color)', opacity: 0.9 }}>CONTRASEÑA</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--placeholder-color)' }} />
              <input
                type="password"
                className="tag-input"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  boxSizing: 'border-box', 
                  paddingLeft: '2.5rem',
                  paddingTop: '0.6rem',
                  paddingBottom: '0.6rem',
                  fontSize: '0.9rem',
                  background: theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  border: '1px solid var(--border-light)'
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            style={{
              width: '100%',
              margin: '0.5rem 0 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.7rem',
              fontSize: '0.9rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              border: 'none',
              color: '#fff',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
            }}
            disabled={loading}
          >
            {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--placeholder-color)' }}>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </span>{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              fontWeight: '700',
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.85rem'
            }}
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
