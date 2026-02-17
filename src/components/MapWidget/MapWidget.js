import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import MapAutoZoomer from './MapAutoZoomer';
import LocationList, { voxLocations } from './LocationList';
import { BlueIcon } from './MapIcons'; 
import { selectedIndex } from 'react';

const MapWidget = () => {
  const [textInput, setTextInput] = useState('');
  const [selectedCinemas, setSelectedCinemas] = useState(voxLocations);
  const dropdownRef = useRef(null); 
  
  const apiKey = process.env.REACT_APP_THUNDERFOREST_API_KEY;

  const handleClear = () => {
    setTextInput('');
    setSelectedCinemas(voxLocations);
    if (dropdownRef.current) {
      dropdownRef.current.selectedIndex = -1;
    }
    if (window.clearLocationListSelections) {
      window.clearLocationListSelections();
    }
    
  };

  const handleTextSearch = async () => {
    if (!textInput) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { format: 'json', q: textInput },
        headers: { 'User-Agent': 'CinemaApp/1.0' }
      });
      if (res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        setSelectedCinemas([{ 
          name: display_name.split(',')[0], 
          lat: parseFloat(lat), 
          lng: parseFloat(lon) 
        }]);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="widget-container">
      <div className="input-group">
        <input value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Search..." />
        <button onClick={handleTextSearch} className="search-btn">Search</button>
      </div>

      {/* Clear Button - This now works correctly */}
      <button onClick={handleClear} className="clear-btn" style={{ margin: '10px 0', cursor: 'pointer' }}>
        Clear Selection
      </button>

      <LocationList 
        onSelectLocations={(locs) => setSelectedCinemas(locs.length ? locs : voxLocations)} 
        selectRef={dropdownRef}
        selectedIndex={selectedIndex}
      />
      
      <div className="map-frame">
        <MapContainer center={[25.2048, 55.2708]} zoom={11} style={{ height: '400px', width: '100%' }}>
          <TileLayer url={`https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${apiKey}`} />
          
          <MapAutoZoomer selectedLocations={selectedCinemas}>
            {selectedCinemas.map((loc, i) => (
              <Marker key={i} position={[loc.lat, loc.lng]} icon={BlueIcon}>
                <Popup><strong>{loc.name}</strong></Popup>
              </Marker>
            ))}
          </MapAutoZoomer>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapWidget;