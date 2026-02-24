import axios from 'axios';
import { IMapProvider, MapProviderConfig, MapSearchResult, MapReverseResult, MapNearbyResult } from '../types/mapInterface';
export class GoogleMaps implements IMapProvider {
    private config: MapProviderConfig;
    private geocoder?: google.maps.Geocoder;

    constructor(config: MapProviderConfig) {
        this.config = config;
    }

    private getGeocoder(): google.maps.Geocoder {
        if (!this.geocoder) {
            this.geocoder = new google.maps.Geocoder();
        }
        return this.geocoder;
    }

    async search(query: string): Promise<MapSearchResult[]> {
        return new Promise((resolve) => {
            this.getGeocoder().geocode({ address: query }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results) {
                    resolve(results.map(item => ({
                        lat: item.geometry.location.lat(),
                        lng: item.geometry.location.lng(),
                        name: item.formatted_address
                    })));
                } else {
                    console.error('Google Search Error:', status);
                    resolve([]);
                }
            });
        });
    }

    async reverse(lat: number, lng: number): Promise<MapReverseResult> {
        return new Promise((resolve) => {
            this.getGeocoder().geocode({ location: { lat, lng } }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                    resolve({
                        address: results[0].formatted_address,
                        raw: results[0]
                    });
                } else {
                    console.error('Google Reverse Error:', status);
                    resolve({ address: 'Address lookup failed' });
                }
            });
        });
    }

    async nearby(lat: number, lng: number): Promise<MapNearbyResult[]> {
        // PlacesService requires an HTML element (usually the map, or a dummy div)
        const dummy = document.createElement('div');
        const service = new google.maps.places.PlacesService(dummy);

        return new Promise((resolve) => {
            service.nearbySearch({
                location: { lat, lng },
                radius: 1500
            }, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    resolve(results.slice(0, 12).map(item => ({
                        name: item.name || 'Unnamed',
                        type: item.types?.[0]?.replace(/_/g, ' ') || 'place',
                        address: item.vicinity || 'Unknown address'
                    })));
                } else {
                    console.error('Google Nearby Error:', status);
                    resolve([]);
                }
            });
        });
    }
}


export class OSM implements IMapProvider {
    private config: MapProviderConfig;

    constructor(config: MapProviderConfig) {
        this.config = config;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async search(query: string): Promise<MapSearchResult[]> {
        const url = new URL(`${this.config.baseUrl}/search${this.config.suffix}`);
        if (this.config.apiKey && this.config.keyParam) {
            url.searchParams.append(this.config.keyParam, this.config.apiKey);
        }
        url.searchParams.append('q', query);
        url.searchParams.append('format', 'json');
        url.searchParams.append('accept-language', 'en');

        try {
            const response = await axios.get(url.toString());
            return response.data.map((item: any) => ({
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                name: item.display_name
            }));
        } catch (error) {
            console.error('OSM Search Error:', error);
            return [];
        }
    }

    async reverse(lat: number, lng: number): Promise<MapReverseResult> {
        const url = new URL(`${this.config.baseUrl}/reverse${this.config.suffix}`);
        if (this.config.apiKey && this.config.keyParam) {
            url.searchParams.append(this.config.keyParam, this.config.apiKey);
        }
        url.searchParams.append('lat', lat.toString());
        url.searchParams.append('lon', lng.toString());
        url.searchParams.append('format', 'json');
        url.searchParams.append('accept-language', 'en');

        try {
            const response = await axios.get(url.toString());
            return {
                address: response.data.display_name || 'Address not found',
                raw: response.data
            };
        } catch (error) {
            console.error('OSM Reverse Error:', error);
            return { address: 'Address lookup failed' };
        }
    }

    async nearby(lat: number, lng: number): Promise<MapNearbyResult[]> {
        const radius = 0.015;
        const viewbox = `${lng - radius},${lat + radius},${lng + radius},${lat - radius}`;
        const categories = ['residential', 'commercial', 'office building', 'commercial building'];
        const combinedData: MapNearbyResult[] = [];
        const seenNames = new Set<string>();

        for (const cat of categories) {
            const url = new URL(`${this.config.baseUrl}/search${this.config.suffix}`);
            if (this.config.apiKey && this.config.keyParam) {
                url.searchParams.append(this.config.keyParam, this.config.apiKey);
            }
            url.searchParams.append('q', cat);
            url.searchParams.append('viewbox', viewbox);
            url.searchParams.append('bounded', '1');
            url.searchParams.append('limit', '3');
            url.searchParams.append('format', 'json');
            url.searchParams.append('accept-language', 'en');

            try {
                const response = await axios.get(url.toString());
                if (Array.isArray(response.data)) {
                    response.data.forEach((item: any) => {
                        const name = item.display_name.split(',')[0].trim();
                        const address = item.display_name.split(',').slice(1, 3).join(',').trim();

                        if (!seenNames.has(name.toLowerCase())) {
                            combinedData.push({
                                name: name,
                                type: (item.type || item.class || 'place').replace(/_/g, ' '),
                                address: address
                            });
                            seenNames.add(name.toLowerCase());
                        }
                    });
                }
            } catch (err) {
                console.error(`Error fetching category ${cat}:`, err);
            }
            await this.sleep(1100);
        }

        return combinedData.slice(0, 12);
    }
}
