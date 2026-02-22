import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import MapAutoZoomer from './MapAutoZoomer';
import LocationList, { voxLocations, Location } from './LocationList';
import { BlueIcon, RedIcon } from './MapIcons';
import CustomMarker from './CustomMarker';
import NearbyLocations from './NearbyLocations';
import config, { add_api, get_tile_url } from '../../config';
import { OSM } from '../../services/Maps';
import './MapWidget.css';
import { LatLng } from 'leaflet';

const MapWidget: React.FC = () => {
    const [textInput, setTextInput] = useState<string>('');
    const [selectedCinemas, setSelectedCinemas] = useState<(Location & { isSearch?: boolean })[]>(voxLocations);
    const [clickedLocation, setClickedLocation] = useState<LatLng | null>(null);
    const [locationAddress, setLocationAddress] = useState<string>('');
    const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);
    const [nearbyLoading, setNearbyLoading] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLSelectElement>(null);

    const mapsService = new OSM();

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
            const results = await mapsService.search(config, textInput);
            if (results.length > 0) {
                setClickedLocation(null);
                setLocationAddress('');
                setNearbyLocations([]);

                const { lat, lon, display_name } = results[0];
                setSelectedCinemas([{
                    name: display_name.split(',')[0],
                    lat: parseFloat(lat),
                    lng: parseFloat(lon),
                    isSearch: true
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
                    const result = await mapsService.reverse(config, lat, lng);
                    setLocationAddress(result.address);

                    setNearbyLoading(true);
                    setNearbyLocations([]);

                    const nearby = await mapsService.nearby(config, lat, lng);
                    setNearbyLocations(nearby);
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
                    <TileLayer
                        url={get_tile_url()}
                        attribution={config.attribution}
                    />

                    <MapAutoZoomer selectedLocations={selectedCinemas}>
                        {selectedCinemas.map((loc, i) => (
                            <Marker key={i} position={[loc.lat, loc.lng]} icon={loc.isSearch ? RedIcon : BlueIcon}>
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
