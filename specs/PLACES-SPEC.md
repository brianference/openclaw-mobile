# Mobileclaw Places Feature Specification

## Overview
The Places feature integrates Google Maps to help users discover, save, and organize locations for trip planning. It provides a mobile-optimized interface for searching places, viewing details, saving favorites, and building trip itineraries.

## User Story
As a mobile user, I want to search for places on a map, view detailed information, and save them to trip plans, so that I can efficiently plan and organize my travels from my phone.

## Core Capabilities

### 1. Map Loading and Rendering
- **Google Maps Integration:** Native Google Maps SDK for iOS/Android
- **Map Display:** Full-screen map with smooth pan and zoom
- **Current Location:** Show user's current location with blue dot
- **Map Types:** Standard, Satellite, Terrain, Hybrid
- **3D Buildings:** Enable 3D building view in supported areas
- **Indoor Maps:** Show indoor floor plans for malls, airports
- **Performance:** Map loads in <2 seconds on 4G
- **Offline Tiles:** Cache map tiles for offline viewing

### 2. Place Search
- **Text Search:** Search by name, category, or address
- **Nearby Search:** "Restaurants near me", "Gas stations nearby"
- **Category Filters:** Filter by Food, Hotels, Attractions, Shopping, Services
- **Auto-Complete:** Real-time suggestions as user types
- **Search Radius:** Adjustable radius (1km, 5km, 10km, 50km)
- **Search Results:** Up to 20 results per search
- **Result Markers:** Show search results as pins on map
- **Performance:** Search results in <1 second

### 3. Place Details Display
- **Info Window:** Tap marker to show quick info
- **Detail Screen:** Full-screen place details
- **Photos:** Gallery of place photos (Google Photos API)
- **Ratings:** Star rating and review count
- **Reviews:** Recent user reviews from Google
- **Hours:** Opening hours and current open/closed status
- **Contact:** Phone number, website, address
- **Distance:** Distance from current location
- **Directions:** "Get Directions" button
- **Street View:** Integrated Street View for street-level preview

### 4. Save to Trip
- **Save Button:** One-tap save to trip
- **Trip Selection:** Choose which trip to add place to
- **Create New Trip:** Create trip if none exist
- **Day Assignment:** Assign place to specific day
- **Category:** Auto-categorize (Breakfast, Lunch, Dinner, Activity, Accommodation)
- **Notes:** Add personal notes to saved place
- **Photos:** Attach personal photos to place
- **Confirmation:** Toast message "Saved to [Trip Name]"

### 5. Trip Organization
- **Trip List:** View all saved trips
- **Trip View:** See places organized by day
- **Drag & Reorder:** Reorder places within day
- **Move Between Days:** Drag place to different day
- **Delete Place:** Swipe to delete from trip
- **Trip Map:** View all trip places on map
- **Route Planning:** Optimize route for multiple places
- **Export:** Export trip as PDF or share link

### 6. Navigation Integration
- **Get Directions:** Launch Google Maps for turn-by-turn
- **Apple Maps Integration:** Option to use Apple Maps on iOS
- **Walking Directions:** Walking time and route
- **Transit Directions:** Public transit options
- **Driving Directions:** Driving time and route
- **Multi-Stop:** Add multiple stops to route
- **Share Location:** Share place location via message/email

### 7. Street View
- **Street View Button:** Launch Street View from place details
- **360° View:** Pan around street-level imagery
- **Navigation:** Move along street
- **Indoor View:** See inside businesses (where available)
- **Performance:** Street View loads in <3 seconds
- **Fallback:** Show static image if Street View unavailable

### 8. Offline Mode
- **Cached Searches:** Access recent searches offline
- **Saved Places:** View saved places offline
- **Offline Maps:** Download map areas for offline use
- **Limited Functionality:** Search disabled offline
- **Sync Indicator:** Show which data is offline vs online
- **Auto-Sync:** Sync changes when connection returns

## User Interface

### Map Screen
```
┌─────────────────────────┐
│ 🔍 Search places    ⚙ ⋮ │
├─────────────────────────┤
│                         │
│      [Google Map]       │
│                         │
│        📍 📍            │
│      📍  ⊙  📍         │
│        📍 📍            │
│                         │
│ [Layers] [Location] [+] │
└─────────────────────────┘
```

