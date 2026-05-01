import { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Search, MapPin, Fish } from 'lucide-react';

export default function SearchBar({ style, onFilterSpecies }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mode, setMode] = useState('place'); // 'place' | 'species'
  const [availableTags, setAvailableTags] = useState([]);

  const map = useMap();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (onFilterSpecies) {
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
        })
        .catch(e => console.error(e));
    }
  }, [onFilterSpecies]);

  const fetchSuggestions = async (searchText) => {
    if (!searchText.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    
    if (mode === 'species') {
      const filtered = availableTags.filter(t => t.includes(searchText.trim().toLowerCase()));
      setResults(filtered.map(t => ({ display_name: t })));
      setShowDropdown(true);
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5`);
      const data = await response.json();
      setResults(data || []);
      setShowDropdown(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 500); // 500ms debounce
  };

  const handleSelectResult = (result) => {
    if (mode === 'species') {
      onFilterSpecies(result.display_name);
      setQuery('');
      setShowDropdown(false);
    } else {
      map.flyTo([result.lat, result.lon], 13, { animate: true, duration: 1 });
      setQuery(result.display_name.split(',')[0]); // Solo poner el nombre principal en el input
      setShowDropdown(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (mode === 'species') {
      const searchTag = query.trim().toLowerCase();
      if (availableTags.includes(searchTag)) {
        onFilterSpecies(searchTag);
        setQuery('');
        setShowDropdown(false);
      } else {
        alert('No se encontraron capturas de esa especie.');
      }
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        map.flyTo([lat, lon], 13, { animate: true, duration: 1.5 });
        setShowDropdown(false);
      } else {
        alert('No se encontró el lugar. Intenta con otro nombre.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="map-search-container" style={style}>
      {onFilterSpecies && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', justifyContent: 'center' }}>
          <button 
            type="button"
            onClick={() => { setMode('place'); setQuery(''); setResults([]); setShowDropdown(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.8rem', borderRadius: '1rem', border: 'none', background: mode === 'place' ? 'var(--header-bg)' : 'var(--bg-color)', color: mode === 'place' ? 'var(--header-icons)' : 'var(--text-color)', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
          >
            <MapPin size={16} /> Lugar
          </button>
          <button 
            type="button"
            onClick={() => { setMode('species'); setQuery(''); setResults([]); setShowDropdown(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.8rem', borderRadius: '1rem', border: 'none', background: mode === 'species' ? 'var(--header-bg)' : 'var(--bg-color)', color: mode === 'species' ? 'var(--header-icons)' : 'var(--text-color)', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
          >
            <Fish size={16} /> Especie
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="map-search-bar">
        <input 
          type="text" 
          placeholder={mode === 'place' ? "Buscar zona (ej: Jaén...)" : "Buscar especie (ej: Dorada...)"} 
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay para poder hacer clic
          disabled={isSearching}
        />
        <button type="submit" disabled={isSearching}>
          <Search size={18} />
        </button>
      </form>
      
      {showDropdown && results.length > 0 && (
        <ul className="search-dropdown">
          {results.map((item, index) => (
            <li key={item.place_id || index} onClick={() => handleSelectResult(item)}>
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
