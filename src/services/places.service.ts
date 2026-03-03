/**
 * Places Service
 * Uses Google Places API (New) directly
 * US-022 Implementation - Requirements:
 * - Google Maps directions link on every result
 * - Composite ranking (65% rating + 35% proximity)
 * - Distance display in miles
 */

import { Place, SearchParams } from '../types/places';

// GOOGLE_PLACES_API_KEY should be in environment or secure storage
// For now using process.env, but in production should use expo-constants
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'your-api-key-here';

const PLACES_API_BASE = 'https://places.googleapis.com/v1/places';

export class PlacesService {
  /**
   * Search for places using Google Places API (New)
   * Returns results with composite ranking and directions links
   */
  static async searchPlaces(params: SearchParams): Promise<Place[]> {
    const { query, near, radius = 5000, num = 3 } = params;
    
    try {
      // First, geocode the "near" location if it's not coordinates
      const location = await this.geocodeLocation(near);
      
      // Search for places using Text Search (New)
      const searchBody = {
        textQuery: query,
        locationBias: {
          circle: {
            center: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
            radius: radius,
          },
        },
        maxResultCount: num,
        rankPreference: 'DISTANCE', // Sort by distance first
      };

      const response = await fetch(`${PLACES_API_BASE}:searchText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours,places.nationalPhoneNumber,places.websiteUri,places.photos',
        },
        body: JSON.stringify(searchBody),
      });

      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`);
      }

      const data = await response.json();
      const places = data.places || [];

      // Transform results with composite scoring
      return places.map((place: any) => 
        this.transformToPlace(place, location.latitude, location.longitude)
      );
    } catch (error) {
      console.error('Places search error:', error);
      throw error;
    }
  }

  /**
   * Geocode a location string to coordinates
   * Supports addresses, intersections, cities
   */
  private static async geocodeLocation(locationString: string): Promise<{ latitude: number; longitude: number }> {
    // Check if already coordinates (format: "lat,lng")
    if (/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(locationString.trim())) {
      const [lat, lng] = locationString.split(',').map(Number);
      return { latitude: lat, longitude: lng };
    }

    // Use Nominatim for geocoding (free, no API key needed)
    // For production, switch to Google Geocoding API if needed
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationString)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'MobileClaw/1.0',
          },
        }
      );

      const data = await response.json();
      if (data.length === 0) {
        throw new Error('Location not found');
      }

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode location');
    }
  }

  /**
   * Transform Google Places API result to Place type
   * Calculates composite score (65% rating + 35% proximity)
   */
  private static transformToPlace(
    placeData: any,
    userLat: number,
    userLng: number
  ): Place {
    const lat = placeData.location?.latitude || 0;
    const lng = placeData.location?.longitude || 0;
    const rating = placeData.rating || 0;
    const distance = this.calculateDistance(userLat, userLng, lat, lng);

    // Composite ranking: 65% rating + 35% proximity
    const ratingScore = rating / 5; // Normalize to 0-1
    const maxDistance = 10; // miles
    const proximityScore = Math.max(0, 1 - (distance / maxDistance));
    const compositeScore = (0.65 * ratingScore) + (0.35 * proximityScore);

    // Extract opening hours
    const hours = placeData.currentOpeningHours?.weekdayDescriptions?.[new Date().getDay()]
      || 'Hours not available';
    const isOpen = placeData.currentOpeningHours?.openNow ?? undefined;

    // Get photo URL if available
    const photoUrl = placeData.photos?.[0]?.name
      ? `https://places.googleapis.com/v1/${placeData.photos[0].name}/media?key=${GOOGLE_API_KEY}&maxHeightPx=400&maxWidthPx=400`
      : undefined;

    const place: Place = {
      id: placeData.id,
      name: placeData.displayName?.text || 'Unknown',
      address: placeData.formattedAddress || '',
      latitude: lat,
      longitude: lng,
      
      // Google data
      googleRating: rating,
      reviewCount: placeData.userRatingCount,
      priceLevel: placeData.priceLevel ? this.parsePriceLevel(placeData.priceLevel) : undefined,
      isOpenNow: isOpen,
      hours: hours,
      phone: placeData.nationalPhoneNumber,
      website: placeData.websiteUri,
      photoUrl: photoUrl,
      
      // Computed fields
      distance: distance,
      compositeScore: compositeScore,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    };

    return place;
  }

  /**
   * Parse Google Places price level enum to number
   */
  private static parsePriceLevel(priceLevel: string): number {
    const mapping: Record<string, number> = {
      'PRICE_LEVEL_FREE': 0,
      'PRICE_LEVEL_INEXPENSIVE': 1,
      'PRICE_LEVEL_MODERATE': 2,
      'PRICE_LEVEL_EXPENSIVE': 3,
      'PRICE_LEVEL_VERY_EXPENSIVE': 4,
    };
    return mapping[priceLevel] || 0;
  }

  /**
   * Calculate distance between two coordinates in miles
   * Using Haversine formula
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3959; // Earth radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
