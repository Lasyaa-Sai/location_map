import React, { ReactNode } from 'react';
import { Marker } from 'react-leaflet';
import { RedIcon } from './MapIcons';
import { LatLngExpression } from 'leaflet';

interface CustomMarkerProps {
    position: LatLngExpression;
    children?: ReactNode;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ position, children }) => {
    return (
        <Marker position={position} icon={RedIcon}>
            {children}
        </Marker>
    );
};

export default CustomMarker;
