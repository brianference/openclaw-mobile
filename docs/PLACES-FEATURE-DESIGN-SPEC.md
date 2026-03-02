# Mobileclaw Places Feature - Design Specification

**Version:** 1.0  
**Date:** March 2, 2026  
**Designer:** PM Orchestrator (Direct Execution)  
**Ralph Loop Iteration:** N/A (Direct PM execution)  
**Status:** Design Complete - Ready for Implementation

## 1. Overview

**Problem:** Users need a mobile-first way to discover, save, and organize locations for their trips without switching between multiple apps.

**Success Metrics:**
- Task completion rate: ≥90% for saving place to trip
- Search response time: <1 second
- Map load time: <2 seconds on 4G
- User satisfaction: ≥4.5/5 stars

**Users:** Mobile users planning trips (leisure travel, business travel, vacation planning)

**Platform:** Mobile-first responsive (iOS + Android via React Native)

**Complexity:** Moderate
- Existing backend integration (Google Maps API already in use for Tokyo trip)
- Standard security (API key management, no sensitive user data)
- 30-60 minute initial implementation for MVP features
- Well-documented Google Maps Platform APIs

### Feature Description

The Mobileclaw Places feature enables users to discover, save, and organize locations for their trips using Google Maps integration. Built mobile-first for iOS and Android, with seamless offline support and intuitive trip planning workflows.

## 2. Prerequisites Check

**Backend APIs:**

Google Maps Platform APIs:
- ✅ **Google Maps SDK** - Already integrated in Tokyo trip project
- ✅ **Places API (New)** - For place search, details, photos, reviews
  - Endpoint: `https://places.googleapis.com/v1/places:searchText`
  - Expected response: PlaceResult with id, displayName, formattedAddress, rating, photos
- ✅ **Geocoding API** - For address lookups
  - Endpoint: `https://maps.googleapis.com/maps/api/geocode/json`
- ✅ **Directions API** - For navigation handoff
  - Endpoint: `https://maps.googleapis.com/maps/api/directions/json`

**Status:** ✅ All Google Maps APIs exist and are actively used

**Mobileclaw Backend APIs (Local/Supabase):**
- ⚠️ **POST /api/trips** - Create new trip
  - Expected response: `{id, name, dateRange, createdAt}`
  - **Status:** Needs creation (local SQLite or Supabase integration)
- ⚠️ **GET /api/trips** - List all trips
  - Expected response: `[{id, name, places[], dateRange}]`
  - **Status:** Needs creation
- ⚠️ **POST /api/places** - Save place to trip
  - Expected request: `{tripId, placeId, category, date, notes}`
  - Expected response: `{id, tripId, place: PlaceResult}`
  - **Status:** Needs creation
- ⚠️ **GET /api/trips/:id/places** - Get places for trip
  - Expected response: `[{id, place: PlaceResult, category, date}]`
  - **Status:** Needs creation

**Data Sources:**

- ✅ **Google Maps Platform** - Real-time place data, photos, reviews, hours
  - Format: JSON via REST API
  - Availability: 99.9% SLA, <1s response time
- ✅ **Device GPS** - User location for "near me" searches
  - Format: Coordinates via expo-location
  - Availability: Permission-based, always available when granted
- ⚠️ **Local Storage (SQLite)** - Offline place caching
  - Format: SQLite database via expo-sqlite
  - **Status:** Needs setup (schema definition required)

**Dependencies:**

- ✅ **expo-location** (v19.0.2) - GPS access
- ✅ **react-native-maps** (v1.18.0) - Map component
- ⚠️ **expo-sqlite** (v19.0.2) - Local database
  - **Status:** Needs install
- ⚠️ **@googlemaps/react-wrapper** (optional) - Web Maps SDK wrapper
  - **Status:** Not critical for MVP (native maps sufficient)

### Alternatives (if prerequisites missing)

