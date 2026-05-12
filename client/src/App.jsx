import { useState, useEffect } from 'react'
import { Fish, MapPin, PlusCircle, History, Home, User, Sun, Moon } from 'lucide-react'
import MapComponent from './components/MapComponent'
import MiniMap from './components/MiniMap'
import NewCatchForm from './components/NewCatchForm'
import PointDetail from './components/PointDetail'
import HistoryList from './components/HistoryList'
import Profile from './components/Profile'
import Auth from './components/Auth'
import logoDark from './assets/logo_navbar1.png'
import logoLight from './assets/logo_navbar1_dia.png'
import L from 'leaflet'
import { fishIcon } from './utils/fishIcon'
import 'leaflet/dist/leaflet.css'

// Establecer el icono de la cola de pez como global para toda la app
L.Marker.prototype.options.icon = fishIcon;
import './index.css'

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...')
  const [activeTab, setActiveTab] = useState('home')
  const [viewingProfile, setViewingProfile] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [showNewCatchModal, setShowNewCatchModal] = useState(false)
  const [activeTagFilter, setActiveTagFilter] = useState(null)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Restaurar tema guardado o por defecto a oscuro
    const savedTheme = localStorage.getItem('pescadia-theme') || 'dark';
    setTheme(savedTheme);
    document.body.className = savedTheme + '-theme';

    // Restaurar usuario guardado
    const savedUser = localStorage.getItem('pescadia-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerStatus(data.status === 'ok' ? 'Conectado' : 'Error'))
      .catch(() => setServerStatus('Error de conexión'))
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('pescadia-theme', newTheme);
    document.body.className = newTheme + '-theme';
  }

  // Función para navegar al perfil de cualquier usuario
  const navigateToProfile = (username) => {
    setViewingProfile(username);
    setActiveTab('profile');
  };

  return (
    <div className="app-container">
      <header className="mobile-header">
        <img 
          src={theme === 'dark' ? logoDark : logoLight} 
          alt="Pescadia" 
          style={{ 
            height: '50px', 
            objectFit: 'contain'
          }} 
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className={`status-dot ${serverStatus === 'Conectado' ? 'online' : 'offline'}`} title={serverStatus}></div>
        </div>
      </header>

      <main className="content-area">
        {!user ? (
          <Auth onLogin={setUser} theme={theme} />
        ) : (
          <>
            {activeTab === 'home' && (
              <div className="home-view">
                <section className="welcome-banner">
                  <h2>¡Hola, {user.username}!</h2>
                  <p>¿Qué te pescas?</p>
                </section>

                <MiniMap theme={theme} onSelectPoint={setSelectedPoint} />

                <div className="mobile-grid">
                  <button className="mobile-btn primary" onClick={() => setShowNewCatchModal(true)}>
                    <PlusCircle size={24} />
                    <span>Nueva Captura</span>
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'map' && (
                <MapComponent
                  activeTagFilter={activeTagFilter}
                  clearFilter={() => setActiveTagFilter(null)}
                  onFilterSpecies={(tag) => setActiveTagFilter(tag)}
                  theme={theme}
                  onSelectPoint={setSelectedPoint}
                />
            )}
            {activeTab === 'history' && (
              <HistoryList theme={theme} onNavigateToProfile={navigateToProfile} />
            )}
            {activeTab === 'profile' && (
              <Profile 
                theme={theme} 
                currentUser={user}
                targetUsername={viewingProfile}
                onLogout={() => {
                  localStorage.removeItem('pescadia-user');
                  setUser(null);
                  setActiveTab('home');
                }} 
              />
            )}
            {activeTab !== 'home' && activeTab !== 'map' && activeTab !== 'history' && activeTab !== 'profile' && (
              <div className="placeholder-view">
                <h2>Próximamente</h2>
                <p>Estamos preparando la sección de {activeTab}...</p>
              </div>
            )}

            {showNewCatchModal && (
              <NewCatchForm
                currentUser={user}
                onClose={() => setShowNewCatchModal(false)}
                onSave={() => setShowNewCatchModal(false)}
                theme={theme}
              />
            )}

            {selectedPoint && (
              <PointDetail
                point={selectedPoint}
                onClose={() => setSelectedPoint(null)}
                theme={theme}
                currentUser={currentUser}
              />
            )}
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => { setActiveTab('home'); setViewingProfile(null); }}
        >
          <Home size={24} />
          <span>Inicio</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => { setActiveTab('map'); setViewingProfile(null); }}
        >
          <MapPin size={24} />
          <span>Mapa</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => { setActiveTab('history'); setViewingProfile(null); }}
        >
          <History size={24} />
          <span>Historial</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'profile' && !viewingProfile ? 'active' : ''}`}
          onClick={() => { setActiveTab('profile'); setViewingProfile(null); }}
        >
          <User size={24} />
          <span>Perfil</span>
        </button>
      </nav>
    </div>
  )
}

export default App
