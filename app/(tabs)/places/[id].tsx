/**
 * Place Detail Screen
 * US-022 Implementation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Place } from '@/src/types/places';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadPlace();
  }, [id]);

  const loadPlace = async () => {
    try {
      // Load from AsyncStorage (saved places)
      const saved = await AsyncStorage.getItem('saved_places');
      if (saved) {
        const places: Place[] = JSON.parse(saved);
        const foundPlace = places.find((p) => p.id === id);
        if (foundPlace) {
          setPlace(foundPlace);
          setIsFavorite(foundPlace.isFavorite || false);
          setNotes(foundPlace.notes || '');
        }
      }
    } catch (error) {
      console.error('Error loading place:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!place) return;

    try {
      const saved = await AsyncStorage.getItem('saved_places');
      let places: Place[] = saved ? JSON.parse(saved) : [];

      const index = places.findIndex((p) => p.id === place.id);
      const newFavoriteState = !isFavorite;

      if (index >= 0) {
        places[index] = { ...places[index], isFavorite: newFavoriteState };
      } else {
        places.push({ ...place, isFavorite: newFavoriteState });
      }

      await AsyncStorage.setItem('saved_places', JSON.stringify(places));
      setIsFavorite(newFavoriteState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleOpenDirections = () => {
    if (place) {
      Linking.openURL(place.directionsUrl);
    }
  };

  const handleCall = () => {
    if (place?.phone) {
      Linking.openURL(`tel:${place.phone}`);
    }
  };

  const handleWebsite = () => {
    if (place?.website) {
      Linking.openURL(place.website);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!place) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Place not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.headerButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={toggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Text style={styles.headerButtonText}>
            {isFavorite ? '⭐ Saved' : '☆ Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Photo */}
        {place.photoUrl && (
          <Image
            source={{ uri: place.photoUrl }}
            style={styles.photo}
            resizeMode="cover"
          />
        )}

        {/* Title and distance */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{place.name}</Text>
          {place.distance !== undefined && (
            <Text style={styles.distance}>
              {place.distance.toFixed(1)} mi away
            </Text>
          )}
        </View>

        {/* Rating and status */}
        <View style={styles.infoRow}>
          {place.googleRating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>
                ⭐ {place.googleRating.toFixed(1)}
              </Text>
              {place.reviewCount && (
                <Text style={styles.reviewCount}>
                  ({place.reviewCount} reviews)
                </Text>
              )}
            </View>
          )}
          {place.isOpenNow !== undefined && (
            <View style={[styles.statusBadge, place.isOpenNow ? styles.openBadge : styles.closedBadge]}>
              <Text style={styles.statusText}>
                {place.isOpenNow ? '🟢 Open Now' : '🔴 Closed'}
              </Text>
            </View>
          )}
        </View>

        {/* Hours */}
        {place.hours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hours</Text>
            <Text style={styles.sectionText}>{place.hours}</Text>
          </View>
        )}

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.sectionText}>📍 {place.address}</Text>
        </View>

        {/* Contact */}
        {(place.phone || place.website) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            {place.phone && (
              <Text style={styles.sectionText}>📞 {place.phone}</Text>
            )}
            {place.website && (
              <Text style={styles.sectionText} numberOfLines={1}>
                🌐 {place.website}
              </Text>
            )}
          </View>
        )}

        {/* TripAdvisor info */}
        {place.tripadvisorRating && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TripAdvisor</Text>
            <Text style={styles.sectionText}>
              ⭐ {place.tripadvisorRating.toFixed(1)} ({place.tripadvisorReviews} reviews)
            </Text>
            {place.ranking && (
              <Text style={styles.sectionText}>{place.ranking}</Text>
            )}
            {place.cuisines && place.cuisines.length > 0 && (
              <Text style={styles.sectionText}>
                {place.cuisines.join(', ')}
              </Text>
            )}
          </View>
        )}

        {/* Composite score */}
        {place.compositeScore !== undefined && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Match Score</Text>
            <View style={styles.scoreBarContainer}>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreFill, { width: `${place.compositeScore * 100}%` }]} />
              </View>
              <Text style={styles.scoreText}>
                {(place.compositeScore * 100).toFixed(0)}%
              </Text>
            </View>
            <Text style={styles.scoreDescription}>
              Based on rating (65%) and proximity (35%)
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleOpenDirections}
            accessibilityRole="button"
            accessibilityLabel="Get directions"
          >
            <Text style={styles.primaryButtonText}>🗺️ Get Directions</Text>
          </TouchableOpacity>

          {place.phone && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCall}
              accessibilityRole="button"
              accessibilityLabel="Call phone number"
            >
              <Text style={styles.secondaryButtonText}>📞 Call</Text>
            </TouchableOpacity>
          )}

          {place.website && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleWebsite}
              accessibilityRole="button"
              accessibilityLabel="Visit website"
            >
              <Text style={styles.secondaryButtonText}>🌐 Website</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 44,
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  photo: {
    width: '100%',
    height: 240,
    backgroundColor: '#1a1a1a',
  },
  titleContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  distance: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    color: '#f5f5f5',
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  openBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  closedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#252525',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#a3a3a3',
    lineHeight: 24,
  },
  scoreBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#252525',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    minWidth: 50,
    textAlign: 'right',
  },
  scoreDescription: {
    fontSize: 12,
    color: '#737373',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 14,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0ea5e9',
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});
