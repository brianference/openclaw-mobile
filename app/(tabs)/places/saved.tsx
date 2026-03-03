/**
 * Saved Places Screen
 * US-022 Implementation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Place } from '@/src/types/places';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SavedPlacesScreen() {
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSavedPlaces();
  }, []);

  const loadSavedPlaces = async () => {
    try {
      const saved = await AsyncStorage.getItem('saved_places');
      if (saved) {
        const places: Place[] = JSON.parse(saved);
        // Filter only favorited places
        const favorited = places.filter((p) => p.isFavorite);
        setSavedPlaces(favorited);
      }
    } catch (error) {
      console.error('Error loading saved places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (placeId: string) => {
    Alert.alert(
      'Remove Place',
      'Remove this place from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const saved = await AsyncStorage.getItem('saved_places');
              if (saved) {
                let places: Place[] = JSON.parse(saved);
                places = places.filter((p) => p.id !== placeId);
                await AsyncStorage.setItem('saved_places', JSON.stringify(places));
                setSavedPlaces(places.filter((p) => p.isFavorite));
              }
            } catch (error) {
              console.error('Error removing place:', error);
            }
          },
        },
      ]
    );
  };

  const renderPlaceCard = ({ item }: { item: Place }) => (
    <TouchableOpacity
      style={styles.placeCard}
      onPress={() => router.push(`/places/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.distance?.toFixed(1)} miles away`}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.placeName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.placeAddress} numberOfLines={1}>
            📍 {item.address}
          </Text>
          {item.googleRating && (
            <Text style={styles.placeRating}>
              ⭐ {item.googleRating.toFixed(1)}
              {item.reviewCount && ` (${item.reviewCount})`}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(item.id)}
          accessibilityRole="button"
          accessibilityLabel="Remove from saved places"
        >
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Saved Places</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* List */}
      {savedPlaces.length > 0 ? (
        <FlatList
          data={savedPlaces}
          renderItem={renderPlaceCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>⭐</Text>
          <Text style={styles.emptyTitle}>No saved places yet</Text>
          <Text style={styles.emptySubtitle}>
            Save places to quickly access them later
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
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
  },
  backText: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
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
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  placeAddress: {
    fontSize: 14,
    color: '#737373',
  },
  placeRating: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  removeButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1a1a1a',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  removeText: {
    fontSize: 20,
    color: '#ef4444',
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
