/**
 * Trip Detail Screen - Itinerary view with places organized by day
 * US-030 Implementation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Trip, Place } from '@/src/types/places';
import { TripService } from '@/src/services/trip.service';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [placesByDay, setPlacesByDay] = useState<Map<string, Place[]>>(new Map());
  const router = useRouter();

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    try {
      setIsLoading(true);
      const tripData = await TripService.getTripById(id as string);
      if (!tripData) {
        Alert.alert('Error', 'Trip not found');
        router.back();
        return;
      }
      
      setTrip(tripData);
      const organized = TripService.organizePlacesByDay(tripData);
      setPlacesByDay(organized);
    } catch (error) {
      console.error('Error loading trip:', error);
      Alert.alert('Error', 'Failed to load trip');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareTrip = async () => {
    if (!trip) return;

    try {
      const tripJson = await TripService.exportTrip(trip.id);
      await Share.share({
        message: `Check out my trip: ${trip.name}\n\n${tripJson}`,
        title: trip.name,
      });
    } catch (error) {
      console.error('Error sharing trip:', error);
      Alert.alert('Error', 'Failed to share trip');
    }
  };

  const handleRemovePlace = async (placeId: string) => {
    if (!trip) return;

    Alert.alert(
      'Remove Place',
      'Remove this place from the trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await TripService.removePlaceFromTrip(trip.id, placeId);
              loadTrip();
            } catch (error) {
              console.error('Error removing place:', error);
              Alert.alert('Error', 'Failed to remove place');
            }
          },
        },
      ]
    );
  };

  const handleGetDirections = (place: Place) => {
    if (place.directionsUrl) {
      Linking.openURL(place.directionsUrl);
    }
  };

  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderPlace = (place: Place, index: number) => (
    <View key={place.id} style={styles.placeCard}>
      <View style={styles.placeHeader}>
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeAddress}>{place.address}</Text>
          {place.distance && (
            <Text style={styles.placeDistance}>{place.distance.toFixed(1)} mi</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemovePlace(place.id)}
          accessible={true}
          accessibilityLabel={`Remove ${place.name}`}
          accessibilityRole="button"
        >
          <Ionicons name="close-circle" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.placeActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleGetDirections(place)}
          accessible={true}
          accessibilityLabel={`Get directions to ${place.name}`}
          accessibilityRole="button"
        >
          <Ionicons name="navigate" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>

        {place.phone && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Linking.openURL(`tel:${place.phone}`)}
            accessible={true}
            accessibilityLabel={`Call ${place.name}`}
            accessibilityRole="button"
          >
            <Ionicons name="call" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}

        {place.website && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Linking.openURL(place.website!)}
            accessible={true}
            accessibilityLabel={`Visit website of ${place.name}`}
            accessibilityRole="button"
          >
            <Ionicons name="globe" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderDaySection = (dayKey: string, places: Place[]) => {
    if (places.length === 0) return null;

    return (
      <View key={dayKey} style={styles.daySection}>
        <View style={styles.daySectionHeader}>
          <Text style={styles.dayLabel}>{formatDay(dayKey)}</Text>
          <Text style={styles.dayPlaceCount}>
            {places.length} {places.length === 1 ? 'place' : 'places'}
          </Text>
        </View>
        {places.map((place, index) => renderPlace(place, index))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Trip not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.tripName}>{trip.name}</Text>
          <Text style={styles.tripDates}>
            {new Date(trip.startDate).toLocaleDateString()}
            {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString()}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareTrip}
          accessible={true}
          accessibilityLabel="Share trip"
          accessibilityRole="button"
        >
          <Ionicons name="share-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {trip.places.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#999" />
            <Text style={styles.emptyText}>No places in this trip yet</Text>
            <Text style={styles.emptySubtext}>Search for places and add them to your trip</Text>
            <TouchableOpacity
              style={styles.addPlacesButton}
              onPress={() => router.push('/places')}
              accessible={true}
              accessibilityLabel="Search for places"
              accessibilityRole="button"
            >
              <Text style={styles.addPlacesButtonText}>Search Places</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Array.from(placesByDay.entries()).map(([dayKey, places]) =>
            renderDaySection(dayKey, places)
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  tripName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  tripDates: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  shareButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  addPlacesButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    minHeight: 44,
  },
  addPlacesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  daySection: {
    marginBottom: 24,
  },
  daySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  dayPlaceCount: {
    fontSize: 14,
    color: '#666',
  },
  placeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  placeDistance: {
    fontSize: 12,
    color: '#999',
  },
  removeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    minHeight: 44,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
