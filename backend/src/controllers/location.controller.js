// Location Autocomplete Backend Controller

import axios from 'axios';

// Cache for backend search queries
const cache = new Map();

/**
 * GET /api/v1/location/autocomplete?input=...
 */
export const autocompleteLocation = async (req, res) => {
  try {
    const { input } = req.query;

    if (!input || input.trim().length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const query = input.trim().toLowerCase();
    if (cache.has(query)) {
      return res.status(200).json({ success: true, data: cache.get(query) });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

    let predictions = [];

    if (apiKey) {
      // Primary: Google Places API Web Service
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&key=${apiKey}`;
        const response = await axios.get(url, { timeout: 4000 });
        if (response.data && response.data.status === 'OK') {
          predictions = response.data.predictions.map((p) => ({
            placeId: p.place_id,
            description: p.description,
            title: p.structured_formatting?.main_text || p.description,
            subtitle: p.structured_formatting?.secondary_text || '',
          }));
        }
      } catch (gErr) {
        console.warn('Google Places API call failed in backend:', gErr.message);
      }
    }

    // Secondary Fallback: OpenStreetMap Nominatim API for India
    if (predictions.length === 0) {
      try {
        const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&addressdetails=1&limit=10`;
        const osmRes = await axios.get(osmUrl, {
          headers: { 'User-Agent': 'MedCred-App/1.0' },
          timeout: 4000
        });

        if (osmRes.data && Array.isArray(osmRes.data)) {
          predictions = osmRes.data.map((item) => {
            const addr = item.address || {};
            const state = addr.state || '';
            const district = addr.state_district || addr.county || '';
            const city = addr.city || addr.town || addr.village || addr.suburb || '';

            return {
              placeId: item.place_id,
              description: item.display_name,
              title: city || district || state || item.display_name,
              subtitle: [district, state, 'India'].filter(Boolean).join(', '),
              normalized: {
                state,
                district,
                city,
                subDistrict: addr.subdistrict || '',
                village: addr.village || '',
                postalCode: addr.postcode || '',
                country: addr.country || 'India',
                latitude: item.lat ? parseFloat(item.lat) : null,
                longitude: item.lon ? parseFloat(item.lon) : null,
                formattedAddress: item.display_name
              }
            };
          });
        }
      } catch (osmErr) {
        console.warn('Nominatim fallback failed:', osmErr.message);
      }
    }

    cache.set(query, predictions);
    return res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    console.error('Autocomplete Location Controller Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch location autocomplete' });
  }
};
