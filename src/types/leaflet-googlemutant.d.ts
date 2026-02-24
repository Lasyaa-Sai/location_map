import * as L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';

declare module 'leaflet' {
    namespace gridLayer {
        function googleMutant(options?: GoogleMutantOptions): GridLayer;
    }

    namespace GridLayer {
        class GoogleMutant extends L.GridLayer {
            constructor(options?: GoogleMutantOptions);
            setElementSize(el: HTMLElement, size: L.Point): void;
        }
    }

    interface GoogleMutantOptions extends L.GridLayerOptions {
        type?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
        styles?: google.maps.MapTypeStyle[];
    }
}

declare module 'leaflet.gridlayer.googlemutant' {
    import L from 'leaflet';
    class GoogleMutant extends L.GridLayer {
        constructor(options?: L.GoogleMutantOptions);
        addGoogleLayer(name: string, options?: any): this;
        removeGoogleLayer(name: string): this;
        whenReady(fn: Function, context?: any): this;
    }
    export default GoogleMutant;
}
