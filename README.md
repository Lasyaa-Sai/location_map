# Transport Network Explorer

A premium React-based web application that allows users to explore transport networks and search for specific locations on an interactive map with multi-provider support.

## 🌟 Features

- **Interactive Map**: Powered by [Leaflet](https://leafletjs.com/) and [React Leaflet](https://react-leaflet.js.org/).
- **Multi-Provider Tiles**: Choose between high-quality map providers via environment configuration:
  - **Google Maps**: Premium tiles via Google's vt-service.
  - **Thunderforest**: Beautifully stylized transport and atlas tiles.
  - **LocationIQ**: Global coverage and reliable tiles.
  - **Nominatim**: Standard OpenStreetMap coverage.
- **Location Search**: Robust real-time geocoding to find any place in the world.
- **Pin Location**: Click anywhere on the map to drop a pin and retrieve its real-world address via reverse geocoding.
- **Nearby Locations**: Discover points of interest (malls, shops, residential areas) surrounding any pinned point.
- **Quick-Select Locations**: Fast access to a curated list of VOX Cinemas across the UAE.
- **Auto-Zoom & Center**: The map automatically adjusts its bounds to display all selected locations perfectly.
- **TypeScript Core**: Fully typed codebase for reliability and maintainability.

## 🛠 Tech Stack

- **Frontend**: React.js (TypeScript)
- **Mapping**: Leaflet, React Leaflet
- **HTTP Client**: Axios
- **Providers**: Google Maps SDK, Thunderforest, LocationIQ, OpenStreetMap (Nominatim)

## 🚀 Setup & Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root directory. You can switch providers by changing `REACT_APP_MAP_PROVIDER`.

   ```env
   # Available: 'google', 'thunderforest', 'locationiq', 'nominatim'
   REACT_APP_MAP_PROVIDER=google

   # Keys for your chosen provider(s)
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_api_key_here
   REACT_APP_THUNDERFOREST_API_KEY=your_thunderforest_api_key_here
   REACT_APP_LOCATIONIQ_API_KEY=your_locationiq_api_key_here
   ```

3. **Domain Whitelisting**:
   Ensure your API keys are restricted to your deployment domain (e.g., `http://localhost:3000/*`) in the respective provider dashboards.

4. **Start the development server**:
   ```bash
   npm start
   ```

## 🗺 Provider Configuration

The application is designed to be provider-agnostic. You can switch the tile layer and geocoding service simply by updating the `.env` file and restarting the app.

- **Google Maps**: Best for accuracy and detailed POI data. Uses `GoogleMutant` logic for high-performance integration.
- **Thunderforest**: Excellent for transport-focused maps and high-contrast visuals.
- **LocationIQ**: A great all-rounder for global geocoding and tiles.

## 📂 Project Structure

```text
src/
├── components/
│   └── MapWidget/
│       ├── LocationList.tsx   # Predefined locations & dropdown logic
│       ├── MapAutoZoomer.tsx  # Automatic map bounds management
│       ├── MapIcons.ts        # Custom marker icons
│       ├── NearbyLocations.tsx# Displays list of nearby POIs
│       ├── MapWidget.css      # Styling for the map component
│       └── MapWidget.tsx      # Main map orchestration component
├── services/
│   └── Maps.ts                # Abstraction layer for different map services
├── types/
│   └── mapInterface.ts        # TypeScript definitions for providers
├── config.ts                  # Centralized configuration & provider switching
└── App.tsx                    # Entry point
```

## 💡 Functionalities

### Searching
Type a location in the search bar and click **Search**. The app will use the configured provider's geocoding service to find the match.

### Pinning Locations
Click anywhere on the map to drop a pin. It will instantly fetch the address and display a list of nearby commercial and residential locations in the side panel.

### Clearing
The **Clear Selection** button resets the view, removes pins, and reverts the map to showing default locations.
