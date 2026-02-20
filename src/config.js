const config = {
    baseUrl: 'https://us1.locationiq.com/v1',
    tileUrl: 'https://{s}-tiles.locationiq.com/v2/obk/r/{z}/{x}/{y}.png',
    apiKey: process.env.REACT_APP_LOCATIONIQ_API_KEY,
    attribution: process.env.REACT_APP_MAP_ATTRIBUTION
};

export const add_api = (endpoint, params = {}) => {
    const url = new URL(`${config.baseUrl}/${endpoint}.php`);
    url.searchParams.append('key', config.apiKey);
    url.searchParams.append('format', 'json');
    url.searchParams.append('accept-language', 'en');

    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });

    return url.toString();
};

export const get_tile_url = () => {
    return `${config.tileUrl}?key=${config.apiKey}`;
};

export default config;
