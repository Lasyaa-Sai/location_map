import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import './MapWidget.css';
import LocationList, { voxLocations } from './LocationList';

// Standard Blue Icon Setup
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let BlueIcon = L.icon({ 
  iconUrl: icon, 
  shadowUrl: iconShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41],
  popupAnchor: [1, -34] 
});


function MapAutoZoomer({ selectedLocations }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocations && selectedLocations.length > 1) {
      const bounds = L.latLngBounds(selectedLocations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (selectedLocations && selectedLocations.length === 1) {
      map.setView([selectedLocations[0].lat, selectedLocations[0].lng], 15);
    }
  }, [selectedLocations, map]);

  return null;
}
const MapWidget = () => {
  const [textInput, setTextInput] = useState('');
  const [latInput, setLatInput] = useState(25.2048);
  const [lngInput, setLngInput] = useState(55.2708);
  
 
  const [selectedCinemas, setSelectedCinemas] = useState(voxLocations); 
  
  const apiKey = process.env.REACT_APP_THUNDERFOREST_API_KEY;
  const handleMultiSelect = (locations) => {
    const displayList = locations.length > 0 ? locations : voxLocations;
    setSelectedCinemas(displayList);
  };

  const handleTextSearch = async () => {
    if (!textInput) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${textInput}`);
      if (res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        setSelectedCinemas([{ 
          name: display_name.split(',')[0], 
          lat: parseFloat(lat), 
          lng: parseFloat(lon) 
        }]);
      }
    } catch (err) {
      alert("Search failed");
    }
  };

  return (
    <div className="widget-container">
      {/* Search and Coords UI stays the same */}
      <LocationList onSelectLocations={handleMultiSelect} />

      <div className="map-frame">
        <MapContainer center={[25.2048, 55.2708]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; Thunderforest'
            url={`https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${apiKey}`}
          />
          
          {selectedCinemas.map((loc, index) => (
            <Marker key={`${loc.name}-${index}`} position={[loc.lat, loc.lng]} icon={BlueIcon}>
              <Popup><strong>{loc.name}</strong></Popup>
            </Marker>
          ))}

          {/* This component handles all centering/zooming logic */}
          <MapAutoZoomer selectedLocations={selectedCinemas} />
        </MapContainer>
      </div>
    </div>
  );
};
export default MapWidget;