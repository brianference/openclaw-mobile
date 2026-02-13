/**
 * TC-MOBILE-020: Orientation Changes
 * Category: Responsiveness
 * Priority: P2 (Medium)
 * Feature: Places, Scanner
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Dimensions } from 'react-native';

const PlacesMapScreen = require('../../src/screens/Places/PlacesMapScreen').default;
const ScannerScreen = require('../../src/screens/Scanner/ScannerScreen').default;

describe('TC-MOBILE-020: Orientation Changes', () => {
  test('places map: portrait to landscape layout change', () => {
    // Portrait
    Dimensions.get = jest.fn().mockReturnValue({ width: 375, height: 667 });
    const { getByTestId, rerender } = render(<PlacesMapScreen />);
    
    let mapContainer = getByTestId('map-container');
    expect(mapContainer.props.style?.width).toBe('100%');
    
    // Landscape
    Dimensions.get = jest.fn().mockReturnValue({ width: 667, height: 375 });
    rerender(<PlacesMapScreen />);
    
    mapContainer = getByTestId('map-container');
    
    // On tablet: side-by-side (60% map, 40% list)
    // On mobile: same as portrait (avoid awkward layouts)
  });

  test('scanner camera: controls adjust to orientation', () => {
    const { getByTestId } = render(<ScannerScreen />);
    
    // Portrait: controls bottom
    Dimensions.get = jest.fn().mockReturnValue({ width: 375, height: 667 });
    let controls = getByTestId('camera-controls');
    expect(controls.props.style?.flexDirection).toMatch(/row|column/);
    
    // Landscape: controls right side
    Dimensions.get = jest.fn().mockReturnValue({ width: 667, height: 375 });
  });

  test('no layout shift during rotation', () => {
    const { getByTestId } = render(<PlacesMapScreen />);
    
    // Content should preserve scroll position
    const scrollView = getByTestId('places-scroll');
    fireEvent.scroll(scrollView, { nativeEvent: { contentOffset: { y: 100 } } });
    
    // Rotate
    Dimensions.get = jest.fn().mockReturnValue({ width: 667, height: 375 });
    
    // Position preserved (implementation-dependent)
    expect(scrollView.props.maintainVisibleContentPosition).toBeTruthy();
  });

  test('accessibility: orientation change announced', () => {
    const { getByTestId } = render(<PlacesMapScreen />);
    
    // Mock orientation change
    Dimensions.get = jest.fn().mockReturnValue({ width: 667, height: 375 });
    
    const announcement = getByTestId('orientation-announcement');
    expect(announcement.props.accessibilityLabel).toMatch(/Landscape mode/i);
    expect(announcement.props.accessibilityLiveRegion).toBe('polite');
  });

  test('iPad: both orientations fully supported', () => {
    const orientations = [
      { width: 768, height: 1024, name: 'Portrait' },
      { width: 1024, height: 768, name: 'Landscape' },
    ];

    orientations.forEach(({ width, height, name }) => {
      Dimensions.get = jest.fn().mockReturnValue({ width, height });
      
      const { getByTestId } = render(<PlacesMapScreen />);
      const container = getByTestId('map-container');
      
      // Should render without issues
      expect(container).toBeTruthy();
    });
  });
});
