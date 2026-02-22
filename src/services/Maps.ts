import axios from 'axios';

/**
 * Interface for Map Service providers
 */
export interface Maps {
    search: (config: any, query: string) => Promise<any[]>;
    reverse: (config: any, lat: number, lng: number) => Promise<{ address: string }>;
    nearby: (config: any, lat: number, lng: number) => Promise<any[]>;
}

/**
 * Implementation for Google Maps Service
 */
export class GoogleMaps implements Maps {
    async search(config: any, query: string): Promise<any[]> {
        // Implementation for Google Maps Search (typically using Google Places API)
        console.log('Google Maps Search:', query);
        // Note: Google Maps usually requires its own SDK or specific API structure
        return [];
    }

    async reverse(config: any, lat: number, lng: number): Promise<{ address: string }> {
        // Implementation for Google Maps Reverse Geocoding
        console.log('Google Maps Reverse Geocode:', lat, lng);
        return { address: 'Google Maps Address' };
    }

    async nearby(config: any, lat: number, lng: number): Promise<any[]> {
        // Implementation for Google Maps Nearby Search
        console.log('Google Maps Nearby:', lat, lng);
        return [];
    }
}

/**
 * Implementation for OpenStreetMap / LocationIQ / Nominatim Services
 */
export class OSM implements Maps {

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async search(config: any, query: string): Promise<any[]> {
        const url = new URL(`${config.baseUrl}/search${config.suffix}`);
        if (config.apiKey && config.keyParam) {
            url.searchParams.append(config.keyParam, config.apiKey);
        }
        url.searchParams.append('q', query);
        url.searchParams.append('format', 'json');
        url.searchParams.append('accept-language', 'en');

        try {
            const response = await axios.get(url.toString());
            return response.data;
        } catch (error) {
            console.error('OSM Search Error:', error);
            return [];
        }
    }

    async reverse(config: any, lat: number, lng: number): Promise<{ address: string }> {
        const url = new URL(`${config.baseUrl}/reverse${config.suffix}`);
        if (config.apiKey && config.keyParam) {
            url.searchParams.append(config.keyParam, config.apiKey);
        }
        url.searchParams.append('lat', lat.toString());
        url.searchParams.append('lon', lng.toString());
        url.searchParams.append('format', 'json');
        url.searchParams.append('accept-language', 'en');

        try {
            const response = await axios.get(url.toString());
            return { address: response.data.display_name || 'Address not found' };
        } catch (error) {
            console.error('OSM Reverse Error:', error);
            return { address: 'Address lookup failed' };
        }
    }

    async nearby(config: any, lat: number, lng: number): Promise<any[]> {
        const radius = 0.015;
        const viewbox = `${lng - radius},${lat + radius},${lng + radius},${lat - radius}`;
        const categories = ['residential', 'commercial', 'office building', 'commercial building'];
        const combinedData: any[] = [];

        for (const cat of categories) {
            const url = new URL(`${config.baseUrl}/search${config.suffix}`);
            if (config.apiKey && config.keyParam) {
                url.searchParams.append(config.keyParam, config.apiKey);
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
                    combinedData.push(...response.data);
                }
            } catch (err) {
                console.error(`Error fetching category ${cat}:`, err);
            }
            // Respect API rate limits
            await this.sleep(600);
        }

        const uniquePlaces: any[] = [];
        const seenNames = new Set<string>();

        combinedData.forEach(item => {
            const name = item.display_name.split(',')[0].trim();
            const address = item.display_name.split(',').slice(1, 3).join(',').trim();

            if (!seenNames.has(name.toLowerCase())) {
                uniquePlaces.push({
                    name: name,
                    type: (item.type || item.class || 'place').replace(/_/g, ' '),
                    address: address
                });
                seenNames.add(name.toLowerCase());
            }
        });

        return uniquePlaces.slice(0, 12);
    }
}
