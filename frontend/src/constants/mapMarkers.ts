import type { google } from '@googlemaps/js-api-loader'

export const MAP_MARKERS = {
  USER_LOCATION: {
    path: 2, // google.maps.SymbolPath.CIRCLE will be set at runtime
    scale: 15,
    fillColor: '#4285F4',
    fillOpacity: 1,
    strokeColor: 'white',
    strokeWeight: 2
  },
  PICKUP: {
    path: 2,
    scale: 12,
    fillColor: '#4CAF50', // Green
    fillOpacity: 1,
    strokeColor: 'white',
    strokeWeight: 2
  },
  PICKUP_COMPLETED: {
    path: 2,
    scale: 12,
    fillColor: '#4CAF50',
    fillOpacity: 1,
    strokeColor: '#FFC107', // Yellow outline
    strokeWeight: 5
  },
  DELIVERY: {
    path: 2,
    scale: 12,
    fillColor: '#F44336', // Red
    fillOpacity: 1,
    strokeColor: 'white',
    strokeWeight: 2
  },
  DELIVERY_COMPLETED: {
    path: 2,
    scale: 12,
    fillColor: '#F44336',
    fillOpacity: 1,
    strokeColor: '#FFC107', // Yellow outline
    strokeWeight: 5
  }
}

export const getMarkerIcon = (location: any, google: any) => {
  const isCompleted = location.type === 'DELIVERY' && location.status === 'DELIVERED' || location.type === 'PICKUP' && location.status === 'PICKED_UP'
  
  if (location.type === 'PICKUP') {
    return {
      ...MAP_MARKERS[isCompleted ? 'PICKUP_COMPLETED' : 'PICKUP'],
      path: google.maps.SymbolPath.CIRCLE
    }
  } else {
    return {
      ...MAP_MARKERS[isCompleted ? 'DELIVERY_COMPLETED' : 'DELIVERY'],
      path: google.maps.SymbolPath.CIRCLE
    }
  }
} 