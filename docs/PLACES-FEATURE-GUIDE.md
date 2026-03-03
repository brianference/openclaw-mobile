# Places Feature - User Guide

## Overview

The Places feature helps you discover and save interesting locations nearby - restaurants, coffee shops, grocery stores, gas stations, and more. Every result includes Google Maps directions, ratings, distance, and smart ranking based on quality and proximity.

---

## Features

### 🔍 Smart Search
- Search any type of place (restaurants, stores, attractions)
- Auto-detects your location
- Shows results within 5 miles by default

### 📊 Composite Ranking
Places are ranked using a smart algorithm:
- **65% based on rating** (quality matters most)
- **35% based on proximity** (convenience is important too)

Example: A 4.5★ restaurant 2 miles away will rank higher than a 3.8★ restaurant 0.5 miles away.

### 🗺️ Always Includes Directions
Every place has a "Get Directions" button that opens Google Maps with turn-by-turn navigation.

### ⭐ Save Favorites
Tap the star icon to save places you want to visit later.

### 🏷️ Quick Filters
Fast access to common searches:
- 🍳 Breakfast
- 🍱 Lunch
- 🍽️ Dinner
- ☕ Coffee
- 🛒 Grocery
- ⛽ Gas

---

## How to Use

### Search for Places

1. **Tap the Places tab** at the bottom (map icon)
2. **Grant location permission** when prompted
3. **Type a search** (e.g., "sushi") or tap a Quick Filter
4. **View results** sorted by match score

### View Place Details

1. **Tap any place card** in the results
2. See full details:
   - Photo (if available)
   - Rating + reviews
   - Open/Closed status
   - Hours
   - Address
   - Phone number
   - Website
   - Match score (0-100%)

### Get Directions

1. Tap **"Get Directions"** on any place card
2. Google Maps opens with route ready
3. Start navigation

### Save a Place

1. Open the place detail screen
2. Tap the **☆ Save** button (turns to **⭐ Saved**)
3. Access saved places from the **⭐ Saved** button

### View Saved Places

1. From Places screen, tap **⭐ Saved**
2. See all your favorite places
3. Tap any place to view details
4. Tap **✕** to remove from saved

---

## Information Displayed

### On Every Place Card
- **Name** - Place name
- **Distance** - How far away (in miles)
- **Rating** - Google rating (⭐)
- **Review Count** - Number of reviews
- **Status** - 🟢 Open or 🔴 Closed
- **Address** - Full address
- **Match Score** - Visual bar (green = better match)

### On Detail Screen
Additional information:
- **Photo** - Venue photo
- **Hours** - Today's hours
- **Phone** - Tap to call
- **Website** - Tap to visit
- **TripAdvisor Data** - For restaurants (rating, ranking, cuisines)
- **Match Score** - Percentage with explanation

---

## Match Score Explained

The match score helps you make better decisions:

### Example 1: High-Rated & Close
- **Place:** Popular Café
- **Rating:** 4.8★ (96% quality score)
- **Distance:** 1.2 miles (88% proximity score)
- **Match Score:** (0.65 × 0.96) + (0.35 × 0.88) = **93%** ✅ Excellent match!

### Example 2: High-Rated but Far
- **Place:** Famous Restaurant
- **Rating:** 5.0★ (100% quality score)
- **Distance:** 9 miles (10% proximity score)
- **Match Score:** (0.65 × 1.0) + (0.35 × 0.1) = **69%** 🟡 Good but inconvenient

### Example 3: Low-Rated but Close
- **Place:** Quick Mart
- **Rating:** 2.5★ (50% quality score)
- **Distance:** 0.3 miles (97% proximity score)
- **Match Score:** (0.65 × 0.5) + (0.35 × 0.97) = **67%** 🟡 Convenient but mediocre

**Tip:** Places with 80%+ match scores are usually great choices!

---

## Tips & Tricks

### For Best Results
- **Enable location services** for accurate distance calculations
- **Use specific searches** ("Italian restaurant" vs "food")
- **Check the match score** - don't just pick the closest place
- **Read the Open/Closed status** before heading out

### Quick Filters
Quick filters are tuned for common needs:
- **Breakfast** → coffee shops, diners, bakeries (open early)
- **Lunch** → fast-casual, cafes, delis
- **Dinner** → restaurants, fine dining
- **Coffee** → coffee shops, cafes
- **Grocery** → supermarkets, convenience stores
- **Gas** → gas stations

### Saving Places
Saved places are stored locally on your device:
- ✅ Works offline (once saved)
- ✅ Syncs across app restarts
- ✅ Private (not shared with anyone)

---

## Accessibility

The Places feature is designed for everyone:

### Vision
- **High contrast text** (15.8:1 ratio)
- **Large touch targets** (44px minimum)
- **Screen reader support** (full VoiceOver/TalkBack compatibility)

### Motor
- **Large buttons** (easy to tap)
- **Bottom-anchored actions** (thumb-reachable)
- **No precision required** (tap anywhere on card)

### Cognitive
- **Simple, clear layout**
- **Visual match score** (green bar)
- **Status badges** (🟢 Open, 🔴 Closed)
- **Consistent patterns** (same layout everywhere)

---

## Permissions Required

### Location (Required)
- **Purpose:** Calculate distance to places
- **When:** Only when using Places feature
- **Privacy:** Never shared or stored remotely

---

## FAQ

### Why do I need location permission?
To show you places near you and calculate accurate distances. Without it, the feature won't work.

### Can I search places in other cities?
Yes! Type the city name in your search (e.g., "sushi in New York").

### Why isn't a place showing up?
- It might be outside the 5-mile radius
- It might not be listed in Google Places
- Try a more specific search term

### What if a place is permanently closed?
Google Places data updates regularly. Report closed places in Google Maps to help improve the data.

### Does this use my data?
- **Search:** ~50 KB per search (includes photos)
- **Saved places:** Stored locally, no data usage
- **Directions:** Opens Google Maps (separate app, uses its data)

### Can I share a place with friends?
Not yet, but it's planned for a future update! For now, you can share the address manually.

---

## Privacy

Your privacy matters:
- ✅ Location only used for distance calculations
- ✅ Saved places stored locally on your device
- ✅ No tracking or analytics on place searches
- ✅ No data shared with third parties
- ✅ Google Places API requests don't include personal info

---

## Known Limitations

### Current Version
- **List view only** - Map view coming in next update
- **No trip planning** - Itinerary feature coming soon
- **No photos on list view** - Tap place to see photo

### Future Features
- 🗺️ Interactive map with markers
- 📅 Trip planner (organize by day)
- 📸 Photo galleries
- 💬 Reviews integration
- 🌐 Offline mode (cached results)

---

## Troubleshooting

### "Location permission denied"
1. Go to Settings → MobileClaw
2. Enable Location → While Using App
3. Restart the app

### "No places found"
- Check your internet connection
- Try a broader search term
- Increase radius (not available yet, but coming soon)

### "Search not working"
- Ensure location permission is granted
- Check internet connection
- Try a different search term

### "Directions button not working"
- Ensure Google Maps is installed
- If not, it will open in browser

---

## Support

Need help? Found a bug?

- **In-app:** Settings → Help & Feedback
- **GitHub:** [Report an issue](https://github.com/brianference/openclaw-mobile/issues)
- **Email:** support@openclaw.com (coming soon)

---

## Credits

- **Place data:** Google Places API (New)
- **Geocoding:** OpenStreetMap Nominatim
- **Directions:** Google Maps
- **Design:** Based on MobileClaw design system
- **Implementation:** US-022

---

**Last Updated:** 2026-03-02  
**Version:** 1.0.0
