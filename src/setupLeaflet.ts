/**
 * Leaflet setup — ensures the bundled Leaflet instance is set as window.L
 * for any plugins that need it (e.g., Google Maps integration).
 */
import L from 'leaflet';

(window as any).L = L;
