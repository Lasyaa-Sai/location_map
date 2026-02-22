import React, { useEffect, useRef, ReactNode } from 'react';
import { useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';

interface MapAutoZoomerProps {
    selectedLocations: any[];
    children?: ReactNode;
}

const MapAutoZoomer: React.FC<MapAutoZoomerProps> = ({ selectedLocations, children }) => {
    const featureGroupRef = useRef<L.FeatureGroup>(null);
    const map = useMap();

    useEffect(() => {
        if (featureGroupRef.current && selectedLocations.length > 0) {
            const bounds = featureGroupRef.current.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [selectedLocations, map]);

    return <FeatureGroup ref={featureGroupRef}>{children}</FeatureGroup>;
};

export default MapAutoZoomer;
