import React from 'react';
import { MapNearbyResult } from '../../types/mapInterface';
import './NearbyLocations.css';

interface NearbyLocationsProps {
    locations: MapNearbyResult[];
    loading: boolean;
    onSelect: (loc: MapNearbyResult) => void;
}

const NearbyLocations: React.FC<NearbyLocationsProps> = ({ locations, loading, onSelect }) => {
    if (loading) {
        return (
            <div className="nearby-container">
                <div className="nearby-header">
                    <span>📍</span> Nearby Locations
                </div>
                <div className="nearby-loading">Searching for nearby places...</div>
            </div>
        );
    }

    if (!locations || locations.length === 0) {
        return (
            <div className="nearby-container">
                <div className="nearby-header">
                    <span>📍</span> Nearby Locations (0)
                </div>
                <div className="nearby-empty">No commercial places found in this immediate area.</div>
            </div>
        );
    }

    return (
        <div className="nearby-container">
            <div className="nearby-header">
                <span>📍</span> Nearby Locations ({locations.length})
            </div>
            <ul className="nearby-list">
                {locations.map((loc, index) => (
                    <li key={index} className="nearby-item" onClick={() => onSelect(loc)} style={{ cursor: 'pointer' }}>
                        <div className="nearby-name">{loc.name || 'Unnamed Location'}</div>
                        <div className="nearby-type">{loc.type || 'Point of Interest'}</div>
                        <div className="nearby-address">{loc.address}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NearbyLocations;