**Alternative 1: MVP with Google Maps Only (No backend)**
- Use AsyncStorage instead of backend APIs
- Store trips/places locally on device only
- No cloud sync, no multi-device support
- **Trade-off:** Simpler implementation, limited functionality
- **Time:** ~20 minutes faster

**Alternative 2: Supabase Backend**
- Use Supabase tables instead of custom backend
- Tables: `trips`, `trip_places`
- RLS policies for user-scoped data
- **Trade-off:** Requires Supabase account setup
- **Time:** +30 minutes for initial setup

**Alternative 3: SQLite + Manual Cloud Sync**
- Store everything in SQLite
- Periodic JSON export/import for backup
- No real-time sync
- **Trade-off:** Fully offline, user manages backups
- **Time:** +15 minutes for export/import UI

### Recommendation

**Proceed with Alternative 2 (Supabase Backend):**
- Best long-term solution
- Already have Supabase configured (from chat feature US-063)
- Enables multi-device sync
- ~30 minutes setup time is acceptable

## 3. Security Checklist

**Input Validation:**

- ✅ **Search queries sanitized** - Google Places API handles injection prevention
- ✅ **Place ID validation** - Google-issued IDs only (format: ChIJ... verified)
- ✅ **Trip names validated** - Max 100 chars, no special characters that break SQL
- ✅ **Notes field sanitized** - Text-only, no HTML, max 500 chars
- ✅ **File uploads: N/A** - No file upload in this feature
- ✅ **URL parameters validated** - placeId format checked before API calls

**XSS Protection:**

- ✅ **No user-generated HTML** - All place data from Google (trusted source)
- ✅ **React Native escapes by default** - Text components escape strings automatically
- ✅ **No `dangerouslySetInnerHTML`** - Not applicable in React Native
- ✅ **User notes escaped** - Markdown rendering uses react-native-markdown-display (XSS-safe)

**Authentication/Authorization:**

- ⚠️ **Auth required for trips** - User must be authenticated to create/view trips
  - Handled by existing Mobileclaw auth system (vault unlock)
  - No additional auth needed
- ✅ **No CSRF on API calls** - React Native → Supabase uses JWT tokens (CSRF not applicable)
- ✅ **Session timeout** - 30-minute idle timeout in vault (existing)
- ⚠️ **Data scoping** - Supabase RLS policies must enforce user can only see own trips
  - Policy: `CREATE POLICY "Users see own trips" ON trips FOR SELECT USING (auth.uid() = user_id)`

**Data Exposure:**

- ✅ **Google Maps API key** - Stored in keys.env (not in code)
  - Restricted to app bundle ID on Google Cloud Console
  - Android: package name restriction
  - iOS: bundle ID restriction
- ✅ **Supabase keys** - anon key is public (safe), service key in server-only env vars
- ✅ **No PII in place data** - Only public place info (names, addresses, hours)
- ✅ **User location masked** - GPS coordinates not stored server-side
  - Only used client-side for "near me" searches

**Status:**

⚠️ Needs Review:
1. Supabase RLS policies for `trips` and `trip_places` tables must be configured
2. Google Maps API key restrictions must be verified on Google Cloud Console

**Action Required Before Implementation:**
- Create Supabase RLS policies (5 minutes)
- Verify Google Maps API key restrictions (2 minutes)

**No blocking security concerns** - All items are standard precautions with known solutions.

## 4. Design Principles

1. **Mobile-First**: Optimized for 320px-428px viewports, one-handed operation
2. **Touch-Optimized**: ≥44x44px touch targets, gesture-friendly interactions
3. **Offline-First**: Core functionality works without network, syncs when available
4. **Google Maps Native**: Follows Google Maps Material Design guidelines
5. **WCAG 2.1 AA**: Full accessibility compliance

## Core Features

### 1. Map View with Custom Markers

**Purpose**: Interactive map for discovering and viewing saved locations

