import { useState, useEffect } from 'react'
import { Fish, MapPin, PlusCircle, History, Home, User } from 'lucide-react'
import './index.css'

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...')
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerStatus(data.status === 'ok' ? 'Conectado' : 'Error'))
      .catch(() => setServerStatus('Error de conexión'))
  }, [])

  return (
    <div className="app-container">
      <header className="mobile-header">
        <h1>Pescadía</h1>
        <div className={`status-dot ${serverStatus === 'Conectado' ? 'online' : 'offline'}`} title={serverStatus}></div>
      </header>

      <main className="content-area">
        {activeTab === 'home' && (
          <div className="home-view">
            <section className="welcome-banner">
              <h2>¡Hola, Pescador!</h2>
              <p>¿Qué tal la marea hoy?</p>
            </section>

            <div className="mobile-grid">
              <button className="mobile-btn primary">
                <PlusCircle size={24} />
                <span>Nueva Captura</span>
              </button>
              <button className="mobile-btn">
                <MapPin size={24} />
                <span>Zonas</span>
              </button>
              <button className="mobile-btn">
                <Fish size={24} />
                <span>Especies</span>
              </button>
              <button className="mobile-btn">
                <History size={24} />
                <span>Historial</span>
              </button>
            </div>
          </div>
        )}
        {activeTab !== 'home' && (
          <div className="placeholder-view">
            <h2>Próximamente</h2>
            <p>Estamos preparando la sección de {activeTab}...</p>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={24} />
          <span>Inicio</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <MapPin size={24} />
          <span>Mapa</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <History size={24} />
          <span>Estadísticas</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={24} />
          <span>Perfil</span>
        </button>
      </nav>
    </div>
  )
}

export default App
