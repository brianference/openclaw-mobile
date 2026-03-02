# Mobileclaw Places Feature - Design Specification

**Version:** 1.0  
**Created:** 2026-03-01  
**Status:** Ready for Implementation  
**Related:** PLACES-SPEC.md (Feature Spec), TEST-CASES-places.md (Test Cases)  
**Ralph Loop Iteration:** 1

---

## 1. Overview & Complexity Classification

**Problem:** Users need an intuitive mobile interface to discover places, view detailed information, and organize locations into trip itineraries using Google Maps integration.

**Success Metrics:**
- Task completion rate: >95% (search and save place)
- Time to save place: <30 seconds
- Error rate: <5% failed searches
- User satisfaction: >4.5/5 stars

**Users:** Mobile users planning trips (iOS 15+, Android 10+)

**Platform:** Mobile-first responsive (320px → 768px → 1024px+), iOS & Android native

**Complexity:** **Moderate**
- **Reasoning:** Integrates with existing Google Maps SDK and Places API (backend exists). Standard security requirements (API keys, location permissions). Estimated implementation: 8-12 days across 5 phases.
- **Backend:** Google Maps APIs (already configured)
- **Security:** Standard (API key restrictions, location permissions)
- **Testing:** Comprehensive (20 UX test cases + accessibility audit)

---

## 2. Prerequisites Check

**Backend APIs:**

Google Maps APIs (Third-party):
- [x] **Maps SDK** — Display interactive maps (iOS/Android)
  - Status: ✅ Configured in mobileclaw project
- [x] **Places API** — Search, autocomplete, place details
  - Endpoints: Text Search, Nearby Search, Place Details, Photos
  - Status: ✅ Active with API key
- [x] **Geocoding API** — Address to coordinates conversion
  - Status: ✅ Enabled
- [x] **Directions API** — Route calculation and navigation
  - Status: ✅ Enabled
- [x] **Street View API** — Street-level imagery
  - Status: ✅ Enabled
- [x] **Distance Matrix API** — Distance calculations
  - Status: ✅ Enabled

**Mobileclaw Backend (SQLite):**
- [x] **Trip Storage** — Local database for saved trips
  - Status: ✅ Implemented (src/lib/messageDatabase.ts pattern)
- [x] **Place Storage** — Local database for saved places
  - Status: ✅ Ready (extend SQLite schema)

**Status:** ✅ **All prerequisites exist.** No blockers.

**Data Sources:**

- [x] **Google Places Database** — Place details, photos, reviews
  - Format: JSON via REST API
  - Status: ✅ Available
- [x] **User Location** — GPS coordinates
  - Format: Geolocation API (latitude, longitude)
  - Status: ✅ Available (requires runtime permission)
- [x] **Saved Trips** — Local SQLite storage
  - Format: Structured data (trips, days, places)
  - Status: ✅ Ready for schema extension

**Status:** ✅ **All data sources available.**

**Dependencies:**

React Native Libraries:
- [ ] `react-native-maps` ^1.10.0 — Google Maps SDK wrapper
  - Status: ⚠️ **Needs install**
- [ ] `react-native-google-places-autocomplete` ^2.5.1 — Search autocomplete
  - Status: ⚠️ **Needs install**
- [ ] `@react-native-community/geolocation` ^3.1.0 — Location services
  - Status: ⚠️ **Needs install**
- [ ] `react-native-gesture-handler` ^2.14.0 — Swipe, drag gestures
  - Status: ✅ **Already installed** (used in other features)
- [ ] `react-native-reanimated` ^3.6.0 — Smooth animations
  - Status: ✅ **Already installed** (used in other features)

**Google API Keys:**
- [x] Google Maps iOS API Key — Configured in `ios/` directory
- [x] Google Maps Android API Key — Configured in `android/` directory
- [x] Google Places API Key — Shared key in `keys.env`

**Status:** ⚠️ **3 npm packages need installation.** No blockers — standard install process.

**Alternatives (if prerequisites missing):**

If Google Maps unavailable:
- Alternative 1: **Mapbox** — Similar features, different API
- Alternative 2: **Apple Maps** (iOS only) — Native integration, no cross-platform
- Alternative 3: **OpenStreetMap + Nominatim** — Free, open-source, no API limits