**Design Elements**:
- Full-screen Google Maps view (fills viewport minus nav bars)
- Custom marker icons by category:
  - 📍 Restaurant (red fork/knife icon)
  - 🏨 Hotel/Accommodation (blue bed icon)
  - 🎭 Activity/Attraction (green star icon)
  - 🚂 Transport (orange train icon)
- Marker clusters when >10 markers in view (numeric badge)
- Current location marker (blue pulsing dot)
- Map controls: zoom (+/-), compass, my location button

**Interaction Flow**:
1. User opens Places tab → Map loads with saved places
2. Tap marker → Info window appears at bottom (slide-up animation)
3. Tap info window → Place details screen opens
4. Pinch/zoom/pan → Standard Google Maps gestures

**States**:
- Loading: Skeleton map with loading indicator
- Empty: Map centered on user location, "No places yet" prompt
- Populated: All saved markers visible
- Error: Fallback to static map tile with retry button

### 2. Place Search Interface

**Purpose**: Quick discovery of nearby places

**Design Elements**:
- Floating search bar at top (16px margin, 48px height)
- Search icon (magnifying glass) on left
- Clear/cancel "X" button on right (appears when typing)
- Auto-suggest dropdown (max 5 results, appears below search bar)
- Category quick filters (horizontal scroll chips):
  - All | Restaurants | Hotels | Attractions | Transport

**Search Flow**:
1. User taps search bar → Keyboard appears, search bar expands
2. User types → Auto-suggestions appear in real-time
3. User taps suggestion → Map centers on place, marker appears
4. User taps category filter → Results filter to category

**Auto-Suggest Item**:
```
[Icon] Place Name
       Category • Rating ⭐ 4.5 • Distance (0.3 mi)
```

**States**:
- Default: Collapsed search bar with placeholder "Search places..."
- Active: Expanded with keyboard visible
- Loading: Spinner in search icon position
- No results: "No places found" message with "Try different keywords"
- Error: "Search unavailable" with offline icon

### 3. Place Details Screen

**Purpose**: Rich information about a selected place

**Layout** (scrollable):

```
┌─────────────────────────────┐
│ ← Back         Share ⋮      │ ← Header (sticky)
├─────────────────────────────┤
│ [Photo Carousel - Swipeable]│ ← Hero image (300px height)
├─────────────────────────────┤
│ Place Name                  │ ← Title (24px bold)
│ ⭐ 4.5 (120 reviews)        │ ← Rating row
│ $$ • Italian Restaurant     │ ← Meta row
├─────────────────────────────┤
│ 📍 123 Main St, Tokyo       │ ← Address
│ 🕒 Open now • Closes 10 PM  │ ← Hours
│ 📞 +81-3-1234-5678          │ ← Phone
│ 🌐 website.com              │ ← Website
├─────────────────────────────┤
│ [Add to Trip ▼]             │ ← Primary CTA (48px)
├─────────────────────────────┤
│ About                       │ ← Description
│ [Truncated text... More]    │
├─────────────────────────────┤
│ Reviews (120)               │ ← Reviews section
│ [Top review preview]        │
│ [See all reviews →]         │
├─────────────────────────────┤
│ Photos (45)                 │ ← Photos grid
│ [3x2 grid of thumbnails]    │
└─────────────────────────────┘
```

**Interaction**:
- Swipe photos → Carousel navigation
- Tap "Add to Trip" → Trip selector modal appears
- Tap phone/address → Native app opens (dialer/maps)
- Tap "More" → Expands description
- Tap "See all reviews" → Full reviews screen

**"Add to Trip" Modal**:
```
┌─────────────────────────────┐
│ Add to Trip          ✕      │
├─────────────────────────────┤
│ Select Trip:                │
│ ○ Tokyo May 2026            │
│ ○ Osaka Weekend             │
│ ○ Summer Road Trip          │
│ + Create New Trip           │
├─────────────────────────────┤
│ Category:                   │
│ [Dropdown: Restaurant ▼]    │
├─────────────────────────────┤
│ Date (optional):            │
│ [Date picker: May 15 ▼]     │
├─────────────────────────────┤
│ Notes (optional):           │
│ [Text area]                 │
├─────────────────────────────┤
│ [Cancel]          [Save]    │
└─────────────────────────────┘
```

