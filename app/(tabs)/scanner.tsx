import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBrainStore } from '../../src/store/brain';
import { useTheme } from '../../src/store/theme';
import { useToast } from '../../src/components/Toast';
import { BrainNote, NoteCategory } from '../../src/types';

const CATEGORIES: { id: NoteCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'idea', label: 'Ideas', icon: 'bulb-outline' },
  { id: 'note', label: 'Notes', icon: 'document-text-outline' },
  { id: 'todo', label: 'Tasks', icon: 'checkbox-outline' },
  { id: 'research', label: 'Research', icon: 'search-outline' },
];

const NOTE_COLORS: { id: string; color: string }[] = [
  { id: 'default', color: '#64748b' },
  { id: 'teal', color: '#14b8a6' },
  { id: 'blue', color: '#3b82f6' },
  { id: 'amber', color: '#f59e0b' },
  { id: 'rose', color: '#f43f5e' },
  { id: 'green', color: '#22c55e' },
];

function getCategoryIcon(cat: NoteCategory): string {
  switch (cat) {
    case 'idea': return 'bulb';
    case 'todo': return 'checkbox';
    case 'research': return 'search';
    default: return 'document-text';
  }
}

function NoteCard({ note, colors, onPress, onTogglePin }: {
  note: BrainNote; colors: any; onPress: () => void; onTogglePin: () => void;
}) {
  const noteColor = NOTE_COLORS.find((c) => c.id === note.color)?.color || '#64748b';
  return (
    <TouchableOpacity
      style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: noteColor, borderLeftWidth: 3 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.noteHeader}>
        <Ionicons name={getCategoryIcon(note.category) as any} size={16} color={noteColor} />
        <Text style={[styles.noteCat, { color: noteColor }]}>
          {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
        </Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={onTogglePin} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={note.pinned ? 'pin' : 'pin-outline'} size={16} color={note.pinned ? colors.primary : colors.textMuted} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={2}>{note.title}</Text>
      {note.content ? (
        <Text style={[styles.noteContent, { color: colors.textDim }]} numberOfLines={3}>{note.content}</Text>
      ) : null}
      <Text style={[styles.noteDate, { color: colors.textMuted }]}>
        {new Date(note.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
      </Text>
    </TouchableOpacity>
  );
}

function NoteModal({ visible, note, onClose, onSave, onDelete, colors }: {
  visible: boolean; note?: BrainNote | null; onClose: () => void;
  onSave: (d: { title: string; content: string; category: NoteCategory; color: string }) => void;
  onDelete?: () => void; colors: any;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('note');
  const [color, setColor] = useState('default');
  const isEdit = !!note;

  useEffect(() => {
    if (visible) {
      setTitle(note?.title || '');
      setContent(note?.content || '');
      setCategory(note?.category || 'note');
      setColor(note?.color || 'default');
    }
  }, [visible, note]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{isEdit ? 'Edit Note' : 'New Note'}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.textDim} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            <TextInput
              style={[styles.titleInput, { color: colors.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.contentInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg }]}
              value={content}
              onChangeText={setContent}
              placeholder="Write your thoughts..."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
            />
            <Text style={[styles.label, { color: colors.textDim }]}>Category</Text>
            <View style={styles.catRow}>
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <TouchableOpacity key={cat.id}
                  style={[styles.catPill, { borderColor: category === cat.id ? colors.primary : colors.border }, category === cat.id && { backgroundColor: colors.primaryBg }]}
                  onPress={() => setCategory(cat.id as NoteCategory)}>
                  <Ionicons name={cat.icon as any} size={16} color={category === cat.id ? colors.primary : colors.textDim} />
                  <Text style={{ color: category === cat.id ? colors.primary : colors.textDim, fontSize: 13 }}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.label, { color: colors.textDim }]}>Color</Text>
            <View style={styles.colorRow}>
              {NOTE_COLORS.map((c) => (
                <TouchableOpacity key={c.id}
                  style={[styles.colorDot, { backgroundColor: c.color }, color === c.id && styles.colorDotActive]}
                  onPress={() => setColor(c.id)} />
              ))}
            </View>
          </ScrollView>
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            {isEdit && onDelete && (
              <TouchableOpacity style={[styles.deleteBtn, { borderColor: colors.error }]}
                onPress={() => Alert.alert('Delete Note', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: onDelete }])}>
                <Text style={{ color: colors.error, fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (!title.trim()) { Alert.alert('Error', 'Title is required'); return; }
                onSave({ title: title.trim(), content: content.trim(), category, color });
                onClose();
              }}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function BrainScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const { fetchNotes, addNote, updateNote, deleteNote, togglePin, setFilterCategory, filterCategory, getFilteredNotes, isLoading, searchQuery, setSearchQuery } = useBrainStore();
  const [selected, setSelected] = useState<BrainNote | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchNotes(); }, []);

  const filtered = getFilteredNotes();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search notes..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.id}
            style={[styles.filterPill, { borderColor: filterCategory === cat.id ? colors.primary : colors.border }, filterCategory === cat.id && { backgroundColor: colors.primaryBg }]}
            onPress={() => setFilterCategory(cat.id)}>
            <Ionicons name={cat.icon as any} size={15} color={filterCategory === cat.id ? colors.primary : colors.textDim} />
            <Text style={{ color: filterCategory === cat.id ? colors.primary : colors.textDim, fontSize: 13, fontWeight: '500' }}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.notesGrid}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchNotes} tintColor={colors.primary} />}>
        {filtered.map((note) => (
          <NoteCard key={note.id} note={note} colors={colors}
            onPress={() => { setSelected(note); setShowModal(true); }}
            onTogglePin={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); togglePin(note.id); }} />
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textDim }]}>No notes yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Tap + to capture your first idea</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => { setSelected(null); setShowModal(true); }}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <NoteModal visible={showModal} note={selected} colors={colors}
        onClose={() => setShowModal(false)}
        onSave={(data) => {
          if (selected) { updateNote(selected.id, data); toast.show('Note updated', 'success'); }
          else { addNote(data); toast.show('Note created', 'success'); }
        }}
        onDelete={selected ? () => { deleteNote(selected.id); setShowModal(false); toast.show('Note deleted', 'info'); } : undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 42, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  filterBar: { maxHeight: 52 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, gap: 6 },
  notesGrid: { padding: 16, gap: 10 },
  noteCard: { borderRadius: 12, padding: 14, borderWidth: 1 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  noteCat: { fontSize: 12, fontWeight: '600' },
  noteTitle: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  noteContent: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  noteDate: { fontSize: 12, marginTop: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { fontSize: 14, marginTop: 6 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '92%', maxHeight: '85%', borderRadius: 18, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalBody: { padding: 16 },
  titleInput: { fontSize: 20, fontWeight: '600', paddingVertical: 8, marginBottom: 12 },
  contentInput: { minHeight: 120, borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, gap: 6 },
  colorRow: { flexDirection: 'row', gap: 12 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotActive: { borderWidth: 3, borderColor: '#fff' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, gap: 12, borderTopWidth: 1 },
  deleteBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1.5 },
  saveBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
