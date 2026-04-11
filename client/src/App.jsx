import { useState, useEffect } from 'react'
import { Fish, MapPin, PlusCircle, History } from 'lucide-react'
import './App.css'

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...')

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerStatus(data.status === 'ok' ? 'Conectado' : 'Error'))
      .catch(() => setServerStatus('Error de conexión'))
  }, [])

  return (
    <div className="app-container">
      <header className="header">
        <h1>Pescadía</h1>
        <div className={`status-badge ${serverStatus === 'Conectado' ? 'online' : 'offline'}`}>
          {serverStatus}
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <h2>Tu bitácora de pesca personal</h2>
          <p>Registra tus capturas, descubre zonas y comparte con tu equipo.</p>
        </section>

        <div className="action-grid">
          <button className="action-card">
            <PlusCircle size={32} />
            <span>Nueva Captura</span>
          </button>
          <button className="action-card">
            <MapPin size={32} />
            <span>Zonas de Pesca</span>
          </button>
          <button className="action-card">
            <History size={32} />
            <span>Historial</span>
          </button>
          <button className="action-card">
            <Fish size={32} />
            <span>Especies</span>
          </button>
        </div>
      </main>

      <footer className="footer">
        <p>Proyecto Pescadía &copy; 2026</p>
      </footer>
    </div>
  )
}

export default App
