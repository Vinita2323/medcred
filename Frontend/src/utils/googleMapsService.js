// Google Maps & Places Service Utility

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let googleMapsPromise = null;
let autocompleteService = null;
let placesServiceInstance = null;
let dummyDiv = null;

// Initialize Google Maps JavaScript API SDK
export const loadGoogleMaps = () => {
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve(window.google);
      return;
    }

    if (!API_KEY) {
      console.warn('Google Maps API key missing in VITE_GOOGLE_MAPS_API_KEY');
      reject(new Error('Google Maps API Key missing'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = (err) => {
      console.error('Failed to load Google Maps script', err);
      reject(err);
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// Create a Google Places Autocomplete Session Token to group queries efficiently
export const createSessionToken = async () => {
  try {
    const google = await loadGoogleMaps();
    return new google.maps.places.AutocompleteSessionToken();
  } catch (err) {
    return null;
  }
};

// Fetch Autocomplete Predictions for Indian Locations
export const fetchPlacePredictions = async (input, sessionToken = null, types = null) => {
  if (!input || input.trim().length === 0) return [];
  
  try {
    const google = await loadGoogleMaps();
    if (!autocompleteService) {
      autocompleteService = new google.maps.places.AutocompleteService();
    }

    const request = {
      input: input.trim(),
      componentRestrictions: { country: 'in' },
    };

    if (sessionToken) {
      request.sessionToken = sessionToken;
    }
    if (types && Array.isArray(types)) {
      request.types = types;
    }

    return new Promise((resolve) => {
      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          resolve([]);
        }
      });
    });
  } catch (err) {
    console.error('fetchPlacePredictions error:', err);
    return [];
  }
};

// Fetch Place Details by Place ID and return Normalized Location Object
export const getNormalizedPlaceDetails = async (placeId, sessionToken = null) => {
  if (!placeId) return null;

  try {
    const google = await loadGoogleMaps();
    if (!placesServiceInstance) {
      if (!dummyDiv) dummyDiv = document.createElement('div');
      placesServiceInstance = new google.maps.places.PlacesService(dummyDiv);
    }

    const request = {
      placeId,
      fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id'],
    };
    if (sessionToken) {
      request.sessionToken = sessionToken;
    }

    return new Promise((resolve) => {
      placesServiceInstance.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const normalized = parseNormalizedAddressComponents(place);
          resolve(normalized);
        } else {
          resolve(null);
        }
      });
    });
  } catch (err) {
    console.error('getNormalizedPlaceDetails error:', err);
    return null;
  }
};

// Normalize Google Place Object into standard schema
export const parseNormalizedAddressComponents = (place) => {
  const normalized = {
    state: '',
    district: '',
    city: '',
    subDistrict: '',
    village: '',
    postalCode: '',
    country: 'India',
    latitude: place.geometry?.location ? place.geometry.location.lat() : null,
    longitude: place.geometry?.location ? place.geometry.location.lng() : null,
    formattedAddress: place.formatted_address || place.name || '',
    houseNo: '',
    street: '',
    area: '',
    landmark: '',
  };

  if (!place || !place.address_components) return normalized;

  for (const comp of place.address_components) {
    const types = comp.types;

    if (types.includes('street_number')) {
      normalized.houseNo = comp.long_name;
    } else if (types.includes('route') || types.includes('sublocality_level_2')) {
      if (!normalized.street) normalized.street = comp.long_name;
      else normalized.street += `, ${comp.long_name}`;
    } else if (types.includes('sublocality_level_1') || types.includes('neighborhood') || types.includes('sublocality')) {
      normalized.area = comp.long_name;
    } else if (types.includes('landmark')) {
      normalized.landmark = comp.long_name;
    } else if (types.includes('locality')) {
      normalized.city = comp.long_name;
    } else if (types.includes('administrative_area_level_3')) {
      normalized.subDistrict = comp.long_name.replace(/ Tehsil| Sub-District| Taluka/i, '');
    } else if (types.includes('administrative_area_level_2')) {
      normalized.district = comp.long_name.replace(/ District/i, '');
    } else if (types.includes('administrative_area_level_1')) {
      normalized.state = comp.long_name;
    } else if (types.includes('postal_code')) {
      normalized.postalCode = comp.long_name;
    } else if (types.includes('country')) {
      normalized.country = comp.long_name;
    }
  }

  // Fallbacks for city / subDistrict / district alignment
  if (!normalized.city && normalized.subDistrict) {
    normalized.city = normalized.subDistrict;
  }
  if (!normalized.city && normalized.district) {
    normalized.city = normalized.district;
  }
  if (!normalized.district && normalized.city) {
    normalized.district = normalized.city;
  }

  return normalized;
};

// Legacy compatibility export
export const parseAddressComponents = (place) => {
  const norm = parseNormalizedAddressComponents(place);
  return {
    ...norm,
    pincode: norm.postalCode,
    fullAddress: norm.formattedAddress,
  };
};