**Recommendation:** Proceed with Google Maps as specified. Alternatives only if API limits exceeded in production.

---

## 3. Security Checklist

**Input Validation:**

- [x] **Search input sanitized** — No raw HTML injection
  - Implementation: Use `TextInput` with controlled state, escape special chars
- [x] **Location coordinates validated** — Range checks (-90 to 90 lat, -180 to 180 lng)
  - Implementation: Validate before API calls and database storage
- [x] **Trip/place names validated** — Max length 100 chars, no script tags
  - Implementation: Client-side validation + SQLite constraints
- [x] **User notes sanitized** — Strip HTML tags, limit to 500 chars
  - Implementation: DOMPurify or simple regex sanitization

**Status:** ✅ **All inputs will be validated.**

**XSS Protection:**

- [x] **No `dangerouslySetInnerHTML`** — All text rendered via React Native `<Text>`
  - Implementation: Use safe React Native components
- [x] **User-generated content sanitized** — Notes and custom place names
  - Implementation: Strip HTML, escape special characters
- [x] **No eval() or dynamic code execution**
  - Implementation: Static code only, no runtime string evaluation

**Status:** ✅ **XSS risk minimal** (React Native doesn't support HTML rendering).

**Authentication/Authorization:**

- [x] **No auth required** — Places feature is local-first
  - Note: Future cloud sync will require authentication
- [x] **Location permission gating** — Request only when needed
  - Implementation: Runtime permission request on first map load
- [x] **Google Maps API key restrictions** — Restrict to iOS/Android app bundle IDs
  - Status: ✅ **Already configured** in Google Cloud Console

**Status:** ✅ **Auth not applicable.** Location permissions handled correctly.

**Data Exposure:**

- [x] **No API keys in frontend code** — Keys stored in native config files
  - iOS: `GoogleService-Info.plist`
  - Android: `AndroidManifest.xml` with obfuscation
- [x] **No PII in logs** — Location data not logged in production
  - Implementation: Remove debug console.logs before production build
- [x] **Saved places stored locally** — SQLite database, user-specific
  - No cloud sync yet, so no data exposure risk

**Status:** ✅ **No sensitive data exposure.**

### Additional Considerations

- [x] **Rate limiting** — Google Places API has 100,000 requests/month free tier
  - Implementation: Client-side debounce (300ms), cache search results locally
- [x] **Offline mode** — Cached map tiles and saved places work offline
  - Implementation: Service worker caching (web), native caching (iOS/Android)
- [x] **HTTPS only** — All API calls over HTTPS
  - Implementation: Google APIs enforce HTTPS

**Overall Security Status:** ✅ **All security checks pass.** No concerns for MVP.

**Security Notes for Future Phases:**
- If adding cloud sync: Implement auth (OAuth 2.0, JWT tokens)
- If adding social sharing: Sanitize shared links, validate recipients
- If adding payments (booking integration): PCI-DSS compliance required

---

## 4. Design Philosophy

**Mobile-First:** Optimized for one-handed use, thumb-friendly interactions  
**Information Scent:** Clear visual hierarchy guides users to their goals  
**Progressive Disclosure:** Show essentials first, details on demand  
**Gestalt Principles:** Group related elements, create visual rhythm  
**Platform Native:** Follows iOS HIG and Material Design guidelines

---

## Color System

### Light Mode
```
Background:     #FFFFFF (white)
Surface:        #F8F9FA (light gray)
Primary:        #4285F4 (Google Blue)
Secondary:      #34A853 (Google Green)
Accent:         #FBBC04 (Google Yellow)
Error:          #EA4335 (Google Red)
Text Primary:   #202124 (near black)
Text Secondary: #5F6368 (gray)
Text Tertiary:  #80868B (light gray)
Border:         #DADCE0
Shadow:         rgba(0,0,0,0.12)
```

### Dark Mode
```
Background:     #121212 (dark)
Surface:        #1E1E1E (dark gray)
Primary:        #8AB4F8 (light blue)
Secondary:      #81C995 (light green)
Accent:         #FDD663 (light yellow)
Error:          #F28B82 (light red)
Text Primary:   #E8EAED (near white)
Text Secondary: #9AA0A6 (gray)
Text Tertiary:  #5F6368 (dark gray)
Border:         #3C4043
Shadow:         rgba(0,0,0,0.48)
```

### Google Maps Integration
- Marker (Selected): #EA4335 (red)
- Marker (Saved): #34A853 (green)
- Marker (Cluster): #4285F4 (blue)
- User Location: #4285F4 with pulse animation
- Route Line: #4285F4, 4px width

---

## Typography

### Font Family
- **iOS:** SF Pro (system font)
- **Android:** Roboto (system font)
- **Web Fallback:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif

### Type Scale (Mobile-First)
```
Heading 1:  28px / 700 / 1.2 line-height
Heading 2:  24px / 700 / 1.3 line-height
Heading 3:  20px / 600 / 1.4 line-height
Heading 4:  18px / 600 / 1.4 line-height
Body Large: 17px / 400 / 1.5 line-height (iOS default)
Body:       16px / 400 / 1.5 line-height (Android default)
Body Small: 14px / 400 / 1.5 line-height
Caption:    12px / 400 / 1.4 line-height
Button:     16px / 600 / 1.0 line-height
```

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Spacing System (8px Grid)

```
4px  (0.5x) - Minimal spacing (icon padding)
8px  (1x)   - Tight spacing (list items)
16px (2x)   - Default spacing (sections)
24px (3x)   - Medium spacing (cards)
32px (4x)   - Large spacing (page sections)
40px (5x)   - Extra large spacing (hero sections)
48px (6x)   - Maximum spacing
```

### Margins
- Screen edges: 16px
- Card padding: 16px
- List item padding: 12px vertical, 16px horizontal
- Button padding: 12px vertical, 24px horizontal

---

## Component Library

### 1. Map View Component

**Layout:**
```
┌─────────────────────────────┐
│ 🔍 [Search Input]      ⚙️│  ← Header (56px height)
├─────────────────────────────┤
│                             │
│      [Google Maps View]     │
│                             │
│         📍 📍 📍            │
│       📍  ⊙  📍             │  ← Map (fills remaining space)
│         📍 📍 📍            │
│                             │
├─────────────────────────────┤
│ [Layers] [Location] [Save]  │  ← Bottom toolbar (56px)
└─────────────────────────────┘
```

**Specifications:**
- Header Height: 56px (iOS), 64px (Android with status bar)
- Map Fill: calc(100vh - header - toolbar)
- Bottom Toolbar: 56px height, 3 icon buttons
- Background: White (light), #1E1E1E (dark)
- Shadow: 0 -2px 8px rgba(0,0,0,0.12)

**Map Controls:**
- Zoom buttons: Bottom-right, 48x48px each
- Location button: Bottom-right, above zoom
- Map type selector: Top-right, 40x40px
- All buttons: Elevation 2dp, white background

### 2. Search Input

**Design:**
```
┌─────────────────────────────┐
│ 🔍 Search places, addresses  │
└─────────────────────────────┘
```

**Specifications:**
- Height: 48px
- Border radius: 24px (pill shape)
- Background: #F8F9FA (light), #3C4043 (dark)
- Icon: 20x20px, left 16px
- Text: 16px, left 48px
- Clear button: 20x20px, right 16px
- Shadow: 0 2px 4px rgba(0,0,0,0.08)
- Focus: Border 2px #4285F4

**States:**
- Default: Placeholder text in gray
- Active: Blue border, keyboard visible
- Filled: Clear button visible
- Disabled: 50% opacity

### 3. Place Card (List View)

**Layout:**
```
┌─────────────────────────────┐
│ [Photo]  Name                │
│ 80x80px  ⭐⭐⭐⭐ (4.2)       │
│          Category • 0.3 mi   │
│          Open until 9 PM     │
│          [Save] [Directions] │
└─────────────────────────────┘
```

**Specifications:**
- Height: Auto (min 96px)
- Photo: 80x80px, rounded 8px
- Name: 18px / 600
- Rating: 14px, yellow stars
- Metadata: 14px / 400, gray
- Action buttons: 32px height, 16px padding
- Background: White card with shadow
- Margin: 8px horizontal, 4px vertical
- Tap area: Full card clickable

**Interaction:**
- Tap: Navigate to place details
- Long-press: Quick actions menu
- Save button: Toggle saved state with animation
- Directions: Launch native maps app

### 4. Place Details Screen

**Layout:**
```
┌─────────────────────────────┐
│ ✕                      ⋯    │  ← Header with close/menu
├─────────────────────────────┤
│  [Photo Gallery Carousel]   │  ← 240px height
├─────────────────────────────┤
│ Place Name                  │
│ ⭐⭐⭐⭐ 4.2 (234 reviews)   │
│                             │
│ ☕ Coffee Shop              │
│ 📍 123 Main St, Phoenix AZ  │
│ 📞 (602) 555-1234          │
│ 🌐 starbucks.com            │
│ 🕐 Open • Closes 9 PM       │
│ 📏 0.3 mi away              │
│                             │
│ [Get Directions]            │
│ [Save to Trip]              │
│ [Street View]               │
│                             │
│ Recent Reviews              │
│ ────────────────────────    │
│ "Great coffee..."           │
└─────────────────────────────┘
```

**Specifications:**
- Modal presentation (iOS), Activity (Android)
- Photo carousel: 240px height, swipe gesture
- Close button: Top-left 44x44px
- Menu button: Top-right 44x44px
- Padding: 16px all sides
- Section spacing: 24px between sections
- Action buttons: Full width, 48px height

### 5. Trip Day Card

**Layout:**
```
┌─────────────────────────────┐
│ May 7 - Arrival        ✏️🗑️ │  ← Day header
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🏨 Hotel XYZ            │ │
│ │ Check-in: 3 PM          │ │
│ │ [View] [Navigate]       │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 🍽️ Dinner Restaurant    │ │
│ │ 7:00 PM                 │ │
│ │ [View] [Navigate]       │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Specifications:**
- Day header: 48px height, semibold 18px
- Place card: 80px min height
- Icon: 32x32px, left aligned
- Drag handle: 6 dots, far right
- Background: #F8F9FA
- Card spacing: 8px vertical
- Swipe actions: Delete (red), Edit (blue)

### 6. Bottom Sheet (Save to Trip)

**Layout:**
```
┌─────────────────────────────┐
│ ──── Save to Trip           │  ← Drag handle
├─────────────────────────────┤
│ Select Trip:                │
│ ○ Phoenix Trip (May 7-10)  │
│ ○ Seattle Weekend           │
│ ○ + Create New Trip         │
│                             │
│ Day: [▼ May 7]              │
│ Category: [▼ Dinner]        │
│ Notes: [Optional...]        │
│                             │
│ [Cancel]        [Save]      │
└─────────────────────────────┘
```

**Specifications:**
- Appears from bottom with slide animation
- Drag handle: 32px width, 4px height, rounded
- Max height: 80% of screen
- Scrollable content if needed
- Cancel button: Secondary style
- Save button: Primary style, disabled until trip selected
- Backdrop: rgba(0,0,0,0.4), dismisses sheet on tap

---

## Interaction Patterns

### 1. Search Interaction

**Flow:**
1. User taps search input
2. Input expands, keyboard slides up (300ms ease-out)
3. Recent searches appear as suggestions
4. User types, autocomplete shows results (debounced 300ms)
5. Tap result → search executes → markers appear on map
6. Result list slides up from bottom (400ms ease-out)

**Gestures:**
- Tap search input: Focus and show keyboard
- Tap suggestion: Execute search
- Swipe down on results: Dismiss results panel
- Tap map: Dismiss keyboard and results

### 2. Map Marker Interaction

**States:**
- Default: Gray pin icon
- Saved: Green pin icon with checkmark
- Selected: Red pin icon, larger (32x32px)
- Cluster: Blue circle with count

**Interactions:**
- Tap marker: Show info window above marker
- Tap info window: Open place details
- Double-tap marker: Zoom to location
- Long-press marker: Quick actions menu

**Animations:**
- Marker drop: Bounce animation (500ms)
- Marker select: Scale 1.0 → 1.3 → 1.2 (200ms)
- Info window: Fade in + slide up (300ms)

### 3. Pull-to-Refresh

**Trigger:** Pull down on search results list
**Animation:** Circular progress indicator at top
**Feedback:** Haptic feedback when threshold reached
**Action:** Refresh search results with updated data

### 4. Swipe Gestures

**Place Card (List View):**
- Swipe left: Delete (red background)
- Swipe right: Save to trip (green background)
- Threshold: 30% of card width
- Haptic feedback at threshold
- Bounce back if released before threshold

**Trip Place Card:**
- Swipe left: Delete from trip (red)
- Swipe right: Edit details (blue)

### 5. Drag & Drop (Trip Organization)

**Interaction:**
1. Long-press place card (500ms)
2. Card lifts with shadow + haptic
3. Drag to new position or different day
4. Drop zone highlights in blue
5. Release: Card animates to position (300ms ease-out)

**Visual Feedback:**
- Lifted card: Scale 1.05, shadow 8dp
- Drop zone: Blue border, 2px dashed
- Other cards: Shift to make space (200ms)

---

## Animations & Transitions

### Screen Transitions
```css
/* Slide from right (iOS style) */
enter: translateX(100%) → translateX(0)
exit: translateX(0) → translateX(-30%)
duration: 300ms
easing: cubic-bezier(0.4, 0.0, 0.2, 1)
```

### Micro-Interactions
```css
/* Button tap */
scale: 1.0 → 0.95 → 1.0
duration: 150ms

/* Save button */
heart icon: scale 1.0 → 1.3 → 1.0 + fill color change
duration: 400ms
easing: ease-out

/* Loading spinner */
rotation: 0deg → 360deg
duration: 1000ms
easing: linear, infinite
```

### Map Animations
```css
/* Marker drop */
translateY: -200px → 0
scale: 0 → 1.2 → 1.0
duration: 600ms
easing: cubic-bezier(0.68, -0.55, 0.265, 1.55) /* bounce */

/* Map pan to location */
duration: 800ms
easing: ease-in-out
```

---

## Accessibility (WCAG 2.1 AA)

### Touch Targets
- **Minimum:** 44x44px (iOS), 48x48dp (Android)
- **Ideal:** 56x56px for primary actions
- **Spacing:** Minimum 8px between targets

### Color Contrast
- **Text:** 4.5:1 minimum (normal text)
- **Large Text:** 3:1 minimum (18px+ bold, 24px+ regular)
- **Interactive Elements:** 3:1 against background
- **Focus Indicators:** 3:1, 2px outline

### Screen Reader Support
```jsx
// Place card example
<View accessible={true} accessibilityLabel="Starbucks, 4.2 stars, Coffee Shop, 0.3 miles away, Open until 9 PM">
  <Image accessibilityLabel="Starbucks storefront photo" />
  <Text accessibilityRole="header">Starbucks</Text>
  <Text accessibilityLabel="Rating 4.2 out of 5 stars">⭐⭐⭐⭐</Text>
  <Button accessibilityLabel="Save Starbucks to trip" accessibilityHint="Double tap to add to your trip">Save</Button>
</View>
```

### Focus Management
- Logical tab order (top to bottom, left to right)
- Focus returns to trigger element after modal close
- Skip links for long lists
- Focus trap in modals

### Reduce Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design

### Breakpoints
```
Small:  320px - 374px (iPhone SE)
Medium: 375px - 413px (iPhone 12/13)
Large:  414px - 767px (iPhone 14 Pro Max, Android phones)
Tablet: 768px - 1023px (iPad)
Desktop: 1024px+ (iPad Pro landscape, monitors)
```

### Layout Adaptations

**Small (320-374px):**
- Single column layout
- Reduced padding (12px)
- Smaller typography (-2px)
- Stacked buttons (full width)
- Compact map controls

**Medium (375-413px):**
- Standard mobile layout
- Default spacing (16px)
- Standard typography
- Inline buttons where appropriate

**Large (414-767px):**
- More breathing room
- Larger tap targets
- Side-by-side buttons
- Larger map controls

**Tablet (768px+):**
- Two-column layout (map + sidebar)
- Sidebar: 360px fixed width
- Map: Fills remaining space
- Floating action buttons
- Larger typography

---

## Platform-Specific Patterns

### iOS Design
- **Navigation:** Large title, blur background
- **Buttons:** System blue, SF Symbols icons
- **Lists:** Inset grouped style
- **Modals:** Sheet presentation (drag to dismiss)
- **Haptics:** Medium impact for interactions
- **Status Bar:** Light content on dark backgrounds

### Android Design
- **Navigation:** AppBar with elevation
- **Buttons:** Material Design filled buttons
- **Lists:** Material list style
- **Modals:** Bottom sheet or full-screen dialog
- **Ripple:** Touch feedback with ripple effect
- **Status Bar:** Translucent with scrim

---

## Performance Optimization

### Image Loading
- **Lazy load:** Images below fold
- **Progressive:** Show low-res placeholder first
- **Caching:** Cache photos for 7 days
- **Format:** WebP with JPEG fallback
- **Compression:** 80% quality for thumbnails

### Map Performance
- **Marker Clustering:** >50 markers
- **Tile Caching:** Cache viewed tiles for offline
- **Debounce:** Search input (300ms)
- **Throttle:** Map pan events (100ms)
- **Lazy Load:** Place details on demand

### Animation Performance
```css
/* Use transform/opacity (GPU-accelerated) */
.animate {
  transform: translateX(100%);
  opacity: 0;
  will-change: transform, opacity;
}

/* Avoid: left, top, width, height (CPU) */
```

---

## Dark Mode Implementation

### Strategy
- **Auto-detect:** Follow system preference
- **Manual toggle:** User can override
- **Persist:** Save preference in AsyncStorage
- **Smooth transition:** 200ms fade

### Color Mapping
```typescript
const colors = {
  background: isDark ? '#121212' : '#FFFFFF',
  surface: isDark ? '#1E1E1E' : '#F8F9FA',
  primary: isDark ? '#8AB4F8' : '#4285F4',
  text: isDark ? '#E8EAED' : '#202124',
  border: isDark ? '#3C4043' : '#DADCE0',
};
```

### Map Styling
```javascript
// Dark mode map style
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  // ... more styling
];
```

---

## Error States

### No Internet Connection
```
┌─────────────────────────┐
│        ☁️               │
│   No Internet           │
│   Connection            │
│                         │
│ Unable to load map and  │
│ search for places.      │
│                         │
│ [Try Again]             │
└─────────────────────────┘
```

### Search No Results
```
┌─────────────────────────┐
│        🔍               │
│   No Results Found      │
│                         │
│ Try different keywords  │
│ or check your spelling. │
│                         │
│ [Clear Search]          │
└─────────────────────────┘
```

### Place Details Failed
```
┌─────────────────────────┐
│        ⚠️               │
│   Unable to Load        │
│   Place Details         │
│                         │
│ Please try again later. │
│                         │
│ [Retry] [Go Back]       │
└─────────────────────────┘
```

### Location Permission Denied
```
┌─────────────────────────┐
│        📍               │
│   Location Access       │
│   Required              │
│                         │
│ Enable location to find │
│ places near you.        │
│                         │
│ [Open Settings]         │
└─────────────────────────┘
```

---

## Loading States

### Map Loading
- Skeleton: Light gray tiles
- Spinner: Centered on map
- Progress: "Loading map..."
- Timeout: 10 seconds → error state

### Place Details Loading
- Photo: Gray placeholder with shimmer
- Text: Skeleton lines (2-3 lines)
- Buttons: Disabled state
- Animation: Pulse shimmer effect

### Search Loading
- Inline spinner next to search input
- Results: 3-5 skeleton cards
- Cancel button: "Cancel search"

---

## Component State Variations

### Save Button
```
States:
1. Default: Gray heart outline
2. Hover (desktop): Scale 1.1
3. Pressed: Scale 0.95
4. Saved: Red filled heart
5. Loading: Spinner replaces icon
6. Disabled: 50% opacity