### Search Results
```
┌─────────────────────────┐
│ ← Coffee shops near me  │
├─────────────────────────┤
│ Found 15 places         │
│                         │
│ ┌─────────────────────┐ │
│ │ ☕ Starbucks        │ │
│ │ ⭐⭐⭐⭐ (4.2)  0.3mi│ │
│ │ Open until 9 PM     │ │
│ │         [Save] [➜]  │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ ☕ Local Brew       │ │
│ │ ⭐⭐⭐⭐⭐ (4.8) 0.5mi│ │
│ │ Closes at 6 PM      │ │
│ │         [Save] [➜]  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Place Details
```
┌─────────────────────────┐
│ ✕ Starbucks - Downtown  │
├─────────────────────────┤
│ [Photo Gallery]         │
│                         │
│ ⭐⭐⭐⭐ 4.2 (234 reviews)│
│ ☕ Coffee Shop          │
│ 📍 123 Main St, Phoenix │
│ 📞 (602) 555-1234       │
│ 🌐 starbucks.com        │
│ 🕐 Open • Closes 9 PM   │
│ 📏 0.3 mi away          │
│                         │
│ [Get Directions]        │
│ [Save to Trip]          │
│ [Street View]           │
│                         │
│ Recent Reviews:         │
│ "Great location..."     │
└─────────────────────────┘
```

### Trip View
```
┌─────────────────────────┐
│ ← Phoenix Trip  ✏️ 🗑️   │
├─────────────────────────┤
│ May 7 - Arrival         │
│ ┌─────────────────────┐ │
│ │ 🏨 Hotel XYZ        │ │
│ │ Check-in 3 PM       │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🍽️ Dinner Spot      │ │
│ │ 7:00 PM             │ │
│ └─────────────────────┘ │
│                         │
│ May 8 - Day 1           │
│ ┌─────────────────────┐ │
│ │ ☕ Breakfast Café   │ │
│ │ 8:00 AM             │ │
│ └─────────────────────┘ │
│                         │
│    [View on Map]        │
└─────────────────────────┘
```

## Technical Requirements

### Data Model
```typescript
interface Place {
  id: string;
  googlePlaceId: string;
  name: string;
  category: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  reviewCount?: number;
  photoUrls?: string[];
  phoneNumber?: string;
  website?: string;
  hours?: OpeningHours;
  priceLevel?: number; // 1-4 ($-$$$$)
}

interface Trip {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  days: TripDay[];
  places: SavedPlace[];
  createdAt: Date;
  updatedAt: Date;
}

interface TripDay {
  date: Date;
  places: SavedPlace[];
}

