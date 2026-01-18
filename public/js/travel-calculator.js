// Destination coordinates (Ohio Northern University)
const DESTINATION = {
  address: '401 W College Ave, Ada, OH 45810',
  coords: [-83.8242, 40.7697] // [lng, lat] for Mapbox
};

// Airport coordinates
const AIRPORTS = {
  'DAY': { name: 'Dayton International Airport', coords: [-84.2194, 39.9024] },
  'CMH': { name: 'Port Columbus International Airport', coords: [-82.8919, 39.9980] },
  'LCK': { name: 'Rickenbacker International Airport', coords: [-82.9278, 39.8138] },
  'FWA': { name: 'Fort Wayne International Airport', coords: [-85.1951, 40.9785] }
};

// Mapbox API configuration
const MAPBOX_TOKEN = window.MAPBOX_TOKEN || '';
const MAPBOX_API = 'https://api.mapbox.com/directions/v5/mapbox/driving';

// DOM elements
let selectedAirport = null;
let customAddressInput, calculateBtn, results, error, loading;
let distanceEl, durationEl, routeTitleEl, directionsLink;
let map = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  customAddressInput = document.getElementById('custom-address');
  calculateBtn = document.getElementById('calculate-btn');
  results = document.getElementById('results');
  error = document.getElementById('error');
  loading = document.getElementById('loading');
  distanceEl = document.getElementById('distance');
  durationEl = document.getElementById('duration');
  routeTitleEl = document.getElementById('route-title');
  directionsLink = document.getElementById('directions-link');

  // Airport button handlers
  document.querySelectorAll('.airport-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAirportSelect(btn));
  });

  // Calculate button handler
  calculateBtn.addEventListener('click', handleCalculate);

  // Enter key on input
  customAddressInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleCalculate();
  });
});

function handleAirportSelect(btn) {
  // Clear previous selection
  document.querySelectorAll('.airport-btn').forEach(b => b.classList.remove('active'));

  // Set new selection
  btn.classList.add('active');
  selectedAirport = btn.dataset.airport;

  // Clear custom address
  customAddressInput.value = '';

  // Auto-calculate
  handleCalculate();
}

async function handleCalculate() {
  hideMessages();

  const customAddress = customAddressInput.value.trim();

  // Determine origin
  let origin, originName;
  if (customAddress) {
    // Use custom address - need to geocode it first
    try {
      showLoading();
      const coords = await geocodeAddress(customAddress);
      origin = coords;
      originName = customAddress;
    } catch (err) {
      showError('Could not find that address. Please check and try again.');
      return;
    }
  } else if (selectedAirport) {
    // Use selected airport
    origin = AIRPORTS[selectedAirport].coords;
    originName = AIRPORTS[selectedAirport].name;
  } else {
    showError('Please select an airport or enter a starting address.');
    return;
  }

  // Calculate route
  try {
    showLoading();
    const route = await getDirections(origin, DESTINATION.coords);
    displayResults(route, originName, origin);
  } catch (err) {
    showError('Unable to calculate route. Please try again.');
    console.error(err);
  }
}

async function geocodeAddress(address) {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured');
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Geocoding failed');

  const data = await response.json();
  if (!data.features || data.features.length === 0) {
    throw new Error('Address not found');
  }

  return data.features[0].center; // [lng, lat]
}

async function getDirections(origin, destination) {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured');
  }

  const url = `${MAPBOX_API}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?access_token=${MAPBOX_TOKEN}&geometries=geojson`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Directions API failed');

  const data = await response.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found');
  }

  return data.routes[0];
}

function initMap(origin, destination, routeGeometry) {
  // Remove existing map if any
  if (map) {
    map.remove();
  }

  // Check if mapboxgl is available
  if (typeof mapboxgl === 'undefined') {
    console.error('Mapbox GL JS not loaded');
    return;
  }

  // Initialize map with dark style
  mapboxgl.accessToken = MAPBOX_TOKEN;
  map = new mapboxgl.Map({
    container: 'route-map',
    style: 'mapbox://styles/mapbox/dark-v11', // Dark gray style
    center: destination,
    zoom: 8
  });

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl());

  // Wait for map to load
  map.on('load', () => {
    // Add route line
    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: routeGeometry
      }
    });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ea7600', // Orange route line
        'line-width': 4
      }
    });

    // Add markers
    // Origin marker (orange)
    new mapboxgl.Marker({ color: '#ea7600' })
      .setLngLat(origin)
      .addTo(map);

    // Destination marker (gold)
    new mapboxgl.Marker({ color: '#f1d44b' })
      .setLngLat(destination)
      .addTo(map);

    // Fit map to show entire route
    const coordinates = routeGeometry.coordinates;
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map.fitBounds(bounds, {
      padding: 40
    });
  });
}

function displayResults(route, originName, origin) {
  hideMessages();

  // Extract route data
  const distanceKm = route.distance / 1000;
  const distanceMiles = distanceKm * 0.621371;
  const durationMinutes = route.duration / 60;
  const durationHours = Math.floor(durationMinutes / 60);
  const durationMins = Math.round(durationMinutes % 60);

  // Update UI
  routeTitleEl.textContent = `${originName} → Ada, OH`;
  distanceEl.textContent = `${distanceMiles.toFixed(1)} mi`;

  if (durationHours > 0) {
    durationEl.textContent = `${durationHours}h ${durationMins}m`;
  } else {
    durationEl.textContent = `${durationMins} min`;
  }

  // Initialize map with route
  initMap(origin, DESTINATION.coords, route.geometry);

  // Create Google Maps link
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originName)}&destination=${encodeURIComponent(DESTINATION.address)}`;
  directionsLink.href = googleMapsUrl;

  results.classList.remove('hidden');
}

function showError(message) {
  hideMessages();
  document.getElementById('error-message').textContent = message;
  error.classList.remove('hidden');
}

function showLoading() {
  hideMessages();
  loading.classList.remove('hidden');
  calculateBtn.disabled = true;
}

function hideMessages() {
  results.classList.add('hidden');
  error.classList.add('hidden');
  loading.classList.add('hidden');
  calculateBtn.disabled = false;
}
