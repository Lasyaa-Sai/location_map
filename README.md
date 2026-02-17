# Transport Network Explorer

A React-based web application that allows users to explore transport networks and search for specific locations (e.g., VOX Cinemas) on an interactive map.

##  Features

- **Interactive Map**: Powered by [Leaflet](https://leafletjs.com/) and [React Leaflet](https://react-leaflet.js.org/).
- **Transport Overlays**: Uses [Thunderforest Transport](https://www.thunderforest.com/maps/transport/) tiles for detailed public transport visualization.
- **Location Search**: Integrated with [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) for real-time geocoding.
- **Predefined Locations**: Quick access to a curated list of VOX Cinemas across the UAE.
- **Auto-Zoom & Center**: The map automatically adjusts its bounds to display all selected locations.
- **Selection Management**: Easy ways to select multiple locations or clear current filters.

##  Tech Stack

- **Frontend**: React.js
- **Mapping**: Leaflet, React Leaflet
- **HTTP Client**: Axios
- **Tiles**: Thunderforest Transport API
- **Geocoding**: OpenStreetMap Nominatim

##  Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd map_app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory and add your Thunderforest API key:
   ```env
   REACT_APP_THUNDERFOREST_API_KEY=your_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

<<<<<<< HEAD
##  Project Structure
=======
## Project Structure
>>>>>>> a01adaa97ea845694bf2024adb29d68cb5523a03

```text
src/
├── components/
│   └── MapWidget/
│       ├── LocationList.js   # Predefined locations & dropdown logic
│       ├── MapAutoZoomer.js  # Automatic map bounds management
│       ├── MapIcons.js       # Custom marker icons
│       ├── MapWidget.css     # Styling for the map component
│       └── MapWidget.js      # Main map orchestration component
├── App.js                    # Entry point
└── index.js                  # React DOM rendering
```

<<<<<<< HEAD
##  Functionalities
=======
## Functionalities
>>>>>>> a01adaa97ea845694bf2024adb29d68cb5523a03

### Searching
Type a location in the search bar and click **Search**. The application will use Nominatim to find the first match and center the map on it.

### Predefined Locations
Use the multi-select dropdown to pick one or more VOX Cinema locations. The map will dynamically zoom to fit all selected markers.

### Clearing
Click the **Clear Selection** button to reset the search input and revert the map to showing all default cinema locations.
