import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MapAutoZoomer from './MapAutoZoomer';
import LocationList, { voxLocations, Location } from './LocationList';
import { BlueIcon, RedIcon } from './MapIcons';
import CustomMarker from './CustomMarker';
import NearbyLocations from './NearbyLocations';
import config, { get_tile_url } from '../../config';
import { IMapProvider, MapProviderConfig, MapSearchResult, MapReverseResult, MapNearbyResult } from '../../types/mapInterface';
import { OSM, GoogleMaps } from '../../services/Maps';
import { GoogleMutantLayer } from './GoogleMutantLayer';
import './MapWidget.css';
import L, { LatLng } from 'leaflet';

const MapWidget: React.FC = () => {
    const [textInput, setTextInput] = useState<string>('');
    const [selectedCinemas, setSelectedCinemas] = useState<(Location & { isSearch?: boolean })[]>(voxLocations);
    const [clickedLocation, setClickedLocation] = useState<LatLng | null>(null);
    const [locationAddress, setLocationAddress] = useState<string>('');
    const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);
    const [nearbyLoading, setNearbyLoading] = useState<boolean>(false);
    const [googleReady, setGoogleReady] = useState<boolean>(!!(window as any).google);
    const [pluginReady, setPluginReady] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLSelectElement>(null);
    React.useEffect(() => {
        const checkReady = setInterval(() => {
            const hasGoogle = !!(window as any).google?.maps?.Map;
            if (hasGoogle) {
                setPluginReady(true);
                setGoogleReady(true);
                clearInterval(checkReady);
            }
        }, 300);
        return () => clearInterval(checkReady);
    }, []);

    const mapsService = config.name === 'google' ? new GoogleMaps(config) : new OSM(config);

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
            const results = await mapsService.search(textInput);
            if (results.length > 0) {
                const { lat, lng, name } = results[0];

                // Final safety check to prevent NaN if API returns bad data
                if (isNaN(lat) || isNaN(lng)) {
                    console.warn('Search returned invalid coordinates:', results[0]);
                    return;
                }

                setClickedLocation(null);
                setLocationAddress('');
                setNearbyLocations([]);

                setSelectedCinemas([{
                    name: name.split(',')[0],
                    lat: Number(lat),
                    lng: Number(lng),
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
                    const result = await mapsService.reverse(lat, lng);
                    setLocationAddress(result.address);

                    setNearbyLoading(true);
                    setNearbyLocations([]);

                    const nearby = await mapsService.nearby(lat, lng);
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
                {config.name === 'google' && (!googleReady || !pluginReady) ? (
                    <div style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="spinner"></div>
                            <div style={{ marginTop: '10px', color: '#666' }}>Initializing Google Maps...</div>
                        </div>
                    </div>
                ) : (
                    <MapContainer center={[25.2048, 55.2708]} zoom={11} style={{ height: '400px', width: '100%', borderRadius: '8px' }}>
                        {config.name === 'google' ? (
                            <GoogleMutantLayer type="roadmap" />
                        ) : (
                            <TileLayer
                                url={get_tile_url()}
                                attribution={config.attribution}
                            />
                        )}

                        <MapAutoZoomer selectedLocations={selectedCinemas}>
                            {selectedCinemas.map((loc, i) => (
                                <Marker key={i} position={[loc.lat, loc.lng]} icon={loc.isSearch ? RedIcon : BlueIcon}>
                                    <Popup><strong>{loc.name}</strong></Popup>
                                </Marker>
                            ))}
                        </MapAutoZoomer>
                        <LocationMarker />
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default MapWidget;