### 4. Trip Organization

**Purpose**: Manage saved places across multiple trips

**My Trips View**:
```
┌─────────────────────────────┐
│ My Trips        + New Trip  │ ← Header
├─────────────────────────────┤
│ Tokyo May 2026              │ ← Trip card
│ 12 places • May 8-15        │
│ [3 place thumbnails...]     │
├─────────────────────────────┤
│ Osaka Weekend               │
│ 5 places • Apr 20-22        │
│ [3 place thumbnails...]     │
└─────────────────────────────┘
```

**Trip Detail View**:
```
┌─────────────────────────────┐
│ ← Tokyo May 2026    ⋮       │ ← Header
├─────────────────────────────┤
│ May 8-15, 2026              │ ← Date range
│ 12 places saved             │
├─────────────────────────────┤
│ Day 1 - May 8               │ ← Day header
│ [Restaurant card]           │ ← Place card
│ [Hotel card]                │
├─────────────────────────────┤
│ Day 2 - May 9               │
│ [Activity card]             │
│ [Restaurant card]           │
└─────────────────────────────┘
```

**Place Card** (in trip view):
```
┌─────────────────────────────┐
│ [60x60 photo] Restaurant Name│
│               ⭐ 4.5         │
│               0.5 mi away    │
│               10 AM - 10 PM  │
└─────────────────────────────┘
```

**Organization Actions**:
- Long-press card → Drag to reorder
- Swipe left → Delete option
- Tap "⋮" → Move to day, Change category, Edit notes

### 5. Navigation Integration

**Purpose**: Get directions to saved places

**Integration Points**:
- Tap "Get Directions" in place details → Opens Google Maps app with destination
- From trip view → "Navigate to next place" button (routes to nearest unvisited)
- Turn-by-turn nav delegated to Google Maps (not built in-app)

**Directions Button States**:
- Default: "Get Directions" (blue, 48px height)
- Loading: Spinner + "Opening Maps..."
- Error: "Maps unavailable" (gray, disabled)

### 6. Offline Mode Design

**Purpose**: Full functionality without network connection

**Offline Capabilities**:
- View saved places (cached locally)
- View place details (cached data)
- Add/remove from trips (queued for sync)
- Browse map (Google Maps offline tiles)

**Offline Indicators**:
- Top banner: "Offline mode • Changes will sync when online" (yellow bg)
- Search disabled: "Search requires internet" message
- Real-time data grayed out: "Hours may be outdated"

**Sync Behavior**:
- When online → Background sync queue processes
- Toast notification: "12 changes synced"
- Conflict resolution: Last-write-wins

## Mobile-First Design Specs

### Breakpoints

- **Mobile Small**: 320px - 374px (iPhone SE)
- **Mobile Medium**: 375px - 413px (iPhone 12/13/14)
- **Mobile Large**: 414px - 428px (iPhone Pro Max)
- **Tablet**: 429px+ (iPad, future expansion)

### Typography

| Element | Font Size | Weight | Line Height |
|---------|-----------|--------|-------------|
| H1 (Page title) | 24px | Bold | 32px |
| H2 (Section) | 20px | Semi-bold | 28px |
| Body | 16px | Regular | 24px |
| Caption | 14px | Regular | 20px |
| Button | 16px | Medium | 20px |

### Spacing

- Grid: 8px base unit
- Touch targets: ≥44x44px (WCAG 2.1 AA)
- Card padding: 16px
- Section margins: 24px
- Screen edges: 16px

### Colors

**Light Mode**:
- Background: #FFFFFF
- Surface: #F5F5F5
- Primary: #1976D2 (Google Blue)
- Error: #D32F2F
- Text Primary: #212121
- Text Secondary: #757575

