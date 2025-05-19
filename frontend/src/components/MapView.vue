<template>
  <div class="map-container">
    <div id="map" ref="mapRef"></div>
    <div class="map-overlay" v-if="loading">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
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
  }
});

const mapRef = ref(null);
const map = ref(null);
const markers = ref([]);
const loading = ref(true);

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
    
    if (props.locations.length > 0) {
      await addLocationsToMap();
    }
    
    loading.value = false;
  } catch (error) {
    console.error('Error initializing map:', error);
    loading.value = false;
  }
});

// Watch for changes in locations
watch(() => props.locations, async (newLocations) => {
  if (map.value && newLocations.length > 0) {
    // Clear existing markers
    clearMarkers();
    // Add new markers
    await addLocationsToMap();
  }
}, { deep: true });

// Add locations to the map
const addLocationsToMap = async () => {
  if (!map.value) return;
  
  const google = await initGoogleMaps();
  const bounds = new google.maps.LatLngBounds();
  
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
        content: `<div><strong>${location.type}</strong><br>${location.address}<br>${location.status.status}</div>`
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
  if (markers.value.length > 0) {
    map.value.fitBounds(bounds);
    
    // If we only have one marker, zoom out a bit
    if (markers.value.length === 1) {
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

// Clear all markers from the map
const clearMarkers = () => {
  markers.value.forEach(marker => marker.setMap(null));
  markers.value = [];
};
</script>

<style scoped>
.map-container {
  width: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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