interface SavedPlace {
  placeId: string;
  place: Place;
  dayIndex: number;
  order: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'activity' | 'accommodation' | 'other';
  notes?: string;
  personalPhotos?: string[];
  savedAt: Date;
}
```

### Google Maps APIs
- **Maps SDK:** Google Maps SDK for iOS/Android
- **Places API:** Text Search, Nearby Search, Place Details
- **Geocoding API:** Address to coordinates conversion
- **Directions API:** Route calculation
- **Street View API:** Street-level imagery
- **Distance Matrix API:** Distance calculations

### Storage
- **SQLite Database:** Local storage for saved places and trips
- **Realm/Core Data:** Alternative native storage
- **File System:** Downloaded map tiles for offline
- **Secure Storage:** Google Maps API key

### APIs
- **Google Places API:** Search, details, photos
- **Google Maps Directions:** Route planning
- **Geocoding:** Location lookups
- **Rate Limits:** 100,000 requests/month (free tier)

### Security
- **API Key Restrictions:** Restrict to iOS/Android app
- **Location Permissions:** Request when needed, not at launch
- **Data Privacy:** Don't share location with third parties
- **HTTPS Only:** All API calls over HTTPS

## Acceptance Criteria

### Functional Requirements
- [ ] Map loads and displays in <2 seconds
- [ ] Search returns results in <1 second
- [ ] Current location shown on map
- [ ] Place details display all available info
- [ ] Save to trip works in <2 taps
- [ ] Street View loads in <3 seconds
- [ ] Offline mode shows cached data
- [ ] Get Directions launches native maps app

### Non-Functional Requirements
- [ ] Map performance: 60fps pan and zoom
- [ ] Battery usage: <5% per hour of map viewing
- [ ] Data usage: <5MB per hour of active use
- [ ] API usage: <1000 requests per user per month
- [ ] Storage: <50MB for 100 saved places
- [ ] Memory usage: <150MB

### Device Testing
- [ ] Works on iPhone (iOS 15+)
- [ ] Works on Android (Android 10+)
- [ ] Works on tablets (iPad, Android tablets)
- [ ] Adapts to various screen sizes
- [ ] Supports landscape orientation

### Accessibility
- [ ] VoiceOver/TalkBack support
- [ ] Minimum touch target size: 44x44px
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Font scaling support
- [ ] Voice search support

## Success Metrics

### Usage Metrics
- Average searches per session: >5
- Places saved per trip: >10
- User engagement: >60% create at least 1 trip
- Retention (30-day): >70%

### Performance Metrics
- Map load time: <2 seconds (avg)
- Search response time: <1 second (avg)
- Place details load: <1.5 seconds (avg)
- Street View load: <3 seconds (avg)
- App crash rate: <0.1%

### Quality Metrics
- User satisfaction: >4.5/5 stars
- Bug reports: <5 per 1000 users
- Support tickets: <2% of users
- Search accuracy: >90% relevant results

## Test Scenarios

### Happy Path Tests
1. **Search for Place:** User searches "coffee", finds results, taps one
2. **View Details:** Place details load with photos, ratings, hours
3. **Save to Trip:** User saves place to trip in 2 taps
4. **Get Directions:** Tapping directions launches Google Maps
5. **View Street View:** Street View loads 360° imagery

### Edge Cases
1. **No Internet:** Map shows cached tiles, search disabled
2. **No Results:** Search "xyz123abc" returns "No results found"
3. **No Location Permission:** Map centers on default location (Phoenix)
4. **API Limit Reached:** Show error message, suggest retry later
5. **Large Trip:** 100+ places in trip, map still performs well

### Error Scenarios
1. **Map Load Failed:** Show error message with retry button
2. **Search Failed:** Network error, offer retry
3. **Place Details Failed:** Show partial info, note missing data
4. **Save Failed:** Database error, show error toast
5. **Directions Unavailable:** No route found, suggest alternatives

### Performance Tests
1. **100 Markers:** Display 100 place markers, map stays smooth
2. **Large Photo Gallery:** 20 photos load progressively
3. **Offline Map:** 50MB downloaded map works offline
4. **Rapid Searches:** 10 searches in 10 seconds, all complete
5. **Battery Test:** 1 hour of map use, <5% battery drain

## Edge Cases

1. **No Internet Connection:** Show offline indicator, disable search
2. **GPS Disabled:** Prompt to enable location services
3. **API Key Invalid:** Show error, log to monitoring
4. **Place Closed Permanently:** Show "Permanently closed" status
5. **Very Long Address:** Truncate address with ellipsis
6. **No Photos Available:** Show placeholder image
7. **No Reviews:** Show "No reviews yet"
8. **Invalid Coordinates:** Validate lat/lng, reject invalid
9. **Map Tiles Failed:** Show retry button
10. **Storage Full:** Warn user, prompt to delete old trips

## Future Enhancements

### Phase 2
- **AR View:** Augmented reality place markers
- **Social Features:** Share trips with friends
- **Collaborative Planning:** Multiple users plan together
- **Smart Recommendations:** AI suggests places based on preferences
- **Budget Tracking:** Track trip expenses
- **Weather Integration:** Show weather for trip dates
- **Booking Integration:** Book hotels, restaurants from app

### Phase 3
- **Offline Navigation:** Turn-by-turn without internet
- **Voice Commands:** "Find pizza near me"
- **Apple Watch App:** View nearby places on watch
- **Widget:** Show today's trip schedule
- **Siri Shortcuts:** "My next stop"
- **CarPlay Integration:** View trip in car
- **Translation:** Translate place names and reviews

---

**Version:** 1.0  
**Created:** 2026-02-21  
**Last Updated:** 2026-02-21  
**Status:** Specification Complete
