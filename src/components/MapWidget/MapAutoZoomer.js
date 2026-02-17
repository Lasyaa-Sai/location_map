import { useEffect, useRef } from 'react';
import { useMap, FeatureGroup } from 'react-leaflet';

const MapAutoZoomer = ({ selectedLocations, children }) => {
  const featureGroupRef = useRef();
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