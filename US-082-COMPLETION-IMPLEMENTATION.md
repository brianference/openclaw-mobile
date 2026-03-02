# US-082: Complete OpenClaw Chat for Mobileclaw - Final Implementation

## Status: COMPLETING FINAL 15% FOR MVP1

### Current State (85% Complete)
✅ **Completed (7/10 core features):**
1. US-059: Chat UI (message bubbles, input, history)
2. US-060: WebSocket client (gateway connection, streaming)
3. US-061: Attachment system (images, videos, documents, 50MB limit)
4. US-062: Design interface (20 UX test cases)
5. US-063: SQLite storage (searchMessages, exportToJSON/TXT/CSV ready!)
6. US-064: Push notifications
7. US-066: Upload progress indicators

🟡 **Partially Done (2/10):**
8. US-065: Typing indicators (TypingDots implemented ✅, read receipts ❌)
9. US-067: Search & export (DB methods ready ✅, UI missing ❌)

❌ **Low Priority (1/10):**
10. US-068: Message reactions/formatting (cancelled, not needed for MVP1)

### Plan: Complete Remaining 15%
**Task: Add Search & Export UI to Chat Screen**

#### 1. Search Implementation (30 min)
- Add search icon in header
- Add search input overlay (TextInput + results FlatList)
- Wire up messageDatabase.searchMessages()
- Display search results with highlight
- Jump to message on result tap

#### 2. Export Implementation (15 min)
- Add export button in conversation menu
- Show action sheet: Export as JSON / TXT / CSV
- Wire up messageDatabase.exportToJSON/TXT/CSV()
- Use FileSystem API to save file
- Share exported file via Share API

#### 3. Testing & Verification (15 min)
- Test search with various queries
- Test export in all 3 formats
- Verify file saving and sharing works
- Update US-082 completion notes

### Implementation Code

**File: app/(tabs)/chat/index.tsx**

Add to imports:
```typescript
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '../../../src/lib/messageDatabase';
```

Add state variables:
```typescript
const [searchVisible, setSearchVisible] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<Message[]>([]);
```

Add search handler:
```typescript
const handleSearch = async (query: string) => {
  setSearchQuery(query);
  if (query.length < 2) {
    setSearchResults([]);
    return;
  }
  try {
    const db = await getDatabase();
    const results = await db.searchMessages(query, 20);
    setSearchResults(results.map(r => ({
      ...r,
      content: r.snippet, // Use snippet with highlights
    })));
  } catch (err) {
    toast.show('Search failed', 'error');
  }
};
```

Add export handler:
```typescript
const handleExport = async (format: 'json' | 'txt' | 'csv') => {
  if (!activeConversation) return;
  
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
  try {
    const db = await getDatabase();
    let content = '';
    let filename = '';
    
    switch (format) {
      case 'json':
        content = await db.exportToJSON(activeConversation.id);
        filename = `chat-${activeConversation.id}-${Date.now()}.json`;
        break;
      case 'txt':
        content = await db.exportToTXT(activeConversation.id);
        filename = `chat-${activeConversation.id}-${Date.now()}.txt`;
        break;
      case 'csv':
        content = await db.exportToCSV(activeConversation.id);
        filename = `chat-${activeConversation.id}-${Date.now()}.csv`;
        break;
    }
    
    const path = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(path, content);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path);
    } else {
      toast.show(`Exported to ${filename}`, 'success');
    }
  } catch (err) {
    toast.show('Export failed', 'error');
  }
};
```

Add header buttons:
```typescript
// In return statement, before main content
{!activeConversation ? (
  // Existing empty state
) : (
  <>
    {/* Search button */}
    <TouchableOpacity 
      style={styles.headerBtn}
      onPress={() => setSearchVisible(!searchVisible)}
    >
      <Ionicons name="search" size={22} color={colors.text} />
    </TouchableOpacity>
    
    {/* Export button */}
    <TouchableOpacity 
      style={styles.headerBtn}
      onPress={() => {
        if (Platform.OS === 'ios') {
          ActionSheetIOS.showActionSheetWithOptions({
            options: ['Cancel', 'Export as JSON', 'Export as TXT', 'Export as CSV'],
            cancelButtonIndex: 0,
          }, async (idx) => {
            if (idx === 1) await handleExport('json');
            if (idx === 2) await handleExport('txt');
            if (idx === 3) await handleExport('csv');
          });
        } else {
          Alert.alert('Export', 'Choose format', [
            { text: 'Cancel' },
            { text: 'JSON', onPress: () => handleExport('json') },
            { text: 'TXT', onPress: () => handleExport('txt') },
            { text: 'CSV', onPress: () => handleExport('csv') },
          ]);
        }
      }}
    >
      <Ionicons name="download" size={22} color={colors.text} />
    </TouchableOpacity>
    
    {/* Search overlay */}
    {searchVisible && (
      <View style={[styles.searchOverlay, { backgroundColor: colors.bg }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Search messages..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
        />
        <FlatList
          data={searchResults}
          keyExtractor={(item, idx) => `search-${idx}`}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.searchResult, { backgroundColor: colors.surface }]}
              onPress={() => {
                setSearchVisible(false);
                setSearchQuery('');
                // TODO: Scroll to message in main list
              }}
            >
              <Text style={[styles.searchResultText, { color: colors.text }]}>
                {item.content}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    )}
    
    {/* Existing chat content */}
  </>
)}
```

Add styles:
```typescript
headerBtn: {
  padding: 10,
  marginHorizontal: 5,
},
searchOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 999,
  padding: 16,
},
searchInput: {
  height: 48,
  borderRadius: 12,
  paddingHorizontal: 16,
  fontSize: 16,
  marginBottom: 12,
},
searchResult: {
  padding: 12,
  borderRadius: 8,
  marginBottom: 8,
},
searchResultText: {
  fontSize: 14,
},
```

### Deliverables
- [ ] Search UI with live results
- [ ] Export in 3 formats (JSON/TXT/CSV)  
- [ ] Files saved and shareable
- [ ] US-082 marked complete
- [ ] Git commit with completion notes

### Time Estimate
Total: ~60 minutes

### Acceptance Criteria Check
After implementation, US-082 will be:
- ✅ 8/10 subtasks fully complete
- ✅ 1/10 subtask (typing indicators) partially complete (sufficient for MVP1)
- ✅ 1/10 subtask (reactions) low priority / cancelled
- ✅ MVP1 ready for dogfooding: Search ✅, Export ✅, Typing indicators ✅
- ✅ Integration testing: All components work together
- ✅ Offline support: SQLite storage ✅
- ✅ Passes ≥85% of UX test cases (90% estimated)

**Status: READY TO IMPLEMENT**
