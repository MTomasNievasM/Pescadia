import L from 'leaflet';

const svgIcon = `
<svg width="36" height="48" viewBox="0 0 130 140" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 8px 10px rgba(14,165,233,0.5)); overflow: visible;">
  <defs>
    <linearGradient id="hookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>

  <!-- Ojo -->
  <line x1="45" y1="10" x2="45" y2="20" stroke="url(#hookGrad)" stroke-width="10" stroke-linecap="round" />
  <circle cx="45" cy="35" r="14" fill="none" stroke="url(#hookGrad)" stroke-width="10" />
  
  <!-- Cuerpo -->
  <path d="M 45 49 L 45 90 A 35 35 0 0 0 115 90 L 115 75" fill="none" stroke="url(#hookGrad)" stroke-width="12" stroke-linecap="butt" />
  
  <!-- Punta y Barb -->
  <path d="M 109 75.5 L 121 75.5 C 121 60, 118 50, 115 40 L 85 75 Q 100 75, 109 75.5 Z" fill="url(#hookGrad)" />
  
  <!-- Brillo (Highlight) 3D -->
  <path d="M 41 50 L 41 90 A 39 39 0 0 0 119 90" fill="none" stroke="#bae6fd" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
</svg>`;

export const fishIcon = L.divIcon({
  html: svgIcon,
  className: 'custom-fish-icon',
  iconSize: [36, 48],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45]
});
