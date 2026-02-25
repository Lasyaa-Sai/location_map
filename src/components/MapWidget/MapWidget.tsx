import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import MapAutoZoomer from './MapAutoZoomer';
import LocationList, { voxLocations, Location } from './LocationList';
import { BlueIcon, RedIcon, GreenIcon } from './MapIcons';
import CustomMarker from './CustomMarker';
import NearbyLocations from './NearbyLocations';
import config, { get_tile_url } from '../../config';
import { OSM, GoogleMaps } from '../../services/Maps';
import './MapWidget.css';
import { LatLng } from 'leaflet';
import { MapNearbyResult } from '../../types/mapInterface';

const MapWidget: React.FC = () => {
    const [textInput, setTextInput] = useState<string>('');
    const [selectedCinemas, setSelectedCinemas] = useState<(Location & { isSearch?: boolean })[]>(voxLocations);
    const [clickedLocation, setClickedLocation] = useState<LatLng | null>(null);
    const [locationAddress, setLocationAddress] = useState<string>('');
    const [nearbyLocations, setNearbyLocations] = useState<MapNearbyResult[]>([]);
    const [nearbyLoading, setNearbyLoading] = useState<boolean>(false);
    const [selectedNearbyLocation, setSelectedNearbyLocation] = useState<MapNearbyResult | null>(null);
    const [lastSelectionType, setLastSelectionType] = useState<'cinema' | 'search' | 'pin' | 'nearby' | null>(null);
    const dropdownRef = useRef<HTMLSelectElement>(null);

    const mapsService = config.name === 'google' ? new GoogleMaps(config) : new OSM(config);

    const handleClear = () => {
        setTextInput('');
        setSelectedCinemas(voxLocations);
        setClickedLocation(null);
        setLocationAddress('');
        setNearbyLocations([]);
        setSelectedNearbyLocation(null);
        setLastSelectionType(null);
        if (dropdownRef.current) dropdownRef.current.selectedIndex = -1;
    };

    const handleTextSearch = async () => {
        if (!textInput) return;
        try {
            const results = await mapsService.search(textInput);
            if (results.length > 0) {
                const { lat, lng, name } = results[0];
                setSelectedCinemas([
                    ...voxLocations,
                    { name: name.split(',')[0], lat, lng, isSearch: true }
                ]);
                setLastSelectionType('search');
            }
        } catch (err) { console.error(err); }
    };

    function LocationMarker() {
        const map = useMapEvents({
            async click(e) {
                setClickedLocation(e.latlng);
                setSelectedNearbyLocation(null);
                setLastSelectionType('pin');
                setLocationAddress('Fetching address...');
                try {
                    const result = await mapsService.reverse(e.latlng.lat, e.latlng.lng);
                    setLocationAddress(result.address);
                    setNearbyLoading(true);
                    const nearby = await mapsService.nearby(e.latlng.lat, e.latlng.lng);
                    setNearbyLocations(nearby);
                } catch (error) { console.error(error); }
                finally { setNearbyLoading(false); }
            },
        });
        return clickedLocation ? (
            <CustomMarker position={clickedLocation}>
                <Popup><strong>Pinned Location</strong><br />{locationAddress}</Popup>
            </CustomMarker>
        ) : null;
    }

    function MapFlyToController() {
        const map = useMap();
        React.useEffect(() => {
            if (lastSelectionType === 'nearby' && selectedNearbyLocation) {
                map.flyTo([selectedNearbyLocation.lat, selectedNearbyLocation.lng], 16);
            } else if (lastSelectionType === 'pin' && clickedLocation) {
                map.flyTo(clickedLocation, 16);
            } else if (lastSelectionType === 'search') {
                const searchLoc = selectedCinemas.find(c => c.isSearch);
                if (searchLoc) {
                    map.flyTo([searchLoc.lat, searchLoc.lng], 16);
                }
            }
        }, [selectedNearbyLocation, clickedLocation, selectedCinemas, lastSelectionType, map]);
        return null;
    }

    return (
        <div className="widget-container">
            <div className="input-group">
                <input value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Search..." />
                <button onClick={handleTextSearch} className="search-btn">Search</button>
            </div>

            <button onClick={handleClear} className="clear-btn">Clear Selection</button>

            {/* Restored Cinema List Dropdown */}
            <LocationList
                onSelectLocations={(locs) => {
                    setSelectedCinemas(locs.length ? locs : voxLocations);
                    setLastSelectionType('cinema');
                }}
                selectRef={dropdownRef}
            />

            {/* Restored Pinned Address Box */}
            {clickedLocation && (
                <div className="pinned-address-box" style={{ margin: '10px 0', padding: '12px', border: '1px solid #007bff', borderRadius: '6px' }}>
                    <h4 style={{ color: '#007bff', margin: '0 0 5px 0' }}>Pinned Address:</h4>
                    <p style={{ margin: 0 }}>{locationAddress}</p>
                    <small style={{ color: '#888' }}>Coordinates: {clickedLocation.lat.toFixed(6)}, {clickedLocation.lng.toFixed(6)}</small>
                </div>
            )}

            {/* Nearby Locations List */}
            {clickedLocation && (
                <NearbyLocations
                    locations={nearbyLocations}
                    loading={nearbyLoading}
                    onSelect={(loc) => {
                        setSelectedNearbyLocation(loc);
                        setLastSelectionType('nearby');
                    }}
                />
            )}

            <div className="map-frame">
                <MapContainer center={[25.2048, 55.2708]} zoom={11} style={{ height: '400px', width: '100%' }}>
                    <TileLayer
                        url={get_tile_url()}
                        subdomains={config.subdomains || ['a', 'b', 'c']}
                        attribution={config.attribution}
                    />
                    <MapAutoZoomer
                        selectedLocations={selectedCinemas}
                        activeFocus={!!lastSelectionType && lastSelectionType !== 'cinema'}
                    >
                        {selectedCinemas.map((loc, i) => (
                            <Marker key={i} position={[loc.lat, loc.lng]} icon={loc.isSearch ? RedIcon : BlueIcon}>
                                <Popup><strong>{loc.name}</strong></Popup>
                            </Marker>
                        ))}
                    </MapAutoZoomer>
                    {selectedNearbyLocation && (
                        <Marker position={[selectedNearbyLocation.lat, selectedNearbyLocation.lng]} icon={GreenIcon}>
                            <Popup><strong>{selectedNearbyLocation.name}</strong><br />{selectedNearbyLocation.address}</Popup>
                        </Marker>
                    )}
                    <MapFlyToController />
                    <LocationMarker />
                </MapContainer>
            </div>
        </div>
    );
};

export default MapWidget;