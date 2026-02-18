# Transport Network Explorer

A React-based web application that allows users to explore transport networks and search for specific locations (e.g., VOX Cinemas) on an interactive map.

##  Features

- **Interactive Map**: Powered by [Leaflet](https://leafletjs.com/) and [React Leaflet](https://react-leaflet.js.org/).
- **Transport Overlays**: Uses [Thunderforest Transport](https://www.thunderforest.com/maps/transport/) tiles via a secure backend proxy.
- **Location Search**: Integrated with [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) via backend proxy.
- **Secure Backend**: Python FastAPI server handles all external API requests to protect sensitive keys.
- **Pin Location**: Click anywhere on the map to drop a pin and retrieve its real-world address via reverse geocoding.
- **Nearby Locations**: Discover points of interest (malls, shops, residential areas) surrounding any pinned point.
- **Auto-Zoom & Center**: The map automatically adjusts its bounds to display all selected locations.
- **Selection Management**: Easy ways to select multiple locations or clear current filters.

##  Tech Stack

- **Frontend**: React.js
- **Backend**: FastAPI (Python)
- **Mapping**: Leaflet, React Leaflet
- **HTTP Client**: Axios (Frontend), Requests (Backend)
- **Tiles**: Thunderforest Transport API
- **Geocoding**: OpenStreetMap Nominatim

##  Setup & Installation

### 1. Setup Backend
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
pip install -r requirements.txt
```

Create a `backend/.env` file and add your Thunderforest API key:
```env
THUNDERFOREST_API_KEY=your_api_key_here
```

Start the backend:
```bash
python main.py
```

### 2. Setup Frontend
In a new terminal:
```bash
cd ..
npm install
npm start
```

##  Project Structure

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

## Functionalities

### Searching
Type a location in the search bar and click **Search**. The application will use Nominatim to find the first match and center the map on it.

### Pinning Locations
Click anywhere on the map to drop a custom pin. The application will instantly fetch the address using reverse geocoding and display a list of nearby commercial and residential locations in the side panel.

### Predefined Locations
Use the multi-select dropdown to pick one or more VOX Cinema locations. The map will dynamically zoom to fit all selected markers.

### Clearing
Click the **Clear Selection** button to reset the search input, remove pinned locations, and revert the map to showing default cinema locations.
