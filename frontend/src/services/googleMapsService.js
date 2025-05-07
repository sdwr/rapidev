// Import Google Maps loader
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY } from '../../.secrets';

// Create a single loader instance to use across the application
const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'geometry'] // Remove 'maps' - it's not needed as a separate library
});

let googleMapsInstance = null;
let placesService = null;
let geocoder = null;
let sessionToken = null;

// Initialize Google Maps
export const initGoogleMaps = async () => {
  if (googleMapsInstance) return googleMapsInstance;
  
  try {
    const google = await loader.load();
    googleMapsInstance = google;
    
    // Initialize session token
    if (google.maps.places.AutocompleteSessionToken) {
      sessionToken = new google.maps.places.AutocompleteSessionToken();
    }
    
    return google;
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw error;
  }
};

// Create a new session token
const createNewSession = () => {
  if (googleMapsInstance && googleMapsInstance.maps.places.AutocompleteSessionToken) {
    sessionToken = new googleMapsInstance.maps.places.AutocompleteSessionToken();
  }
};

// Get place predictions for an address input (fallback to legacy method)
export const getPlacePredictions = async (input) => {
  const google = await initGoogleMaps();
  
  // Create a new session token if we don't have one and it's available
  if (!sessionToken && google.maps.places.AutocompleteSessionToken) {
    sessionToken = new google.maps.places.AutocompleteSessionToken();
  }
  
  // Use the legacy API method which is more widely supported
  return new Promise((resolve, reject) => {
    try {
      const autocompleteService = new google.maps.places.AutocompleteService();
      const winnipegCenter = { lat: 49.8954, lng: -97.1385 }
      autocompleteService.getPlacePredictions({ 
        input,
        locationRestriction: {
          west: winnipegCenter.lng - 0.5,
          east: winnipegCenter.lng + 0.5,
          north: winnipegCenter.lat + 0.5,
          south: winnipegCenter.lat - 0.5
        },
        componentRestrictions: { country: 'ca' },
        types: ['address'],
        sessionToken: sessionToken // Add session token if available
      }, (predictions, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          reject(status);
          return;
        }
        resolve(predictions);
      });
    } catch (error) {
      console.error('Error in getPlacePredictions:', error);
      reject(error);
    }
  });
};

// Get place details (full address) from place ID (fallback to legacy method)
export const getPlaceDetails = async (placeId) => {
  const google = await initGoogleMaps();
  
  return new Promise((resolve, reject) => {
    try {
      if (!placesService) {
        const dummyElement = document.createElement('div');
        const map = new google.maps.Map(dummyElement);
        placesService = new google.maps.places.PlacesService(map);
      }
      
      placesService.getDetails({
        placeId,
        sessionToken, // Include session token if available
        fields: ['formatted_address', 'name', 'geometry', 'address_components']
      }, (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          reject(status);
          return;
        }
        
        // Create a new session for next search if token is supported
        if (google.maps.places.AutocompleteSessionToken) {
          createNewSession();
        }
        
        resolve(place);
      });
    } catch (error) {
      console.error('Error in getPlaceDetails:', error);
      reject(error);
    }
  });
};

// Geocode address to get lat/lng
export const geocodeAddress = async (address) => {
  const google = await initGoogleMaps();
  
  if (!geocoder) {
    geocoder = new google.maps.Geocoder();
  }
  
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status !== 'OK') {
        reject(status);
        return;
      }
      resolve(results[0].geometry.location);
    });
  });
}; 