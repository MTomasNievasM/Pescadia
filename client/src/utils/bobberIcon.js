import L from 'leaflet';

const svgIcon = `
<svg width="36" height="48" viewBox="0 0 64 84" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 6px 8px rgba(0,0,0,0.5)); overflow: visible;">
  <!-- Antena superior -->
  <line x1="32" y1="5" x2="32" y2="25" stroke="#1e293b" stroke-width="4" stroke-linecap="round" />
  <!-- Punta de la antena -->
  <circle cx="32" cy="5" r="4" fill="#ef4444" />
  
  <!-- Mitad superior roja -->
  <path d="M 12 45 A 20 20 0 0 1 52 45 Z" fill="#ef4444" />
  
  <!-- Mitad inferior blanca -->
  <path d="M 12 45 A 20 20 0 0 0 52 45 Z" fill="#f8fafc" />
  
  <!-- Línea divisoria negra -->
  <line x1="12" y1="45" x2="52" y2="45" stroke="#1e293b" stroke-width="2" />
  
  <!-- Brillo 3D (Opcional para que parezca más esfera) -->
  <path d="M 20 32 A 15 15 0 0 1 30 27" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.6" stroke-linecap="round" />
  
  <!-- Antena inferior -->
  <line x1="32" y1="65" x2="32" y2="78" stroke="#1e293b" stroke-width="3" stroke-linecap="round" />
  <!-- Ojal de la antena inferior -->
  <circle cx="32" cy="80" r="3" fill="none" stroke="#1e293b" stroke-width="2" />
</svg>`;

export const bobberIcon = L.divIcon({
  html: svgIcon,
  className: 'custom-bobber-icon',
  iconSize: [36, 48],
  iconAnchor: [18, 48],
  popupAnchor: [0, -48]
});