**Dark Mode**:
- Background: #121212
- Surface: #1E1E1E
- Primary: #42A5F5 (Light Blue)
- Error: #EF5350
- Text Primary: #FFFFFF
- Text Secondary: #B0B0B0

### Icons

- Size: 24x24px (standard), 20x20px (inline)
- Stroke: 2px
- Style: Material Icons Outlined
- Color: Text secondary (default), Primary (active)

## UX Test Cases (20)

### Visual Hierarchy (4 tests)

**VH-1: Map Dominance**
- **Given** the user opens the Places tab
- **When** the screen renders
- **Then** the map occupies ≥70% of viewport height
- **And** search bar and navigation are clearly visible but secondary

**VH-2: Place Card Emphasis**
- **Given** a trip detail view with multiple places
- **When** the user scrolls through the list
- **Then** place photos are ≥60x60px and visually dominant
- **And** ratings and distance are clearly legible (≥14px font)

**VH-3: CTA Prominence**
- **Given** the user views place details
- **When** the page loads
- **Then** "Add to Trip" button is in primary color (blue)
- **And** button is ≥48px height with ≥16px padding

**VH-4: Information Density**
- **Given** a place card in trip view
- **When** the card renders
- **Then** essential info (name, rating, hours, distance) fits without truncation
- **And** secondary info (description) is truncated with "More" link

### Touch Targets (4 tests)

**TT-1: Minimum Touch Size**
- **Given** any interactive element (buttons, cards, links)
- **When** measured in dev tools
- **Then** all touch targets are ≥44x44px
- **And** no exceptions exist for small icons or links

**TT-2: Marker Tap Area**
- **Given** multiple map markers are clustered
- **When** the user taps a marker
- **Then** the correct marker is selected (no mis-taps)
- **And** tap area extends ≥44px diameter around marker center

**TT-3: List Item Spacing**
- **Given** a trip detail list with multiple place cards
- **When** the user taps a card
- **Then** the intended card opens (no accidental taps on adjacent cards)
- **And** vertical spacing between cards is ≥8px

**TT-4: Modal Dismiss Gestures**
- **Given** the "Add to Trip" modal is open
- **When** the user swipes down or taps outside modal
- **Then** the modal closes smoothly (300ms animation)
- **And** accidental taps on modal content don't trigger dismiss

### Information Architecture (4 tests)

**IA-1: Trip Navigation**
- **Given** the user has 5+ trips
- **When** the user opens "My Trips"
- **Then** trips are sorted by most recent first
- **And** user can search/filter trips

**IA-2: Place Categorization**
- **Given** a trip with 20+ places
- **When** the user views the trip
- **Then** places are grouped by day (default view)
- **And** user can toggle to "By Category" view

**IA-3: Search Relevance**
- **Given** the user searches "pizza near me"
- **When** results appear
- **Then** results are sorted by distance (closest first)
- **And** category filter is auto-set to "Restaurants"

**IA-4: Breadcrumb Navigation**
- **Given** the user is viewing place details from a trip
- **When** the user taps back
- **Then** they return to the trip detail view (not map)
- **And** scroll position in trip is preserved

### Feedback & States (4 tests)

**FB-1: Loading States**
- **Given** the map is loading places
- **When** the user waits
- **Then** a skeleton map with loading spinner appears within 200ms
- **And** map renders within 2 seconds or shows error

**FB-2: Save Confirmation**
- **Given** the user saves a place to a trip
- **When** the save completes
- **Then** a toast notification appears ("Saved to Tokyo May 2026")
- **And** toast auto-dismisses after 3 seconds

**FB-3: Offline Indicators**
- **Given** the device loses network connection
- **When** the user interacts with the app
- **Then** offline banner appears at top within 1 second
- **And** search bar shows "Offline" state (grayed out)

**FB-4: Error Recovery**
- **Given** a place fails to load
- **When** the error screen appears
- **Then** a "Retry" button is prominently displayed
- **And** tapping retry re-fetches the place data

### Accessibility (4 tests)

