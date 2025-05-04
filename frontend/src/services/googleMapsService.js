// Import Google Maps loader
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY } from '../../.secrets';

let googleMapsInstance = null;
let placesService = null;
let geocoder = null;

// Initialize Google Maps
export const initGoogleMaps = async () => {
  if (googleMapsInstance) return googleMapsInstance;
  
  const loader = new Loader({
    apiKey: GOOGLE_MAPS_API_KEY,
    version: 'weekly',
    libraries: ['places', 'geometry']
  });
  
  try {
    const google = await loader.load();
    googleMapsInstance = google;
    return google;
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw error;
  }
};

// Get place predictions for an address input
export const getPlacePredictions = async (input) => {
  const google = await initGoogleMaps();
  
  return new Promise((resolve, reject) => {
    if (!placesService) {
      // We need a map element to create the PlacesService
      const dummyElement = document.createElement('div');
      const map = new google.maps.Map(dummyElement);
      placesService = new google.maps.places.PlacesService(map);
    }
    
    const autocompleteService = new google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions({ 
      input,
      componentRestrictions: { country: 'ca' }, // Restrict to Canada
      types: ['address']
    }, (predictions, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        reject(status);
        return;
      }
      resolve(predictions);
    });
  });
};

// Get place details (full address) from place ID
export const getPlaceDetails = async (placeId) => {
  const google = await initGoogleMaps();
  
  return new Promise((resolve, reject) => {
    if (!placesService) {
      const dummyElement = document.createElement('div');
      const map = new google.maps.Map(dummyElement);
      placesService = new google.maps.places.PlacesService(map);
    }
    
    placesService.getDetails({ placeId }, (place, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        reject(status);
        return;
      }
      resolve(place);
    });
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