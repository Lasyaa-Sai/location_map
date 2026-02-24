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
            // Safety check: Filter out any items with missing or NaN coordinates
            const validLocations = selectedLocations.filter(loc =>
                loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' &&
                !isNaN(loc.lat) && !isNaN(loc.lng)
            );

            if (validLocations.length === 0) return;

            // Wait a frame for markers to be actually added to the DOM/FeatureGroup
            const frame = requestAnimationFrame(() => {
                if (featureGroupRef.current) {
                    const bounds = featureGroupRef.current.getBounds();
                    if (bounds.isValid()) {
                        try {
                            map.fitBounds(bounds, { padding: [50, 50], animate: true });
                        } catch (e) {
                            console.warn('MapAutoZoomer: fitBounds failed', e);
                        }
                    }
                }
            });
            return () => cancelAnimationFrame(frame);
        }
    }, [selectedLocations, map]);

    return <FeatureGroup ref={featureGroupRef}>{children}</FeatureGroup>;
};

export default MapAutoZoomer;
