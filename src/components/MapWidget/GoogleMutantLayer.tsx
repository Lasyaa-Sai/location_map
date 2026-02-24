import { createLayerComponent } from '@react-leaflet/core';
import L from 'leaflet';
// Import the GoogleMutant class directly as the default export from the ESM source.
// Do NOT use L.gridLayer.googleMutant() factory — it references L.GridLayer.GoogleMutant
// which is never assigned in the ESM build.
import 'leaflet.gridlayer.googlemutant';
import GoogleMutant from 'leaflet.gridlayer.googlemutant';


const createGoogleMutant = (props: GoogleMutantProps, context: any) => {
    const { type = 'roadmap', ...rest } = props;

    try {
        // Use the default-exported class directly, not the factory
        const instance = new GoogleMutant({ type, ...rest });
        return { instance, context };
    } catch (e) {
        console.warn('GoogleMutantLayer: GoogleMutant instantiation failed, using fallback.', e);
        return { instance: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'), context };
    }
};

const updateGoogleMutant = (instance: L.GridLayer, props: GoogleMutantProps, prevProps: GoogleMutantProps) => {
    if (props.type !== prevProps.type && props.type) {
        // @ts-ignore
        if (typeof instance.setElement === 'function') {
            // @ts-ignore
            instance.setElement(props.type);
        }
    }
};

export const GoogleMutantLayer = createLayerComponent<L.GridLayer, GoogleMutantProps>(
    createGoogleMutant,
    updateGoogleMutant
);
