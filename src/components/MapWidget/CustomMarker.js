import React from 'react';
import { Marker } from 'react-leaflet';
import { RedIcon } from './MapIcons';

const CustomMarker = ({ position, children }) => {
    return (
        <Marker position={position} icon={RedIcon}>
            {children}
        </Marker>
    );
};

export default CustomMarker;
