import { forwardRef, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import MapView, {
  Marker,
  Region,
  MarkerPressEvent,
  MapPressEvent,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, radius, typography, touchTargets } from '../design/tokens';

export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category?: string;
  distance?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface MapViewComponentProps {
  /**
   * Places to display as markers
   */
  places?: Place[];

  /**
   * Initial map region
   */
  initialRegion?: Region;

  /**
   * Show user location
   * @default true
   */
  showUserLocation?: boolean;

  /**
   * User's current location
   */
  userLocation?: {
    latitude: number;
    longitude: number;
  };

  /**
   * Marker press handler
   */
  onMarkerPress?: (place: Place) => void;

  /**
   * Map press handler
   */
  onMapPress?: () => void;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Custom map style (dark/light theme)
   */
  mapStyle?: any[];
}

// Dark mode map style (matches design spec)
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a3a3a3' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#333333' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#737373' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d2d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a3a3a3' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0369a1' }],
  },
];

/**
 * Map View Component
 *
 * Interactive map component for displaying places and user location.
 * Implements design spec section 5.5 (Map View).
 *
 * Features:
 * - Dark mode optimized map style
 * - Place markers with 44px tap targets
 * - User location with pulse animation
 * - Pinch to zoom, pan gestures (native)
 * - Custom marker icons per category
 * - Tap marker to trigger preview
 * - Integrates with ModalSheet for place details
 *
 * @example
 * ```tsx
 * <MapViewComponent
 *   places={places}
 *   userLocation={{ latitude: 33.4484, longitude: -112.0740 }}
 *   onMarkerPress={handleMarkerPress}
 *   showUserLocation
 * />
 *
 * <MapViewComponent
 *   initialRegion={{
 *     latitude: 37.78825,
 *     longitude: -122.4324,
 *     latitudeDelta: 0.0922,
 *     longitudeDelta: 0.0421,
 *   }}
 *   places={places}
 *   onMarkerPress={(place) => setSelectedPlace(place)}
 * />
 * ```
 */
export const MapViewComponent = forwardRef<MapView, MapViewComponentProps>(
  (
    {
      places = [],
      initialRegion,
      showUserLocation = true,
      userLocation,
      onMarkerPress,
      onMapPress,
      style,
      mapStyle = DARK_MAP_STYLE,
    },
    ref
  ) => {
    const mapRef = useRef<MapView>(null);
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

    // User location pulse animation
    const pulseScale = useSharedValue(1);

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1, // infinite
      false
    );

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }],
    }));

    const handleMarkerPress = (event: MarkerPressEvent, place: Place) => {
      setSelectedMarkerId(place.id);
      if (onMarkerPress) {
        onMarkerPress(place);
      }
    };

    const handleMapPress = (event: MapPressEvent) => {
      setSelectedMarkerId(null);
      if (onMapPress) {
        onMapPress();
      }
    };

    // Default region if none provided
    const defaultRegion: Region = initialRegion || {
      latitude: userLocation?.latitude || 37.78825,
      longitude: userLocation?.longitude || -122.4324,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

    return (
      <View style={[styles.container, style]}>
        <MapView
          ref={ref || mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapStyle}
          initialRegion={defaultRegion}
          showsUserLocation={false} // Custom user location marker
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={false}
          onPress={handleMapPress}
          pitchEnabled={true}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          {/* User location marker with pulse */}
          {showUserLocation && userLocation && (
            <>
              {/* Pulse effect */}
              <Marker
                coordinate={userLocation}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={0}
              >
                <Animated.View style={[styles.userLocationPulse, pulseAnimatedStyle]} />
              </Marker>

              {/* Main dot */}
              <Marker
                coordinate={userLocation}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={1}
              >
                <View style={styles.userLocation} />
              </Marker>
            </>
          )}

          {/* Place markers */}
          {places.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              onPress={(event) => handleMarkerPress(event, place)}
              tracksViewChanges={false} // Performance optimization
            >
              <View
                style={[
                  styles.markerContainer,
                  selectedMarkerId === place.id && styles.markerSelected,
                ]}
              >
                <View style={styles.marker}>
                  <Ionicons
                    name={place.icon || 'location'}
                    size={20}
                    color="#ffffff"
                  />
                </View>
              </View>
            </Marker>
          ))}
        </MapView>
      </View>
    );
  }
);

MapViewComponent.displayName = 'MapViewComponent';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius.md,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  userLocation: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary.default,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userLocationPulse: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.default,
    opacity: 0.3,
  },
  markerContainer: {
    width: touchTargets.minimum, // 44px WCAG minimum
    height: touchTargets.minimum,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.default,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  markerSelected: {
    transform: [{ scale: 1.15 }],
  },
});

export default MapViewComponent;