Animation:
unsaved → saved: heart fills + scale bounce
saved → unsaved: heart empties + fade
```

### Search Input
```
States:
1. Empty: Placeholder text
2. Focused: Blue border
3. Filled: Clear button visible
4. Loading: Spinner right side
5. Error: Red border, error icon
6. Disabled: Gray background, no interaction
```

### Map Marker
```
States:
1. Default: Gray pin
2. Hover (desktop): Tooltip appears
3. Selected: Red pin, larger
4. Saved: Green pin with checkmark
5. Cluster: Blue circle with count
6. Loading: Pulsing animation
```

---

## Integration with Mobileclaw Design System

### Reusable Components
- `<Button>` - Primary, secondary, outlined variants
- `<Card>` - Surface with shadow and rounded corners
- `<Input>` - Text input with label and validation
- `<Avatar>` - Circular image with fallback
- `<Badge>` - Small label for counts/status
- `<Skeleton>` - Loading placeholder
- `<Empty State>` - No data messaging

### Design Tokens
```javascript
// colors.ts
export const tokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.08)',
    md: '0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 4px 8px rgba(0,0,0,0.16)',
  },
};
```

---

## Test Cases Reference

**Full Test Suite:** `/tests/places/test-docs/TEST-CASES-places.md`

### Quick Summary (20 Test Cases)

**Visual Hierarchy (4 tests):**
- TC-001: Page layout follows reading pattern
- TC-002: Typography hierarchy is clear
- TC-003: Spacing follows 8px grid
- TC-004: Color contrast meets WCAG AA

**Touch Targets (3 tests):**
- TC-005: Touch targets ≥44x44px
- TC-006: Touch targets have 8px spacing
- TC-007: Touch feedback is immediate

**Information Architecture (3 tests):**
- TC-008: Content is logically organized
- TC-009: Search is easily accessible
- TC-010: Place details are comprehensive

**Feedback & States (4 tests):**
- TC-011: Loading states are clear
- TC-012: Error messages are helpful
- TC-013: Success confirmation is visible
- TC-014: Empty states guide user

**Accessibility (6 tests):**
- TC-015: Screen reader support complete
- TC-016: Keyboard navigation works
- TC-017: Color not sole differentiator
- TC-018: Text resizable to 200%
- TC-019: Focus indicators visible
- TC-020: Forms have labels and validation

---

## Implementation Checklist

### Phase 1: Core UI (2-3 days)
- [ ] Map view component with Google Maps SDK
- [ ] Search input with autocomplete
- [ ] Place card list view
- [ ] Basic navigation

### Phase 2: Place Details (2-3 days)
- [ ] Place details screen
- [ ] Photo carousel
- [ ] Save to trip functionality
- [ ] Directions integration

### Phase 3: Trip Management (2-3 days)
- [ ] Trip list view
- [ ] Trip day cards
- [ ] Drag & drop reordering
- [ ] Trip map view

### Phase 4: Polish (2-3 days)
- [ ] Animations and transitions
- [ ] Dark mode support
- [ ] Error states and loading skeletons
- [ ] Performance optimization

### Phase 5: Accessibility (1-2 days)
- [ ] Screen reader support
- [ ] Keyboard navigation
- [ ] Touch target sizing
- [ ] Color contrast validation

---

## Dependencies

### React Native Libraries
```json
{
  "react-native-maps": "^1.10.0",
  "react-native-google-places-autocomplete": "^2.5.1",
  "@react-native-community/geolocation": "^3.1.0",
  "react-native-gesture-handler": "^2.14.0",
  "react-native-reanimated": "^3.6.0"
}
```

### Google APIs
- Google Maps SDK for iOS/Android
- Google Places API
- Google Geocoding API
- Google Directions API
- Google Street View API

### Required API Keys
- Google Maps iOS API Key
- Google Maps Android API Key
- Google Places API Key (shared)

---

## Success Metrics

### Design Quality
- **Accessibility Score:** ≥95% (Lighthouse)
- **Performance Score:** ≥90% (Lighthouse)
- **Design Consistency:** 100% components from design system
- **Test Coverage:** 20/20 UX tests passing

### User Experience
- **Task Completion Rate:** >95% (search and save place)
- **Time to Save Place:** <30 seconds
- **Error Rate:** <5% failed searches
- **User Satisfaction:** >4.5/5 stars

---

## References

- [Feature Specification](/root/.openclaw/workspace/projects/mobileclaw/specs/PLACES-SPEC.md)
- [Test Cases](/root/.openclaw/workspace/projects/mobileclaw/tests/places/test-docs/TEST-CASES-places.md)
- [UX Rationale](/root/.openclaw/workspace/projects/mobileclaw/UX-RATIONALE.md)
- [Google Maps Design Guidelines](https://developers.google.com/maps/documentation/ios-sdk/styling)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Guidelines](https://material.io/design)
- [WCAG 2.1 AA Standards](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Design by:** Cole (PM Orchestrator - Direct Execution)  
**Date:** 2026-03-01  
**Status:** ✅ Complete and ready for implementation
