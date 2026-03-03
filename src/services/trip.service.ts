/**
 * Trip Service - Manages trips and itineraries
 * US-030 Implementation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Place } from '../types/places';

const TRIPS_STORAGE_KEY = '@trips';

export class TripService {
  /**
   * Get all trips
   */
  static async getAllTrips(): Promise<Trip[]> {
    try {
      const tripsJson = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);
      return tripsJson ? JSON.parse(tripsJson) : [];
    } catch (error) {
      console.error('Error getting trips:', error);
      return [];
    }
  }

  /**
   * Get trip by ID
   */
  static async getTripById(id: string): Promise<Trip | null> {
    try {
      const trips = await this.getAllTrips();
      return trips.find(trip => trip.id === id) || null;
    } catch (error) {
      console.error('Error getting trip:', error);
      return null;
    }
  }

  /**
   * Create new trip
   */
  static async createTrip(name: string, startDate: string, endDate?: string): Promise<Trip> {
    try {
      const trips = await this.getAllTrips();
      const newTrip: Trip = {
        id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        startDate,
        endDate,
        places: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      trips.push(newTrip);
      await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
      return newTrip;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  }

  /**
   * Update trip
   */
  static async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip> {
    try {
      const trips = await this.getAllTrips();
      const index = trips.findIndex(trip => trip.id === id);
      
      if (index === -1) {
        throw new Error('Trip not found');
      }
      
      trips[index] = {
        ...trips[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
      return trips[index];
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  }

  /**
   * Delete trip
   */
  static async deleteTrip(id: string): Promise<void> {
    try {
      const trips = await this.getAllTrips();
      const filtered = trips.filter(trip => trip.id !== id);
      await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  }

  /**
   * Add place to trip
   */
  static async addPlaceToTrip(tripId: string, place: Place): Promise<Trip> {
    try {
      const trip = await this.getTripById(tripId);
      if (!trip) {
        throw new Error('Trip not found');
      }
      
      // Check if place already exists in trip
      const placeExists = trip.places.some(p => p.id === place.id);
      if (placeExists) {
        throw new Error('Place already in trip');
      }
      
      trip.places.push({
        ...place,
        tripId,
      });
      
      return await this.updateTrip(tripId, { places: trip.places });
    } catch (error) {
      console.error('Error adding place to trip:', error);
      throw error;
    }
  }

  /**
   * Remove place from trip
   */
  static async removePlaceFromTrip(tripId: string, placeId: string): Promise<Trip> {
    try {
      const trip = await this.getTripById(tripId);
      if (!trip) {
        throw new Error('Trip not found');
      }
      
      trip.places = trip.places.filter(p => p.id !== placeId);
      return await this.updateTrip(tripId, { places: trip.places });
    } catch (error) {
      console.error('Error removing place from trip:', error);
      throw error;
    }
  }

  /**
   * Organize places by date/category
   */
  static organizePlacesByDay(trip: Trip): Map<string, Place[]> {
    const placesByDay = new Map<string, Place[]>();
    
    if (!trip.startDate || !trip.places.length) {
      return placesByDay;
    }
    
    const startDate = new Date(trip.startDate);
    const endDate = trip.endDate ? new Date(trip.endDate) : startDate;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Initialize days
    for (let i = 0; i < days; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const dayKey = day.toISOString().split('T')[0];
      placesByDay.set(dayKey, []);
    }
    
    // Distribute places evenly across days
    trip.places.forEach((place, index) => {
      const dayIndex = index % days;
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + dayIndex);
      const dayKey = day.toISOString().split('T')[0];
      
      const dayPlaces = placesByDay.get(dayKey) || [];
      dayPlaces.push(place);
      placesByDay.set(dayKey, dayPlaces);
    });
    
    return placesByDay;
  }

  /**
   * Export trip for sharing
   */
  static async exportTrip(tripId: string): Promise<string> {
    try {
      const trip = await this.getTripById(tripId);
      if (!trip) {
        throw new Error('Trip not found');
      }
      
      return JSON.stringify(trip, null, 2);
    } catch (error) {
      console.error('Error exporting trip:', error);
      throw error;
    }
  }

  /**
   * Import trip from JSON
   */
  static async importTrip(tripJson: string): Promise<Trip> {
    try {
      const trip: Trip = JSON.parse(tripJson);
      
      // Validate trip structure
      if (!trip.name || !trip.startDate) {
        throw new Error('Invalid trip data');
      }
      
      // Create new trip with imported data
      const newTrip = await this.createTrip(trip.name, trip.startDate, trip.endDate);
      
      // Add places
      for (const place of trip.places) {
        await this.addPlaceToTrip(newTrip.id, place);
      }
      
      return newTrip;
    } catch (error) {
      console.error('Error importing trip:', error);
      throw error;
    }
  }
}
