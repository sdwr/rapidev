<template>
  <div class="map-container">
    <div id="map" ref="mapRef"></div>
    <div class="map-overlay" v-if="loading">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { initGoogleMaps, geocodeAddress } from '../services/googleMapsService';

const props = defineProps({
  locations: {
    type: Array,
    default: () => [],
    // Expected format: [{ address: 'Full address', type: 'PICKUP'|'DELIVERY' }]
  },
  center: {
    type: Object,
    default: () => ({ lat: 43.6532, lng: -79.3832 }) // Default to Toronto
  },
  zoom: {
    type: Number,
    default: 12
  },
  nextLocation: {
    type: Object,
    default: null
    // Expected format: { address: 'Full address', type: 'PICKUP'|'DELIVERY' }
  }
});

const mapRef = ref(null);
const map = ref(null);
const markers = ref([]);
const userLocationMarker = ref(null);
const directionsRenderer = ref(null);
const currentPosition = ref(null);
const loading = ref(true);
const locationWatchId = ref(null);
const locationUpdateInterval = ref(null);

// Initialize map on component mount
onMounted(async () => {
  try {
    const google = await initGoogleMaps();
    
    map.value = new google.maps.Map(mapRef.value, {
      center: props.center,
      zoom: props.zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true
    });
    
    // Initialize directions renderer
    directionsRenderer.value = new google.maps.DirectionsRenderer({
      map: map.value,
      suppressMarkers: true, // We'll handle markers ourselves
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    });
    
    // Start tracking user location
    startLocationTracking();
    
    if (props.locations.length > 0) {
      await addLocationsToMap();
    }
    
    loading.value = false;
  } catch (error) {
    console.error('Error initializing map:', error);
    loading.value = false;
  }
});

// Start tracking user's location
const startLocationTracking = () => {
  if ('geolocation' in navigator) {
    // Get initial position
    navigator.geolocation.getCurrentPosition(
      handlePositionUpdate,
      handlePositionError,
      { enableHighAccuracy: true }
    );
    
    // Set up continuous tracking
    locationWatchId.value = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      { enableHighAccuracy: true }
    );
    
    // Set up interval to force updates every 60 seconds
    locationUpdateInterval.value = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        handlePositionUpdate,
        handlePositionError,
        { enableHighAccuracy: true }
      );
    }, 60000); // 60 seconds
  } else {
    console.warn('Geolocation is not available in this browser');
  }
};

// Handle successful position update
const handlePositionUpdate = async (position) => {
  const { latitude, longitude } = position.coords;
  console.log('handlePositionUpdate', latitude, longitude);
  currentPosition.value = { lat: latitude, lng: longitude };
  
  await updateUserLocationMarker();
  
  // If we have a next location, update the route
  if (props.nextLocation) {
    await updateRoute();
  }
};

// Handle position error
const handlePositionError = (error) => {
  console.error('Error getting user location:', error.message);
};

// Update user location marker
const updateUserLocationMarker = async () => {
  if (!map.value || !currentPosition.value) return;
  
  const google = await initGoogleMaps();
  
  // If marker already exists, just update its position
  if (userLocationMarker.value) {
    userLocationMarker.value.setPosition(currentPosition.value);
  } else {
    // Create new marker
    userLocationMarker.value = new google.maps.Marker({
      position: currentPosition.value,
      map: map.value,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2
      }
    });
  }
};

// Update the route between current location and next destination
const updateRoute = async () => {
  if (!map.value || !currentPosition.value || !props.nextLocation || !props.nextLocation.address) return;
  
  try {
    const google = await initGoogleMaps();
    const directionsService = new google.maps.DirectionsService();
    
    // Geocode the next location address
    const destinationPosition = await geocodeAddress(props.nextLocation.address);
    
    // Request directions
    const request = {
      origin: currentPosition.value,
      destination: destinationPosition,
      travelMode: google.maps.TravelMode.DRIVING
    };
    
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.value.setDirections(result);
      } else {
        console.error('Directions request failed:', status);
      }
    });
  } catch (error) {
    console.error('Error updating route:', error);
  }
};

// Watch for changes in locations
watch(() => props.locations, async (newLocations) => {
  if (map.value && newLocations.length > 0) {
    // Clear existing markers (except user location)
    clearMarkers();
    // Add new markers
    await addLocationsToMap();
  }
}, { deep: true });

// Watch for changes in nextLocation
watch(() => props.nextLocation, async (newLocation) => {
  if (map.value && currentPosition.value && newLocation) {
    await updateRoute();
  }
});

// Add locations to the map
const addLocationsToMap = async () => {
  if (!map.value) return;
  
  const google = await initGoogleMaps();
  const bounds = new google.maps.LatLngBounds();
  
  // If we have current position, include it in bounds
  if (currentPosition.value) {
    bounds.extend(currentPosition.value);
  }
  
  // Create markers for all locations
  for (const location of props.locations) {
    try {
      // Geocode the address to get coordinates
      const position = await geocodeAddress(location.address);
      
      // Create marker
      const marker = new google.maps.Marker({
        position,
        map: map.value,
        title: location.address,
        icon: getMarkerIcon(location)
      });
      
      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `<div><strong>${location.type}</strong><br>${location.address}<br>${location.status?.status || ''}</div>`
      });
      
      // Add click listener
      marker.addListener('click', () => {
        infoWindow.open(map.value, marker);
      });
      
      // Store marker for later reference
      markers.value.push(marker);
      
      // Extend bounds to include this position
      bounds.extend(position);
    } catch (error) {
      console.error(`Error geocoding address ${location.address}:`, error);
    }
  }
  
  // Fit map to bounds if we have any markers
  if (bounds.isEmpty() === false) {
    map.value.fitBounds(bounds);
    
    // If we only have one marker, zoom out a bit
    if (markers.value.length === 1 && !currentPosition.value) {
      const listener = google.maps.event.addListenerOnce(map.value, 'bounds_changed', () => {
        map.value.setZoom(Math.min(14, map.value.getZoom()));
      });
    }
  }
};

// Get marker icon based on location type
const getMarkerIcon = (location) => {
  return {
    url: location.type === 'PICKUP' 
      ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' 
      : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    scaledSize: { width: 32, height: 32 }
  };
};

// Clear all markers from the map (except user location)
const clearMarkers = () => {
  markers.value.forEach(marker => marker.setMap(null));
  markers.value = [];
  
  // Clear directions
  if (directionsRenderer.value) {
    directionsRenderer.value.setDirections({ routes: [] });
  }
};

// Clean up on component unmount
onUnmounted(() => {
  // Stop watching location
  if (locationWatchId.value) {
    navigator.geolocation.clearWatch(locationWatchId.value);
  }
  
  // Clear interval
  if (locationUpdateInterval.value) {
    clearInterval(locationUpdateInterval.value);
  }
  
  // Clear markers
  clearMarkers();
  if (userLocationMarker.value) {
    userLocationMarker.value.setMap(null);
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: 100%;
}

#map {
  width: 100%;
  height: 100%;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 