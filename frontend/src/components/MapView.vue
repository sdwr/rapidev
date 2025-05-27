<template>
  <div class="map-container" :class="{ 'inline-map': size === 'inline' }">
    <div id="map" ref="mapRef"></div>
    <div class="map-overlay" v-if="loading">
      <div class="spinner"></div>
    </div>
    <div v-if="estimatedTime" class="estimated-time">
      {{ formatDriveTime(estimatedTime) }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { initGoogleMaps, geocodeAddress } from '../services/googleMapsService';
import { MAP_MARKERS, getMarkerIcon } from '../constants/mapMarkers';

const props = defineProps({
  locations: {
    type: Array,
    default: () => [],
    // Expected format: [{ address: 'Full address', type: 'PICKUP'|'DELIVERY' }]
  },
  zoom: {
    type: Number,
    default: 12
  },
  nextLocation: {
    type: Object,
    default: null
    // Expected format: { address: 'Full address', type: 'PICKUP'|'DELIVERY' }
  },
  size: {
    type: String,
    default: 'fullscreen', // or 'inline'
  },
  showControls: {
    type: Boolean,
    default: true
  }
});

const mapRef = ref(null);
const map = ref(null);
const markers = ref([]);
const userLocationMarker = ref(null);
const directionsRenderer = ref(null);
const currentPosition = ref(null);
const center = ref({ lat: 49.8893, lng: -97.1604 });
const loading = ref(true);
const locationWatchId = ref(null);
const locationUpdateInterval = ref(null);
const estimatedTime = ref(null);

// Initialize map on component mount
onMounted(async () => {
  try {
    const google = await initGoogleMaps();
    
    map.value = new google.maps.Map(mapRef.value, {
      center: center.value,
      zoom: props.zoom,
      // Disable controls when in inline mode
      mapTypeControl: props.size === 'fullscreen',
      streetViewControl: props.size === 'fullscreen',
      fullscreenControl: props.size === 'fullscreen',
      zoomControl: props.size === 'fullscreen',
      // Disable scrolling/dragging in inline mode
      gestureHandling: props.size === 'fullscreen' ? 'auto' : 'none',
      // Disable keyboard shortcuts in inline mode
      keyboardShortcuts: props.size === 'fullscreen',
      // Disable clickable POIs in inline mode
      clickableIcons: props.size === 'fullscreen'
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

    if(props.locations.length === 2) {
      await calculateRoute(props.locations[0].address, props.locations[1].address);
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
      handlePositionUpdateFirstTime,
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

const handlePositionUpdateFirstTime = async (position) => {
  await handlePositionUpdate(position);
  const { latitude, longitude } = position.coords;
  center.value = { lat: latitude, lng: longitude };
}
// Handle successful position update
const handlePositionUpdate = async (position) => {
  const { latitude, longitude } = position.coords;
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
    // Create new marker using constants
    userLocationMarker.value = new google.maps.Marker({
      position: currentPosition.value,
      map: map.value,
      title: 'Your Location',
      icon: {
        ...MAP_MARKERS.USER_LOCATION,
        path: google.maps.SymbolPath.CIRCLE
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
    
    // If we have both pickup and delivery locations, calculate route
    if (newLocations.length === 2) {
      await calculateRoute(newLocations[0].address, newLocations[1].address);
    }
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
      const position = await geocodeAddress(location.address);
      
      // Create marker using the helper function
      const marker = new google.maps.Marker({
        position,
        map: map.value,
        title: location.address,
        icon: getMarkerIcon(location, google)
      });
      
      // Create info window with custom content
      const createInfoWindowContent = (location) => {
        const div = document.createElement('div');
        div.className = 'map-info-window';
        
        // Header with type and close button
        const header = document.createElement('div');
        header.className = 'info-window-header';
        
        const title = document.createElement('strong');
        title.textContent = location.type === 'PICKUP' ? 'Pickup Location' : 'Delivery Location';
        header.appendChild(title);
        
        div.appendChild(header);
        
        // Address and status
        const addressDiv = document.createElement('div');
        addressDiv.className = 'info-window-address';
        addressDiv.textContent = location.address;
        div.appendChild(addressDiv);
        
        if (location.status) {
          const statusDiv = document.createElement('div');
          statusDiv.className = 'info-window-status';
          statusDiv.textContent = `Status: ${location.status}`;
          div.appendChild(statusDiv);
        }
        
        // Action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'info-window-actions';
        
        // Set Destination button
        const setDestBtn = document.createElement('button');
        setDestBtn.textContent = 'Set Destination';
        setDestBtn.className = 'info-window-button set-destination-btn';
        setDestBtn.onclick = (e) => {
          e.stopPropagation();
          handleSetDestination(location);
        };
        actionsDiv.appendChild(setDestBtn);
        
        // Add status-specific buttons
        if (location.type === 'PICKUP' && location.status === 'CONFIRMED_BY_COURIER' || location.status === 'ACCEPTED') {
          const pickupBtn = document.createElement('button');
          pickupBtn.textContent = 'Mark Picked Up';
          pickupBtn.className = 'info-window-button pickup-btn';
          pickupBtn.onclick = (e) => {
            e.stopPropagation();
            handlePickup(location);
          };
          actionsDiv.appendChild(pickupBtn);
        }
        
        if (location.type === 'DELIVERY' && location.status === 'PICKED_UP') {
          const deliverBtn = document.createElement('button');
          deliverBtn.textContent = 'Mark Delivered';
          deliverBtn.className = 'info-window-button deliver-btn';
          deliverBtn.onclick = (e) => {
            e.stopPropagation();
            handleDelivery(location);
          };
          actionsDiv.appendChild(deliverBtn);
        }
        
        // Report Problem button
        const reportBtn = document.createElement('button');
        reportBtn.textContent = 'Report Problem';
        reportBtn.className = 'info-window-button report-btn';
        reportBtn.onclick = (e) => {
          e.stopPropagation();
          handleReportProblem(location);
        };
        actionsDiv.appendChild(reportBtn);
        
        div.appendChild(actionsDiv);
        
        return div;
      };
      
      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(location)
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
      console.error('Error creating marker:', error);
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

// Handle setting a location as the destination
const handleSetDestination = (location) => {
  emit('setDestination', location);
};

// Handle marking a package as picked up
const handlePickup = (location) => {
  emit('markPickedUp', location);
};

// Handle marking a package as delivered
const handleDelivery = (location) => {
  emit('markDelivered', location);
};

// Handle reporting a problem with a location
const handleReportProblem = (location) => {
  emit('reportProblem', location);
};

// Don't forget to define the emits
const emit = defineEmits(['setDestination', 'markPickedUp', 'markDelivered', 'reportProblem', 'routeUpdated']);

// Modify calculateRoute to handle geocoding
const calculateRoute = async (origin, destination) => {
  if (!map.value || !origin || !destination) return;
  
  const google = await initGoogleMaps();
  const directionsService = new google.maps.DirectionsService();
  
  try {
    // Geocode both addresses
    const originPosition = await geocodeAddress(origin);
    const destinationPosition = await geocodeAddress(destination);
    
    const result = await directionsService.route({
      origin: originPosition,
      destination: destinationPosition,
      travelMode: google.maps.TravelMode.DRIVING,
    });
    
    if (directionsRenderer.value) {
      directionsRenderer.value.setDirections(result);
      
      // Get estimated time and emit it
      const durationInSeconds = result.routes[0].legs[0].duration.value;
      estimatedTime.value = durationInSeconds;
      emit('routeUpdated', durationInSeconds);
    }
  } catch (error) {
    console.error('Error calculating route:', error);
  }
};

const formatDriveTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} minutes`;
};
</script>

<style>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container.inline-map {
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem 0;
  /* Prevent interaction with map in inline mode */
  pointer-events: none;
}

/* Make estimated time visible even in inline mode */
.inline-map .estimated-time {
  pointer-events: auto;
  font-size: 0.8rem;
  padding: 4px 8px;
}

.estimated-time {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

#map {
  width: 100%;
  height: 100%;
  flex: 1;
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

/* Add these styles for the InfoWindow */
.map-info-window {
  padding: 10px;
  min-width: 200px;
  max-width: 300px;
}

.info-window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-window-address {
  margin-bottom: 8px;
  font-size: 13px;
}

.info-window-status {
  margin-bottom: 12px;
  font-size: 13px;
  color: #666;
}

.info-window-actions {
  display: flex;
  flex-wrap: nowrap;
  gap: 5px;
  margin-top: 10px;
}

.info-window-button {
  padding: 5px 8px;
  min-height: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  color: white;
  background-color: #3498db;
}

.set-destination-btn {
  background-color: #3498db;
}

.pickup-btn, .deliver-btn {
  background-color: #2ecc71;
}

.report-btn {
  background-color: #e74c3c;
}

.info-window-button:hover {
  opacity: 0.9;
}
</style> 