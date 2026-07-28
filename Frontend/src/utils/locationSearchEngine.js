// Location Search Engine (Hybrid Google Places + Intelligent Fuzzy Local Territory Search)

import { indianTerritories } from './indianTerritories';
import { fetchPlacePredictions, getNormalizedPlaceDetails, createSessionToken } from './googleMapsService';

// Simple Levenshtein distance for typo-tolerant fuzzy matching
function levenshteinDistance(a, b) {
  const matrix = [];
  const lenA = a.length;
  const lenB = b.length;

  for (let i = 0; i <= lenB; i++) matrix[i] = [i];
  for (let j = 0; j <= lenA; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[lenB][lenA];
}

// In-memory cache for search predictions
const searchCache = new Map();

/**
 * Perform local fuzzy/prefix/partial search over indianTerritories dataset.
 */
export function searchLocalTerritories(query) {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  const results = [];
  const seenKeys = new Set();

  const addResult = (state, district = '', city = '', type = 'location') => {
    const key = `${state}|${district}|${city}`.toLowerCase();
    if (seenKeys.has(key)) return;
    seenKeys.add(key);

    let title = state;
    let subtitle = 'State';
    if (city && district) {
      title = city;
      subtitle = `City, ${district}, ${state}`;
    } else if (district) {
      title = district;
      subtitle = `District, ${state}`;
    } else {
      subtitle = `State, India`;
    }

    results.push({
      isLocal: true,
      description: `${title}${district && title !== district ? `, ${district}` : ''}${state && title !== state ? `, ${state}` : ''}`,
      title,
      subtitle,
      normalized: {
        state,
        district,
        city: city || district || state,
        subDistrict: '',
        village: '',
        postalCode: '',
        country: 'India',
        latitude: null,
        longitude: null,
        formattedAddress: `${title}, ${district ? district + ', ' : ''}${state}, India`,
      }
    });
  };

  const states = Object.keys(indianTerritories);

  // 1. State matching
  for (const state of states) {
    const sLower = state.toLowerCase();
    if (sLower.startsWith(q) || sLower.includes(q) || levenshteinDistance(q, sLower) <= 2) {
      addResult(state, '', '', 'state');
    }

    const districts = Object.keys(indianTerritories[state].districts || {});
    for (const district of districts) {
      const dLower = district.toLowerCase();

      // 2. District matching
      if (dLower.startsWith(q) || dLower.includes(q) || levenshteinDistance(q, dLower) <= 2) {
        addResult(state, district, '', 'district');
      }

      const cities = indianTerritories[state].districts[district] || [];
      for (const city of cities) {
        const cLower = city.toLowerCase();

        // 3. City / Town / Tehsil matching (e.g. Huzur, Dewas, Bhopal, Indore)
        if (cLower.startsWith(q) || cLower.includes(q) || levenshteinDistance(q, cLower) <= 2) {
          addResult(state, district, city, 'city');
        }
      }
    }
  }

  // Sort by prefix match rank first
  return results.sort((a, b) => {
    const aStartsWith = a.title.toLowerCase().startsWith(q);
    const bStartsWith = b.title.toLowerCase().startsWith(q);
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    return a.title.length - b.title.length;
  });
}

/**
 * Perform intelligent hybrid search combining Google Places API + Local Territory Search.
 */
export async function searchLocationsHybrid(query, sessionToken = null) {
  if (!query || query.trim().length === 0) return [];
  const cleanQuery = query.trim();

  // Check cache
  if (searchCache.has(cleanQuery)) {
    return searchCache.get(cleanQuery);
  }

  const localMatches = searchLocalTerritories(cleanQuery);
  let googleMatches = [];

  try {
    const predictions = await fetchPlacePredictions(cleanQuery, sessionToken);
    googleMatches = predictions.map((p) => ({
      isLocal: false,
      placeId: p.place_id,
      description: p.description,
      title: p.structured_formatting?.main_text || p.description,
      subtitle: p.structured_formatting?.secondary_text || '',
    }));
  } catch (err) {
    console.warn('Google Places API call skipped/fallback to local:', err);
  }

  // Merge Google results + Local matches uniquely
  const merged = [];
  const seenDescriptions = new Set();

  for (const item of [...googleMatches, ...localMatches]) {
    const key = item.description.toLowerCase();
    if (!seenDescriptions.has(key)) {
      seenDescriptions.add(key);
      merged.push(item);
    }
  }

  // Cache top results
  searchCache.set(cleanQuery, merged);
  return merged;
}
