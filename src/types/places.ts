/**
 * Places Feature Types
 * US-022 Implementation
 */

export interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category?: string;
  
  // Google Places data
  googleRating?: number;
  reviewCount?: number;
  priceLevel?: number; // 1-4
  isOpenNow?: boolean;
  hours?: string;
  phone?: string;
  website?: string;
  photoUrl?: string;
  
  // TripAdvisor data (restaurants)
  tripadvisorRating?: number;
  tripadvisorReviews?: number;
  ranking?: string;
  cuisines?: string[];
  topReview?: string;
  tripadvisorUrl?: string;
  
  // Computed fields
  distance?: number; // in miles
  compositeScore?: number; // 65% rating + 35% proximity
  directionsUrl: string; // Google Maps directions
  
  // User data
  notes?: string;
  isFavorite?: boolean;
  tripId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string; // ISO 8601
  endDate?: string; // ISO 8601
  places: Place[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  query: string;
  near: string; // address, intersection, city, or "lat,lng"
  radius?: number; // meters, default 5000
  num?: number; // number of results, default 3
}

export interface PlacesState {
  searchResults: Place[];
  savedPlaces: Place[];
  trips: Trip[];
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  isLoading: boolean;
  error?: string;
}
