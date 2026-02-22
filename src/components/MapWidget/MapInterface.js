
import axios from 'axios';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MapProvider = {

  search: async (config, query) => {
    const isGoogle = config.name === 'google';
    const url = isGoogle 
      ? `${config.baseUrl}/geocode/json?address=${encodeURIComponent(query)}&key=${config.apiKey}`
      : `${config.baseUrl}/search?q=${encodeURIComponent(query)}&format=json&accept-language=en`;

    const res = await axios.get(url);
    const data = isGoogle ? res.data.results : res.data;

    return data.map(item => ({
      lat: parseFloat(isGoogle ? item.geometry.location.lat : item.lat),
      lng: parseFloat(isGoogle ? item.geometry.location.lng : item.lon),
      name: isGoogle ? item.formatted_address : item.display_name
    }));
  },


  reverse: async (config, lat, lng) => {
    const isGoogle = config.name === 'google';
    const url = isGoogle
      ? `${config.baseUrl}/geocode/json?latlng=${lat},${lng}&key=${config.apiKey}`
      : `${config.baseUrl}/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`;

    const res = await axios.get(url);
    const result = isGoogle ? res.data.results[0] : res.data;

    return {
      address: isGoogle ? result?.formatted_address : result?.display_name || 'Unknown',
      raw: result
    };
  },


  nearby: async (config, lat, lng) => {
    if (config.name === 'google') {
      const url = `${config.baseUrl}/place/nearbysearch/json?location=${lat},${lng}&radius=1500&key=${config.apiKey}`;
      const res = await axios.get(url);
      return (res.data.results || []).map(item => ({
        name: item.name,
        type: item.types?.[0]?.replace(/_/g, ' ') || 'place',
        address: item.vicinity
      })).slice(0, 12);
    }

    const radius = 0.015;
    const viewbox = `${lng - radius},${lat + radius},${lng + radius},${lat - radius}`;
    const categories = ['residential', 'commercial', 'office building', 'commercial building'];
    const combinedData = [];
    const seenNames = new Set();

    for (const cat of categories) {
      const url = `${config.baseUrl}/search?q=${cat}&viewbox=${viewbox}&bounded=1&limit=3&format=json&accept-language=en`;
      try {
        const res = await axios.get(url);
        if (Array.isArray(res.data)) {
          res.data.forEach(item => {
            const name = item.display_name.split(',')[0].trim();
            if (!seenNames.has(name.toLowerCase())) {
              seenNames.add(name.toLowerCase());
              combinedData.push({
                name: name,
                type: (item.type || item.class || 'place').replace(/_/g, ' '),
                address: item.display_name.split(',').slice(1, 3).join(',').trim()
              });
            }
          });
        }
      } catch (err) {
        if (err.response?.status === 429) await sleep(1000);
      }
      await sleep(600);
    }
    return combinedData.slice(0, 12);
  }
};

export default MapProvider;