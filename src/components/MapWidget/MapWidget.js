import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import MapAutoZoomer from './MapAutoZoomer';
import LocationList, { voxLocations } from './LocationList';
import { BlueIcon } from './MapIcons';
import CustomMarker from './CustomMarker';

const MapWidget = () => {
  const [textInput, setTextInput] = useState('');
  const [selectedCinemas, setSelectedCinemas] = useState(voxLocations);
  const [clickedLocation, setClickedLocation] = useState(null);
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
    setClickedLocation(null);
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

  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        setClickedLocation(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      },
    });

    return clickedLocation === null ? null : (
      <CustomMarker position={clickedLocation}>
        <Popup>
          <strong>Pinned Location</strong><br />
          Lat: {clickedLocation.lat.toFixed(4)}<br />
          Lng: {clickedLocation.lng.toFixed(4)}
        </Popup>
      </CustomMarker>
    );
  }

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

      />

      {clickedLocation && (
        <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #ddd' }}>
          <strong>Pinned Location:</strong> {clickedLocation.lat.toFixed(6)}, {clickedLocation.lng.toFixed(6)}
        </div>
      )}

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
          <LocationMarker />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapWidget;