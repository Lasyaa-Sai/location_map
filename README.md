# Transport Network Explorer

A React-based web application that allows users to explore transport networks and search for specific locations (e.g., VOX Cinemas) on an interactive map.

##  Features

- **Interactive Map**: Powered by [Leaflet](https://leafletjs.com/) and [React Leaflet](https://react-leaflet.js.org/).
- **Global Map Coverage**: Uses [LocationIQ](https://locationiq.com/) for high-quality global map tiles.
- **Location Search**: Integrated with LocationIQ Search API for robust real-time geocoding.
- **Pin Location**: Click anywhere on the map to drop a pin and retrieve its real-world address via reverse geocoding.
- **Nearby Locations**: Discover points of interest (malls, shops, residential areas) surrounding any pinned point.
- **Predefined Locations**: Quick access to a curated list of VOX Cinemas across the UAE.
- **Auto-Zoom & Center**: The map automatically adjusts its bounds to display all selected locations.
- **Security**: Utilizes HTTP Referrer restrictions via LocationIQ for secure frontend-only deployments.

##  Tech Stack

- **Frontend**: React.js
- **Mapping**: Leaflet, React Leaflet
- **HTTP Client**: Axios
- **API Provider**: LocationIQ (Tiles, Geocoding, Reverse Geocoding)

##  Setup & Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root directory and add your LocationIQ API key:
   ```env
   REACT_APP_LOCATIONIQ_KEY=your_access_token_here
   ```

3. **Domain Whitelisting (Optional but Recommended)**:
   In your LocationIQ dashboard, add your domain (e.g., `http://localhost:3000/*`) to the HTTP Referrer list for your API token to keep it secure.

4. **Start the development server**:
   ```bash
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
│       ├── NearbyLocations.js# Displays list of nearby POIs
│       ├── MapWidget.css     # Styling for the map component
│       └── MapWidget.js      # Main map orchestration component
├── App.js                    # Entry point
└── index.js                  # React DOM rendering
```

## Functionalities

### Searching
Type a location in the search bar and click **Search**. The application will find the best match and center the map on it.

### Pinning Locations
Click anywhere on the map to drop a custom pin. The application will instantly fetch the English address using reverse geocoding and display a list of nearby commercial and residential locations in the side panel.

### Predefined Locations
Use the multi-select dropdown to pick one or more VOX Cinema locations. The map will dynamically zoom to fit all selected markers.

### Clearing
Click the **Clear Selection** button to reset the search input, remove pinned locations, and revert the map to showing default cinema locations.
