export interface ProviderConfig {
    name: string;
    baseUrl: string;
    tileUrl: string;
    apiKey?: string;
    attribution: string;
    suffix: string;
    keyParam: string;
}

const provider = process.env.REACT_APP_MAP_PROVIDER || 'thunderforest';

let providerConfig: ProviderConfig;

switch (provider) {
    case 'locationiq':
        providerConfig = {
            name: 'locationiq',
            baseUrl: 'https://us1.locationiq.com/v1',
            tileUrl: 'https://{s}-tiles.locationiq.com/v2/obk/r/{z}/{x}/{y}.png',
            apiKey: process.env.REACT_APP_LOCATIONIQ_API_KEY,
            attribution: process.env.REACT_APP_MAP_ATTRIBUTION || '',
            suffix: '.php',
            keyParam: 'key'
        };
        break;
    case 'nominatim':
        providerConfig = {
            name: 'nominatim',
            baseUrl: 'https://nominatim.openstreetmap.org',
            tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            apiKey: '',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            suffix: '',
            keyParam: ''
        };
        break;
    default:
        providerConfig = {
            name: 'thunderforest',
            baseUrl: 'https://nominatim.openstreetmap.org',
            tileUrl: 'https://{s}.tile.thunderforest.com/atlas/{z}/{x}/{y}.png',
            apiKey: process.env.REACT_APP_THUNDERFOREST_API_KEY,
            attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            suffix: '',
            keyParam: ''
        };
}

const config = providerConfig;

export const add_api = (endpoint: string, params: Record<string, any> = {}): string => {
    const finalParams = { ...params };

    const url = new URL(`${config.baseUrl}/${endpoint}${config.suffix}`);

    if (config.apiKey && config.keyParam) {
        url.searchParams.append(config.keyParam, config.apiKey);
    }

    url.searchParams.append('format', 'json');
    url.searchParams.append('accept-language', 'en');

    Object.keys(finalParams).forEach(key => {
        url.searchParams.append(key, String(finalParams[key]));
    });

    return url.toString();
};

export const get_tile_url = (): string => {
    if (config.name === 'locationiq') {
        return `${config.tileUrl}?key=${config.apiKey}`;
    } else if (config.name === 'thunderforest') {
        return `${config.tileUrl}?apikey=${config.apiKey}`;
    }
    return config.tileUrl;
};

export default config;
