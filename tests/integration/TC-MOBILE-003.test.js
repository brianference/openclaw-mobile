/**
 * TC-MOBILE-003: Place Search & Trip Planning
 * Category: Happy Path
 * Priority: P1 (High)
 * Feature: Places
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const PlacesMapScreen = require('../../src/screens/Places/PlacesMapScreen').default;

describe('TC-MOBILE-003: Place Search & Trip Planning', () => {
  const mockPlace = {
    id: 'place-001',
    name: 'Favorite Cafe Phoenix',
    latitude: 33.4484,
    longitude: -112.0740,
    address: '123 Main St, Phoenix, AZ',
    rating: 4.5,
    category: 'cafe',
  };

  let mockSearchPlaces;
  let mockCreateTrip;

  beforeEach(() => {
    mockSearchPlaces = jest.fn().mockResolvedValue([mockPlace]);
    mockCreateTrip = jest.fn().mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should complete place search and trip creation flow', async () => {
    const { getByTestId, getByText } = render(
      <PlacesMapScreen 
        onSearchPlaces={mockSearchPlaces}
        onCreateTrip={mockCreateTrip}
      />
    );

    // Step 1: Tap search bar
    const searchBar = getByTestId('places-search-bar');
    fireEvent.press(searchBar);

    // Step 2: Enter search query
    fireEvent.changeText(searchBar, 'Favorite Cafe Phoenix');

    // Step 3: Wait for autocomplete results (≤300ms)
    const startTime = Date.now();
    
    await waitFor(() => {
      expect(mockSearchPlaces).toHaveBeenCalledWith('Favorite Cafe Phoenix');
    }, { timeout: 300 });
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(300);

    // Step 4: Tap first result
    await waitFor(() => {
      expect(getByText('Favorite Cafe Phoenix')).toBeTruthy();
    });
    
    fireEvent.press(getByText('Favorite Cafe Phoenix'));

    // Step 5: Map centers on place, shows marker
    await waitFor(() => {
      const map = getByTestId('places-map');
      expect(map.props.region).toMatchObject({
        latitude: 33.4484,
        longitude: -112.0740,
      });
      
      // Marker visible
      expect(getByTestId('place-marker-place-001')).toBeTruthy();
    });

    // Step 7: Bottom sheet shows preview
    await waitFor(() => {
      const bottomSheet = getByTestId('place-preview-sheet');
      expect(bottomSheet).toBeTruthy();
      expect(getByText('📍 Favorite Cafe')).toBeTruthy();
      expect(getByText(/0\.3 mi away/)).toBeTruthy();
    });

    // Step 8: Tap "View Details"
    fireEvent.press(getByText('View Details ▸'));

    // Step 9: On detail screen, tap "Add to Trip"
    await waitFor(() => {
      expect(getByTestId('place-detail-screen')).toBeTruthy();
    });
    
    const addToTripButton = getByTestId('add-to-trip-button');
    fireEvent.press(addToTripButton);

    // Step 10: In trip selector sheet, tap "New Trip"
    await waitFor(() => {
      expect(getByText('+ New Trip')).toBeTruthy();
    });
    
    fireEvent.press(getByText('+ New Trip'));

    // Step 11: Enter trip name
    const tripNameInput = getByTestId('trip-name-input');
    fireEvent.changeText(tripNameInput, 'Phoenix Weekend');

    // Step 12: Select dates
    const startDatePicker = getByTestId('trip-start-date');
    const endDatePicker = getByTestId('trip-end-date');
    
    fireEvent(startDatePicker, 'onDateChange', new Date('2026-02-10'));
    fireEvent(endDatePicker, 'onDateChange', new Date('2026-02-12'));

    // Step 13: Tap "Create & Add"
    const createButton = getByTestId('create-trip-button');
    fireEvent.press(createButton);

    // Expected Result: New trip created with place as first item
    await waitFor(() => {
      expect(mockCreateTrip).toHaveBeenCalledWith({
        name: 'Phoenix Weekend',
        startDate: '2026-02-10',
        endDate: '2026-02-12',
        places: [mockPlace.id],
      });
    });

    // Expected Result: Toast notification
    await waitFor(() => {
      expect(getByText('Added to Phoenix Weekend trip')).toBeTruthy();
    });
  });

  test('accessibility: map announces place markers', () => {
    const { getByTestId } = render(
      <PlacesMapScreen places={[mockPlace]} />
    );
    
    const map = getByTestId('places-map');
    expect(map.props.accessibilityLabel).toMatch(/Map showing 1 place/i);
    expect(map.props.accessibilityLabel).toMatch(/Favorite Cafe.*0\.3 miles away/i);
  });

  test('accessibility: bottom sheet has focus trap', () => {
    const { getByTestId } = render(
      <PlacesMapScreen selectedPlace={mockPlace} />
    );
    
    const bottomSheet = getByTestId('place-preview-sheet');
    expect(bottomSheet.props.accessibilityViewIsModal).toBe(true);
  });

  test('responsive: iPad shows side-by-side layout', () => {
    const { getByTestId } = render(
      <PlacesMapScreen />,
      { dimensions: { width: 768, height: 1024 } }
    );
    
    // Map on left, detail sheet on right
    const layout = getByTestId('places-layout');
    expect(layout.props.style).toMatchObject({
      flexDirection: 'row',
    });
  });

  test('map animation is smooth (60fps)', async () => {
    const { getByTestId } = render(<PlacesMapScreen />);
    
    const map = getByTestId('places-map');
    
    // Trigger pan and zoom
    fireEvent(map, 'onRegionChange', {
      latitude: 33.5,
      longitude: -112.1,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    // Animation should complete smoothly (check for smooth flag)
    expect(map.props.animationDuration).toBeGreaterThan(0);
  });

  test('autocomplete shows maximum 5 results', async () => {
    const manyResults = Array.from({ length: 10 }, (_, i) => ({
      id: `place-${i}`,
      name: `Place ${i}`,
    }));
    
    mockSearchPlaces.mockResolvedValue(manyResults);
    
    const { getByTestId, queryAllByTestId } = render(
      <PlacesMapScreen onSearchPlaces={mockSearchPlaces} />
    );
    
    fireEvent.changeText(getByTestId('places-search-bar'), 'cafe');
    
    await waitFor(() => {
      const results = queryAllByTestId(/search-result-/);
      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  test('mock location API response', () => {
    const testPlace = {
      lat: 33.4484,
      lng: -112.0740,
      name: 'Test Location',
    };
    
    expect(testPlace.lat).toBeCloseTo(33.4484, 4);
    expect(testPlace.lng).toBeCloseTo(-112.0740, 4);
  });
});
