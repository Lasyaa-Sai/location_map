import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import './MapWidget.css';
import LocationList, { voxLocations } from './LocationList';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let BlueIcon = L.icon({ 
  iconUrl: icon, 
  shadowUrl: iconShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41],
  popupAnchor: [1, -34] 
});
L.Marker.prototype.options.icon = BlueIcon;

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom); 
  }, [center, zoom, map]);
  return null;
}

const MapWidget = () => {
  const [textInput, setTextInput] = useState('');
  const [latInput, setLatInput] = useState(25.2048);
  const [lngInput, setLngInput] = useState(55.2708);
  
  const [viewPos, setViewPos] = useState([25.2048, 55.2708]);
  const [selectedCinemas, setSelectedCinemas] = useState(voxLocations); // Initially show all
  const [zoomLevel, setZoomLevel] = useState(11);
  
  const apiKey = process.env.REACT_APP_THUNDERFOREST_API_KEY;

  const handleMultiSelect = (locations) => {
    const displayList = locations.length > 0 ? locations : voxLocations;
    setSelectedCinemas(displayList);
    
    if (locations.length > 0) {
      const latest = locations[locations.length - 1];
      setViewPos([parseFloat(latest.lat), parseFloat(latest.lng)]);
      setZoomLevel(14);
    }
  };

  const handleTextSearch = async () => {
    if (!textInput) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${textInput}`);
      if (res.data.length > 0) {
        const { lat, lon } = res.data[0];
        const newPos = [parseFloat(lat), parseFloat(lon)];
        setViewPos(newPos);
        setZoomLevel(16);
        setSelectedCinemas([{ name: textInput, lat, lng: lon }]);
      }
    } catch (err) {
      alert("Error finding location");
    }
  };

  return (
    <div className="widget-container">
      <div className="input-group">
        <input placeholder="Search..." value={textInput} onChange={(e) => setTextInput(e.target.value)} />
        <button onClick={handleTextSearch} className="search-btn">Search</button>
      </div>

      <div className="input-group">
        <input type="number" step="any" value={latInput} onChange={(e) => setLatInput(e.target.value)} />
        <input type="number" step="any" value={lngInput} onChange={(e) => setLngInput(e.target.value)} />
        <button onClick={() => { setViewPos([latInput, lngInput]); setZoomLevel(16); }} className="search-btn">Go</button>
      </div>

      <div className="dropdown-section">
        <LocationList onSelectLocations={handleMultiSelect} />
      </div>

      <div className="map-frame">
        <MapContainer center={viewPos} zoom={zoomLevel} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; Thunderforest'
            url={`https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${apiKey}`}
          />
          
          {selectedCinemas.map((loc, index) => (
            <Marker key={`${loc.name}-${index}`} position={[loc.lat, loc.lng]} icon={BlueIcon}>
              <Popup>
                <strong>{loc.name}</strong> <br />
                <span>Lat: {loc.lat}</span> <br />
                <span>Lng: {loc.lng}</span>
              </Popup>
            </Marker>
          ))}

          <MapUpdater center={viewPos} zoom={zoomLevel} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapWidget;