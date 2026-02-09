# Mobileclaw - Feature Names

**Updated:** 2026-02-07 17:30 MST  

---

## 📱 Core Features (Final Names)

### 1. Task Board ✅
**What:** Task management board  
**Icon:** 📋  
**Status:** Built  

### 2. Brain 🧠
**What:** Second Brain (skills repository + ideas + memory)  
**Icon:** 🧠  
**Status:** To build  
**Includes:**
- Skills repository (70+ ClawHub skills)
- Ideas tracker (quick capture)
- Memory system (lessons learned)

### 3. Vault 🔐
**What:** Encrypted secrets storage  
**Icon:** 🔐  
**Status:** Needs security fixes  
**Stores:**
- API keys
- Tokens
- Passwords
- AES-256-GCM encrypted

### 4. Places 🗺️
**What:** Trip/map/restaurant planner  
**Icon:** 🗺️  
**Status:** Building web version first  
**Features:**
- Create trips with dates/locations
- Google Maps integration
- Find food nearby
- Train schedules
- List/Map views

### 5. Scanner 📷
**What:** OCR for receipts/documents  
**Icon:** 📷  
**Status:** Built  

### 6. Settings ⚙️
**What:** App preferences  
**Icon:** ⚙️  
**Status:** Built  

---

## 📱 Tab Bar Layout

```
┌────────────────────────────────────┐
│  Mobileclaw                   ☰    │
├────────────────────────────────────┤
│                                    │
│  [Home screen content]             │
│                                    │
├────────────────────────────────────┤
│  📋     🧠     🗺️     🔐     ⚙️   │
│ Task Board Brain Places Vault  More   │
└────────────────────────────────────┘
```

---

## 🎯 Feature Hierarchy

**Main tabs (5):**
1. Task Board - Task management
2. Brain - Knowledge & ideas
3. Places - Trip planning ⭐ (new name)
4. Vault - Secure storage
5. More - Settings, Scanner, About

**Places sub-screens:**
- My Places (list of trips)
- Place Details (map + locations)
- Add Place
- Find Nearby
- Directions

---

**Updated:** Trip Agent → **Places**  
**Reason:** Simpler, clearer, matches Google Places branding
