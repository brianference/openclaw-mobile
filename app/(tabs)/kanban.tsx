import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useKanbanStore } from '../../src/store/kanban';
import { useTheme } from '../../src/store/theme';
import { useToast } from '../../src/components/Toast';
import { KanbanCard, ColumnId, Priority } from '../../src/types';

const COLUMNS: { id: ColumnId; title: string; icon: string }[] = [
  { id: 'backlog', title: 'Backlog', icon: 'albums-outline' },
  { id: 'progress', title: 'In Progress', icon: 'play-circle-outline' },
  { id: 'done', title: 'Done', icon: 'checkmark-circle-outline' },
];

function PriorityBadge({ priority, colors }: { priority: Priority; colors: any }) {
  const map = { high: colors.priorityHigh, medium: colors.priorityMedium, low: colors.priorityLow };
  return (
    <View style={[styles.priorityBadge, { backgroundColor: `${map[priority]}18` }]}>
      <View style={[styles.priorityDot, { backgroundColor: map[priority] }]} />
      <Text style={[styles.priorityText, { color: map[priority] }]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Text>
    </View>
  );
}

function CardItem({ card, columnId, colors, onPress, onMove }: {
  card: KanbanCard; columnId: ColumnId; colors: any; onPress: () => void; onMove: (to: ColumnId) => void;
}) {
  const [showMove, setShowMove] = useState(false);
  const others = COLUMNS.filter((c) => c.id !== columnId);
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowMove(true); }}
      activeOpacity={0.7}
    >
      <View style={styles.cardTop}>
        <PriorityBadge priority={card.priority} colors={colors} />
      </View>
      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{card.title}</Text>
      {card.description ? (
        <Text style={[styles.cardDesc, { color: colors.textDim }]} numberOfLines={2}>{card.description}</Text>
      ) : null}
      {card.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {card.tags.slice(0, 3).map((tag, i) => (
            <View key={i} style={[styles.tag, { backgroundColor: colors.tagDefault.bg }]}>
              <Text style={[styles.tagText, { color: colors.tagDefault.text }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      <Modal visible={showMove} transparent animationType="fade" onRequestClose={() => setShowMove(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowMove(false)}>
          <View style={[styles.moveMenu, { backgroundColor: colors.surface }]}>
            <Text style={[styles.moveTitle, { color: colors.text }]}>Move to</Text>
            {others.map((col) => (
              <TouchableOpacity key={col.id} style={[styles.moveItem, { borderBottomColor: colors.border }]}
                onPress={() => { onMove(col.id); setShowMove(false); }}>
                <Ionicons name={col.icon as any} size={20} color={colors.primary} />
                <Text style={[styles.moveItemText, { color: colors.text }]}>{col.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
}

function CardModal({ visible, card, onClose, onSave, onDelete, colors }: {
  visible: boolean; card?: KanbanCard | null; onClose: () => void;
  onSave: (d: { title: string; description: string; priority: Priority; tags: string[] }) => void;
  onDelete?: () => void; colors: any;
}) {
  const [title, setTitle] = useState(card?.title || '');
  const [desc, setDesc] = useState(card?.description || '');
  const [priority, setPriority] = useState<Priority>(card?.priority || 'medium');
  const [tagsText, setTagsText] = useState(card?.tags.join(', ') || '');
  const isEdit = !!card;

  useEffect(() => {
    if (visible) {
      setTitle(card?.title || '');
      setDesc(card?.description || '');
      setPriority(card?.priority || 'medium');
      setTagsText(card?.tags.join(', ') || '');
    }
  }, [visible, card]);

  const handleSave = () => {
    if (!title.trim()) { Alert.alert('Error', 'Title is required'); return; }
    onSave({ title: title.trim(), description: desc.trim(), priority, tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean) });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{isEdit ? 'Edit Card' : 'New Card'}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.textDim} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={[styles.label, { color: colors.textDim }]}>Title *</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={title} onChangeText={setTitle} placeholder="Card title" placeholderTextColor={colors.textMuted} />
            <Text style={[styles.label, { color: colors.textDim }]}>Description</Text>
            <TextInput style={[styles.modalInput, styles.textarea, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={desc} onChangeText={setDesc} placeholder="Description" placeholderTextColor={colors.textMuted} multiline numberOfLines={3} />
            <Text style={[styles.label, { color: colors.textDim }]}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                <TouchableOpacity key={p}
                  style={[styles.priorityOption, { borderColor: priority === p ? colors.primary : colors.border }, priority === p && { backgroundColor: colors.primaryBg }]}
                  onPress={() => setPriority(p)}>
                  <PriorityBadge priority={p} colors={colors} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.label, { color: colors.textDim }]}>Tags (comma-separated)</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={tagsText} onChangeText={setTagsText} placeholder="design, frontend" placeholderTextColor={colors.textMuted} />
          </ScrollView>
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            {isEdit && onDelete && (
              <TouchableOpacity style={[styles.deleteBtn, { borderColor: colors.error }]}
                onPress={() => Alert.alert('Delete Card', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: onDelete }])}>
                <Text style={{ color: colors.error, fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function KanbanScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const { cards, fetchCards, addCard, updateCard, moveCard, deleteCard, isLoading } = useKanbanStore();
  const [selected, setSelected] = useState<KanbanCard | null>(null);
  const [addColumn, setAddColumn] = useState<ColumnId | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchCards(); }, []);

  const colColors: Record<ColumnId, string> = { backlog: colors.accent, progress: colors.warning, done: colors.success };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.columnsWrap}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchCards} tintColor={colors.primary} />}>
        {COLUMNS.map(({ id, title }) => {
          const colCards = cards.filter((c) => c.column_id === id);
          return (
            <View key={id} style={[styles.column, { backgroundColor: colors.surface2 }]}>
              <View style={styles.colHeader}>
                <View style={[styles.colDot, { backgroundColor: colColors[id] }]} />
                <Text style={[styles.colTitle, { color: colors.text }]}>{title}</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.border }]}>
                  <Text style={[styles.countText, { color: colors.textDim }]}>{colCards.length}</Text>
                </View>
                <TouchableOpacity onPress={() => { setSelected(null); setAddColumn(id); setShowModal(true); }} style={styles.addBtn}>
                  <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.cardsList}>
                {colCards.map((card) => (
                  <CardItem key={card.id} card={card} columnId={id} colors={colors}
                    onPress={() => { setSelected(card); setAddColumn(null); setShowModal(true); }}
                    onMove={(to) => { moveCard(card.id, to); toast.show(`Moved to ${COLUMNS.find(c => c.id === to)?.title}`, 'success'); }} />
                ))}
                {colCards.length === 0 && (
                  <Text style={[styles.emptyCol, { color: colors.textMuted }]}>No cards</Text>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
      <CardModal visible={showModal} card={selected} colors={colors}
        onClose={() => setShowModal(false)}
        onSave={(data) => {
          if (selected) { updateCard(selected.id, data); toast.show('Card updated', 'success'); }
          else if (addColumn) { addCard(addColumn, data); toast.show('Card created', 'success'); }
        }}
        onDelete={selected ? () => { deleteCard(selected.id); setShowModal(false); toast.show('Card deleted', 'info'); } : undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  columnsWrap: { padding: 12 },
  column: { width: 290, marginHorizontal: 6, borderRadius: 14, padding: 12, maxHeight: '100%' },
  colHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  colDot: { width: 4, height: 18, borderRadius: 2, marginRight: 8 },
  colTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 6 },
  countText: { fontSize: 12, fontWeight: '500' },
  addBtn: { padding: 2 },
  cardsList: { flex: 1 },
  emptyCol: { textAlign: 'center', paddingVertical: 24, fontSize: 14 },
  card: { borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1 },
  cardTop: { flexDirection: 'row', marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  priorityText: { fontSize: 11, fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 11 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  moveMenu: { borderRadius: 14, padding: 8, minWidth: 220 },
  moveTitle: { fontSize: 14, fontWeight: '600', padding: 12 },
  moveItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, gap: 12 },
  moveItemText: { fontSize: 15 },
  modal: { width: '92%', maxHeight: '80%', borderRadius: 18, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalBody: { padding: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityOption: { borderWidth: 1.5, borderRadius: 10, padding: 8 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, gap: 12, borderTopWidth: 1 },
  deleteBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1.5 },
  saveBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
