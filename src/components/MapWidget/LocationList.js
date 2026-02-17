import React, {useEffect} from 'react';
const voxLocations = [
  { name: "VOX Cinemas - Mall of the Emirates", lat: 25.1181, lng: 55.2006 },
  { name: "VOX Cinemas - City Centre Mirdif", lat: 25.2144, lng: 55.4075 },
  { name: "VOX Cinemas - City Centre Deira", lat: 25.2515, lng: 55.3337 },
  { name: "VOX Cinemas - Nakheel Mall", lat: 25.1140, lng: 55.1403 },
  { name: "VOX Cinemas - Burjuman Mall", lat: 25.2533, lng: 55.3025 },
  { name: "VOX Cinemas - Dubai Festival City Mall", lat: 25.2214, lng: 55.3503 },
  { name: "VOX Cinemas - Mercato Mall", lat: 25.2265, lng: 55.2525 },
  { name: "VOX Cinemas - City Centre Shindagha", lat: 25.2625, lng: 55.2905 },
  { name: "VOX Cinemas - Wafi Mall", lat: 25.2294, lng: 55.3188 },
  { name: "VOX Cinemas - Galleria Mall (Moonlight)", lat: 25.2119, lng: 55.2583 },
  { name: "VOX Cinemas - Yas Mall (Abu Dhabi)", lat: 24.4889, lng: 54.6074 },
  { name: "VOX Cinemas - The Galleria Al Maryah Island", lat: 24.5016, lng: 54.3911 },
  { name: "VOX Cinemas - Abu Dhabi Mall", lat: 24.4965, lng: 54.3831 },
  { name: "VOX Cinemas - Nation Towers", lat: 24.4651, lng: 54.3275 },
  { name: "VOX Cinemas - Reem Mall", lat: 24.4951, lng: 54.4044 },
  { name: "VOX Cinemas - Al Jimi Mall (Al Ain)", lat: 24.2448, lng: 55.7254 },
  { name: "VOX Cinemas - City Centre Al Zahia (Sharjah)", lat: 25.3181, lng: 55.4552 },
  { name: "VOX Cinemas - City Centre Sharjah", lat: 25.3261, lng: 55.3938 },
  { name: "VOX Cinemas - City Centre Ajman", lat: 25.3995, lng: 55.4795 },
  { name: "VOX Cinemas - Al Hamra Mall (RAK)", lat: 25.6946, lng: 55.7794 },
  { name: "VOX Cinemas - City Centre Fujairah", lat: 25.1205, lng: 56.3261 }
];

const LocationList = ({ onSelectLocations, selectRef}) => {
  const handleChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(opt => 
      voxLocations.find(loc => loc.name === opt.value)
    );
    onSelectLocations(selectedOptions);
  };
 useEffect(() => {
    window.clearLocationListSelections = () => {
      if (selectRef?.current) {
        selectRef.current.selectedIndex = -1; 
        selectRef.current.value = '';
      }
    };
  }, [selectRef]);
  return (
    <div className="dropdown-section">
      <p style={{ fontSize: '12px', margin: '5px 0', color: '#555' }}>
      </p>
      <select 
        multiple 
        ref={selectRef}
        className="location-dropdown" 
        style={{ width: '100%', height: '100px', padding: '5px' }}
        onChange={handleChange}
      >
        {voxLocations.map((loc, i) => (
          <option key={i} value={loc.name}>{loc.name}</option>
        ))}
      </select>
    </div>
  );
};


export { voxLocations };
export default LocationList;