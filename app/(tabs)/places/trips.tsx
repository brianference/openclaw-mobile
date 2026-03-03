/**
 * Trips Screen - List of all trips
 * US-030 Implementation
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '@/src/types/places';
import { TripService } from '@/src/services/trip.service';

export default function TripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripStartDate, setNewTripStartDate] = useState('');
  const [newTripEndDate, setNewTripEndDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      const allTrips = await TripService.getAllTrips();
      setTrips(allTrips.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading trips:', error);
      Alert.alert('Error', 'Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrip = async () => {
    if (!newTripName.trim()) {
      Alert.alert('Error', 'Please enter a trip name');
      return;
    }

    if (!newTripStartDate.trim()) {
      Alert.alert('Error', 'Please enter a start date');
      return;
    }

    try {
      await TripService.createTrip(
        newTripName.trim(),
        newTripStartDate.trim(),
        newTripEndDate.trim() || undefined
      );
      
      setShowCreateModal(false);
      setNewTripName('');
      setNewTripStartDate('');
      setNewTripEndDate('');
      loadTrips();
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'Failed to create trip');
    }
  };

  const handleDeleteTrip = (trip: Trip) => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete "${trip.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TripService.deleteTrip(trip.id);
              loadTrips();
            } catch (error) {
              console.error('Error deleting trip:', error);
              Alert.alert('Error', 'Failed to delete trip');
            }
          },
        },
      ]
    );
  };

  const formatDateRange = (trip: Trip) => {
    const start = new Date(trip.startDate).toLocaleDateString();
    if (trip.endDate) {
      const end = new Date(trip.endDate).toLocaleDateString();
      return `${start} - ${end}`;
    }
    return start;
  };

  const renderTripCard = ({ item: trip }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => router.push(`/places/trip/${trip.id}` as any)}
      accessible={true}
      accessibilityLabel={`View trip ${trip.name}`}
      accessibilityRole="button"
    >
      <View style={styles.tripCardHeader}>
        <View style={styles.tripCardInfo}>
          <Text style={styles.tripName}>{trip.name}</Text>
          <Text style={styles.tripDates}>{formatDateRange(trip)}</Text>
          <Text style={styles.tripPlaceCount}>
            {trip.places.length} {trip.places.length === 1 ? 'place' : 'places'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTrip(trip)}
          accessible={true}
          accessibilityLabel={`Delete trip ${trip.name}`}
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="map-outline" size={64} color="#666" />
      <Text style={styles.emptyText}>No trips yet</Text>
      <Text style={styles.emptySubtext}>Create your first trip to start planning</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Trips</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
          accessible={true}
          accessibilityLabel="Create new trip"
          accessibilityRole="button"
        >
          <Ionicons name="add-circle" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTripCard}
        keyExtractor={item => item.id}
        contentContainerStyle={trips.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadTrips} />
        }
      />

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Trip</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Trip name"
              value={newTripName}
              onChangeText={setNewTripName}
              accessibilityLabel="Trip name"
              autoFocus
            />

            <TextInput
              style={styles.input}
              placeholder="Start date (YYYY-MM-DD)"
              value={newTripStartDate}
              onChangeText={setNewTripStartDate}
              accessibilityLabel="Start date"
            />

            <TextInput
              style={styles.input}
              placeholder="End date (YYYY-MM-DD) - optional"
              value={newTripEndDate}
              onChangeText={setNewTripEndDate}
              accessibilityLabel="End date"
            />

            <TouchableOpacity
              style={styles.createTripButton}
              onPress={handleCreateTrip}
              accessible={true}
              accessibilityLabel="Create trip"
              accessibilityRole="button"
            >
              <Text style={styles.createTripButtonText}>Create Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  createButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  tripCard: {
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
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripCardInfo: {
    flex: 1,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tripDates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tripPlaceCount: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  createTripButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 44,
  },
  createTripButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