**A11Y-1: Screen Reader Support**
- **Given** VoiceOver/TalkBack is enabled
- **When** the user navigates the map screen
- **Then** all interactive elements are announced with descriptive labels
- **And** marker focus is clearly indicated with outline

**A11Y-2: Color Contrast**
- **Given** the app renders in light mode
- **When** all text elements are measured
- **Then** contrast ratios are ≥4.5:1 (normal text) or ≥3:1 (large text)
- **And** no critical information relies on color alone

**A11Y-3: Keyboard Navigation**
- **Given** the user navigates with external keyboard (iPad)
- **When** the user tabs through the interface
- **Then** focus order is logical (top-to-bottom, left-to-right)
- **And** all actions are accessible via keyboard

**A11Y-4: Text Resize**
- **Given** the user enables 200% text size in iOS/Android settings
- **When** the app renders
- **Then** all text scales proportionally
- **And** no text is truncated or overlaps other elements

## Google Maps Design Guidelines Compliance

### Map Interactions

- **Gesture Handling**: Set `gestureHandling: 'greedy'` for mobile (no scroll interference)
- **Zoom Controls**: Position zoom buttons bottom-right (Material Design standard)
- **Map Type**: Default to roadmap, allow satellite/terrain toggle
- **Custom Markers**: Use PNG icons at 2x resolution for retina displays

### Place Details Integration

- **Use Google Place Details API** for ratings, reviews, photos, hours
- **Display attribution** per Google Maps Platform Terms of Service
- **Link to Google Maps**: "View in Google Maps" link in place details

### Branding

- **Google Maps Logo**: Display in bottom-left corner (required)
- **"Powered by Google"**: Show in place search results (required)
- **No Modifications**: Don't alter Google Maps UI elements (zoom, compass, etc.)

## Dark Mode Design

### Color Palette

- **Surface Elevation**: Use shadow-based elevation (0dp, 1dp, 2dp, 4dp)
- **Map Style**: Switch to Google Maps dark theme when app in dark mode
- **Markers**: Use high-contrast colors (brighter versions of light mode)

### Transitions

- **Smooth Switching**: Fade transition (300ms) when toggling light/dark
- **System Preference**: Auto-detect iOS/Android dark mode setting
- **Manual Override**: Settings toggle to force light/dark mode

## Performance Targets

- **Initial Map Load**: <2 seconds on 4G connection
- **Search Response**: <1 second for auto-suggest results
- **Place Details Load**: <1.5 seconds
- **Offline Access**: Instant (0ms latency for cached data)
- **Battery Impact**: <5% drain per hour of active use

## Implementation Priorities

### Phase 1: MVP (Core Features)
1. Map view with basic markers
2. Place search (Google Places API)
3. Place details screen
4. Save to trip (single trip support)
5. Offline viewing (cached places)

### Phase 2: Enhanced Trip Management
6. Multiple trips support
7. Trip organization (drag-to-reorder)
8. Day-based grouping
9. Category filters

### Phase 3: Advanced Features
10. Navigation integration (Google Maps handoff)
11. Photo carousel
12. Reviews display
13. Offline sync queue
14. Share trip feature

## Design Assets Needed

- Custom marker icons (PNG 2x): Restaurant, Hotel, Activity, Transport
- Empty state illustrations: No places, No trips, Offline
- Loading animations: Skeleton map, Shimmer placeholders
- Error state icons: No network, API error, GPS disabled

## Next Steps

1. **Review with Brian**: Confirm design direction and priorities
2. **Create High-Fidelity Mockups**: Figma prototypes for all screens
3. **Generate Test Cases**: Playwright scripts for 20 UX tests
4. **Implementation Handoff**: Detailed component specs for Mobile Agent
5. **Iterate Based on Feedback**: Refine design based on dogfooding

---

**Design Spec Version**: 1.0  
**Last Updated**: March 2, 2026  
**Designer**: PM Orchestrator (Direct Execution)  
**Status**: Ready for Implementation
