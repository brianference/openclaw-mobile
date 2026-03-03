/**
 * Places Screen - Map View
 * US-022 Implementation
 * 
 * Requirements:
 * - Google Maps directions link on every result
 * - Composite ranking (65% rating + 35% proximity)
 * - Distance display in miles
 * - Mobile-responsive
 * - WCAG 2.1 AA accessibility
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Place } from '@/src/types/places';
import { PlacesService } from '@/src/services/places.service';
import { useRouter } from 'expo-router';

// Quick filter categories
const QUICK_FILTERS = [
  { id: 'breakfast', label: '🍳 Breakfast', query: 'breakfast' },
  { id: 'lunch', label: '🍱 Lunch', query: 'lunch restaurant' },
  { id: 'dinner', label: '🍽️ Dinner', query: 'dinner restaurant' },
  { id: 'coffee', label: '☕ Coffee', query: 'coffee shop' },
  { id: 'grocery', label: '🛒 Grocery', query: 'grocery store' },
  { id: 'gas', label: '⛽ Gas', query: 'gas station' },
];

export default function PlacesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (err) {
      console.error('Location error:', err);
      setError('Failed to get location');
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    if (!userLocation) {
      setError('Location not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await PlacesService.searchPlaces({
        query,
        near: `${userLocation.latitude},${userLocation.longitude}`,
        num: 10,
        radius: 8000, // 5 miles
      });

      // Sort by composite score (already calculated in service)
      const sorted = results.sort((a, b) => (b.compositeScore || 0) - (a.compositeScore || 0));
      setPlaces(sorted);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search places');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFilter = (filter: typeof QUICK_FILTERS[0]) => {
    setActiveFilter(filter.id);
    setSearchQuery(filter.query);
    handleSearch(filter.query);
  };

  const handleOpenDirections = (place: Place) => {
    Linking.openURL(place.directionsUrl);
  };

  const renderPlaceCard = ({ item }: { item: Place }) => (
    <TouchableOpacity
      style={styles.placeCard}
      onPress={() => router.push(`/places/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.distance?.toFixed(1)} miles away, rated ${item.googleRating || 'not rated'}`}
    >
      {/* Place name and distance */}
      <View style={styles.placeHeader}>
        <Text style={styles.placeName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.placeDistance}>
          {item.distance?.toFixed(1)} mi
        </Text>
      </View>

      {/* Rating and status */}
      <View style={styles.placeInfo}>
        {item.googleRating && (
          <Text style={styles.placeRating}>
            ⭐ {item.googleRating.toFixed(1)}
            {item.reviewCount && ` (${item.reviewCount})`}
          </Text>
        )}
        {item.isOpenNow !== undefined && (
          <View style={[styles.statusBadge, item.isOpenNow ? styles.openBadge : styles.closedBadge]}>
            <Text style={styles.statusText}>
              {item.isOpenNow ? '🟢 Open' : '🔴 Closed'}
            </Text>
          </View>
        )}
      </View>

      {/* Address */}
      <Text style={styles.placeAddress} numberOfLines={1}>
        📍 {item.address}
      </Text>

      {/* Composite score indicator */}
      <View style={styles.scoreBar}>
        <View style={[styles.scoreFill, { width: `${(item.compositeScore || 0) * 100}%` }]} />
      </View>

      {/* Actions */}
      <View style={styles.placeActions}>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={() => handleOpenDirections(item)}
          accessibilityRole="button"
          accessibilityLabel="Get directions"
        >
          <Text style={styles.directionsText}>🗺️ Directions</Text>
        </TouchableOpacity>
        {item.phone && (
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => Linking.openURL(`tel:${item.phone}`)}
            accessibilityRole="button"
            accessibilityLabel="Call phone number"
          >
            <Text style={styles.callText}>📞 Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Places</Text>
        <TouchableOpacity
          style={styles.savedButton}
          onPress={() => router.push('/places/saved')}
          accessibilityRole="button"
          accessibilityLabel="View saved places"
        >
          <Text style={styles.savedText}>⭐ Saved</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search places..."
          placeholderTextColor="#a3a3a3"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
          returnKeyType="search"
          accessibilityLabel="Search places"
          accessibilityHint="Enter a place type or name and press search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => handleSearch(searchQuery)}
          disabled={!searchQuery.trim() || isLoading}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Quick filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {QUICK_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              activeFilter === filter.id && styles.filterChipActive,
            ]}
            onPress={() => handleQuickFilter(filter)}
            accessibilityRole="button"
            accessibilityLabel={filter.label}
            accessibilityState={{ selected: activeFilter === filter.id }}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Searching nearby places...</Text>
        </View>
      )}

      {/* Results */}
      {!isLoading && places.length > 0 && (
        <FlatList
          data={places}
          renderItem={renderPlaceCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        />
      )}

      {/* Empty state */}
      {!isLoading && places.length === 0 && !error && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🔍</Text>
          <Text style={styles.emptyTitle}>No places found</Text>
          <Text style={styles.emptySubtitle}>
            Try a different search or use a quick filter above
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  savedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  savedText: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#f5f5f5',
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 44, // WCAG touch target
  },
  filterChipActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  filterText: {
    fontSize: 14,
    color: '#f5f5f5',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ef4444',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#a3a3a3',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  placeCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    gap: 8,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  placeDistance: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
    marginLeft: 8,
  },
  placeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  placeRating: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  openBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  closedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  placeAddress: {
    fontSize: 14,
    color: '#737373',
  },
  scoreBar: {
    height: 4,
    backgroundColor: '#252525',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  placeActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  directionsButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44, // WCAG touch target
  },
  directionsText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  callButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0ea5e9',
    alignItems: 'center',
    minHeight: 44, // WCAG touch target
  },
  callText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#a3a3a3',
    textAlign: 'center',
  },
});
