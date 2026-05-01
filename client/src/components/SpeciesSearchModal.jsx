import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SpeciesSearchModal({ onClose, onSearch }) {
  const [input, setInput] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/capturas')
      .then(r => r.json())
      .then(data => {
        const tags = new Set();
        if (Array.isArray(data)) {
          data.forEach(c => {
            if (Array.isArray(c.tags)) {
              c.tags.forEach(t => tags.add(t.toLowerCase().trim()));
            }
          });
        }
        setAvailableTags(Array.from(tags));
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const searchTag = input.trim().toLowerCase();
    if (availableTags.includes(searchTag)) {
      onSearch(searchTag);
    } else {
      setError(`No hay ninguna captura registrada con la especie "${input}".`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '60vh' }}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        <h3>Buscar Especie</h3>
        <p style={{marginBottom: '1rem', color: 'var(--nav-inactive)'}}>Introduce el nombre de la especie para ver en el mapa dónde se ha pescado.</p>
        
        {loading ? (
          <p style={{color: 'var(--nav-inactive)'}}>Cargando base de datos...</p>
        ) : (
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="text"
              className="tag-input"
              placeholder="Ej: Dorada, Lubina..."
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(''); }}
              autoFocus
              style={{ flex: 1 }}
            />
            <button type="submit" className="add-tag-btn" style={{ padding: '0.75rem 1rem' }}>
              <Search size={18} />
            </button>
          </form>
        )}
        
        {error && <p style={{color: '#ef4444', marginTop: '1rem', fontSize: '0.95rem', fontWeight: 500}}>{error}</p>}
      </div>
    </div>
  );
}
