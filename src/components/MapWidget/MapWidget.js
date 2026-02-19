import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import MapAutoZoomer from './MapAutoZoomer';
import LocationList, { voxLocations } from './LocationList';
import { BlueIcon } from './MapIcons';
import CustomMarker from './CustomMarker';
import NearbyLocations from './NearbyLocations';
import './MapWidget.css';

const MapWidget = () => {
  const [textInput, setTextInput] = useState('');
  const [selectedCinemas, setSelectedCinemas] = useState(voxLocations);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const dropdownRef = useRef(null);

  const API_BASE_URL = 'http://localhost:8000/api';

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
    setLocationAddress('');
    setNearbyLocations([]);
  };

  const handleTextSearch = async () => {
    if (!textInput) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/search`, {
        params: { q: textInput }
      });
      if (res.data.length > 0) {
        setClickedLocation(null);
        setLocationAddress('');
        setNearbyLocations([]);

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
      async click(e) {
        const { lat, lng } = e.latlng;
        setClickedLocation(e.latlng);
        setLocationAddress('Fetching address...');
        map.flyTo(e.latlng, map.getZoom());

        try {

          const response = await fetch(`${API_BASE_URL}/reverse?lat=${lat}&lon=${lng}`);
          const data = await response.json();
          if (data && data.display_name) {
            setLocationAddress(data.display_name);
          } else {
            setLocationAddress('Address not found');
          }


          setNearbyLoading(true);
          setNearbyLocations([]);

          const radius = 0.015;
          const viewbox = `${lng - radius},${lat + radius},${lng + radius},${lat - radius}`;

          const categories = ['residential', 'commercial', 'residential', 'house', 'villa', 'apartment', 'office building', 'commercial building','mall', 'shops', ];

          try {
            const fetchPromises = categories.map(cat =>
              fetch(`${API_BASE_URL}/nearby?cat=${cat}&viewbox=${viewbox}`)
                .then(res => res.json())
            );

            const resultsArray = await Promise.all(fetchPromises);
            const combinedData = resultsArray.flat();

            if (combinedData.length > 0) {
              const currentName = data.display_name ? data.display_name.split(',')[0].trim().toLowerCase() : '';

              const uniquePlaces = [];
              const seenNames = new Set();

              combinedData.forEach(item => {
                const name = item.display_name.split(',')[0].trim();
                const address = item.display_name.split(',').slice(1, 3).join(',').trim();

                if (!seenNames.has(name.toLowerCase()) && name.toLowerCase() !== currentName) {
                  uniquePlaces.push({
                    name: name,
                    type: (item.type || item.class || 'place').replace(/_/g, ' '),
                    address: address
                  });
                  seenNames.add(name.toLowerCase());
                }
              });

              setNearbyLocations(uniquePlaces.slice(0, 12));
            }
          } catch (err) {
            console.error("Nearby search error:", err);
          }
        } catch (error) {
          console.error('Error:', error);
          setLocationAddress('Location identified (Address lookup failed)');
        } finally {
          setNearbyLoading(false);
        }


      },
    });

    return clickedLocation === null ? null : (
      <CustomMarker position={clickedLocation}>
        <Popup>
          <strong>Pinned Location</strong><br />
          {locationAddress || 'Loading...'}<br />
          <small>{clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)}</small>
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
        onSelectLocations={(locs) => {
          setClickedLocation(null);
          setLocationAddress('');
          setNearbyLocations([]);
          setSelectedCinemas(locs.length ? locs : voxLocations);
        }}
        selectRef={dropdownRef}

      />

      {clickedLocation && (
        <div style={{ margin: '10px 0', padding: '12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #007bff', boxShadow: '0 2px 4px rgba(0,112,255,0.1)' }}>
          <div style={{ color: '#0056b3', fontWeight: 'bold', marginBottom: '4px' }}>Pinned Address:</div>
          <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.4' }}>{locationAddress}</div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
            Coordinates: {clickedLocation.lat.toFixed(6)}, {clickedLocation.lng.toFixed(6)}
          </div>
        </div>
      )}

      {clickedLocation && (
        <NearbyLocations locations={nearbyLocations} loading={nearbyLoading} />
      )}

      <div className="map-frame">
        <MapContainer center={[25.2048, 55.2708]} zoom={11} style={{ height: '400px', width: '100%' }}>
          <TileLayer url="http://localhost:8000/api/tiles/{z}/{x}/{y}" />

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