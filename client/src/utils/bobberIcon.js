import L from 'leaflet';

const svgIcon = `
<svg width="36" height="48" viewBox="0 0 64 84" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 8px 10px rgba(239,68,68,0.5)); overflow: visible;">
  <defs>
    <linearGradient id="bobberRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f87171" />
      <stop offset="50%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>
    <linearGradient id="bobberWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>
  </defs>

  <!-- Antena superior -->
  <line x1="32" y1="5" x2="32" y2="25" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />
  <!-- Punta de la antena -->
  <circle cx="32" cy="5" r="4" fill="url(#bobberRedGrad)" />
  
  <!-- Mitad superior roja -->
  <path d="M 12 45 A 20 20 0 0 1 52 45 Z" fill="url(#bobberRedGrad)" />
  
  <!-- Mitad inferior blanca -->
  <path d="M 12 45 A 20 20 0 0 0 52 45 Z" fill="url(#bobberWhiteGrad)" />
  
  <!-- Línea divisoria negra (azul muy oscuro para encajar con el estilo) -->
  <line x1="12" y1="45" x2="52" y2="45" stroke="#0f172a" stroke-width="2" />
  
  <!-- Brillo 3D (Highlight) -->
  <path d="M 20 32 A 15 15 0 0 1 30 27" fill="none" stroke="#fca5a5" stroke-width="3" opacity="0.8" stroke-linecap="round" />
  <path d="M 22 60 A 15 15 0 0 0 35 63" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.6" stroke-linecap="round" />
  
  <!-- Antena inferior -->
  <line x1="32" y1="65" x2="32" y2="78" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
  <!-- Ojal de la antena inferior -->
  <circle cx="32" cy="80" r="3" fill="none" stroke="#0f172a" stroke-width="2" />
</svg>`;

export const bobberIcon = L.divIcon({
  html: svgIcon,
  className: 'custom-bobber-icon',
  iconSize: [36, 48],
  iconAnchor: [18, 48],
  popupAnchor: [0, -48]
});
