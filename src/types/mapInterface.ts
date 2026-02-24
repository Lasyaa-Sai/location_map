
export interface MapProviderConfig {
    name: 'google' | 'osm' | 'locationiq' | 'nominatim' | 'thunderforest';
    baseUrl: string;
    tileUrl?: string;
    apiKey?: string;
    attribution: string;
    suffix: string;
    keyParam: string;
}

export interface MapSearchResult {
    lat: number;
    lng: number;
    name: string;
}

export interface MapReverseResult {
    address: string;
    raw?: any;
}

export interface MapNearbyResult {
    name: string;
    type: string;
    address: string;
}

export interface IMapProvider {
    search: (query: string) => Promise<MapSearchResult[]>;
    reverse: (lat: number, lng: number) => Promise<MapReverseResult>;
    nearby: (lat: number, lng: number) => Promise<MapNearbyResult[]>;
}
