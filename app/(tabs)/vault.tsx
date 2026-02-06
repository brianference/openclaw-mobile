import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../src/store/theme';
import { useToast } from '../../src/components/Toast';
import { VaultItem } from '../../src/types';

const CATEGORIES = ['api_key', 'password', 'note', 'other'] as const;
const CAT_ICONS: Record<string, string> = { api_key: 'key-outline', password: 'lock-closed-outline', note: 'document-text-outline', other: 'ellipsis-horizontal-circle-outline' };
const CAT_LABELS: Record<string, string> = { api_key: 'API Key', password: 'Password', note: 'Secure Note', other: 'Other' };

const VAULT_KEY = 'openclaw_vault_items';

async function loadVault(): Promise<VaultItem[]> {
  const raw = await SecureStore.getItemAsync(VAULT_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

async function saveVault(items: VaultItem[]) {
  await SecureStore.setItemAsync(VAULT_KEY, JSON.stringify(items));
}

export default function VaultScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<VaultItem | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadVault().then(setItems);
  }, []);

  const filtered = items.filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (data: { name: string; value: string; category: VaultItem['category']; notes: string }) => {
    let updated: VaultItem[];
    if (editItem) {
      updated = items.map((i) => i.id === editItem.id ? { ...i, ...data, updatedAt: Date.now() } : i);
    } else {
      const newItem: VaultItem = { id: `vault_${Date.now()}`, ...data, createdAt: Date.now(), updatedAt: Date.now() };
      updated = [newItem, ...items];
    }
    setItems(updated);
    await saveVault(updated);
    setShowModal(false);
    setEditItem(null);
    toast.show(editItem ? 'Item updated' : 'Item saved to vault', 'success');
  };

  const handleDelete = async (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    await saveVault(updated);
    setShowModal(false);
    setEditItem(null);
    toast.show('Item removed from vault', 'info');
  };

  const handleCopy = async (item: VaultItem) => {
    await Clipboard.setStringAsync(item.value);
    setCopiedId(item.id);
    toast.show('Copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search vault..." placeholderTextColor={colors.textMuted}
            value={search} onChangeText={setSearch} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.map((item) => {
          const isRevealed = revealed.has(item.id);
          const isCopied = copiedId === item.id;
          return (
            <View key={item.id} style={[styles.vaultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.vaultHeader}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryBg }]}>
                  <Ionicons name={CAT_ICONS[item.category] as any} size={18} color={colors.primary} />
                </View>
                <View style={styles.vaultInfo}>
                  <Text style={[styles.vaultName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.vaultCat, { color: colors.textMuted }]}>{CAT_LABELS[item.category]}</Text>
                </View>
                <TouchableOpacity onPress={() => { setEditItem(item); setShowModal(true); }}>
                  <Ionicons name="create-outline" size={20} color={colors.textDim} />
                </TouchableOpacity>
              </View>
              <View style={[styles.valueRow, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <Text style={[styles.valueText, { color: colors.text }]} numberOfLines={1}>
                  {isRevealed ? item.value : '\u2022'.repeat(Math.min(item.value.length, 20))}
                </Text>
                <TouchableOpacity onPress={() => toggleReveal(item.id)} style={styles.actionBtn}>
                  <Ionicons name={isRevealed ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textDim} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleCopy(item)} style={styles.actionBtn}>
                  <Ionicons name={isCopied ? 'checkmark' : 'copy-outline'} size={18} color={isCopied ? colors.success : colors.textDim} />
                </TouchableOpacity>
              </View>
              {item.notes ? (
                <Text style={[styles.notesText, { color: colors.textDim }]} numberOfLines={2}>{item.notes}</Text>
              ) : null}
            </View>
          );
        })}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textDim }]}>Vault is empty</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Securely store API keys, passwords, and notes</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => { setEditItem(null); setShowModal(true); }}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <VaultModal visible={showModal} item={editItem} colors={colors}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        onSave={handleSave}
        onDelete={editItem ? () => handleDelete(editItem.id) : undefined} />
    </View>
  );
}

function VaultModal({ visible, item, onClose, onSave, onDelete, colors }: {
  visible: boolean; item?: VaultItem | null; onClose: () => void;
  onSave: (d: { name: string; value: string; category: VaultItem['category']; notes: string }) => void;
  onDelete?: () => void; colors: any;
}) {
  const [name, setName] = useState(item?.name || '');
  const [value, setValue] = useState(item?.value || '');
  const [category, setCategory] = useState<VaultItem['category']>(item?.category || 'api_key');
  const [notes, setNotes] = useState(item?.notes || '');
  const isEdit = !!item;

  useEffect(() => {
    if (visible) {
      setName(item?.name || '');
      setValue(item?.value || '');
      setCategory(item?.category || 'api_key');
      setNotes(item?.notes || '');
    }
  }, [visible, item]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{isEdit ? 'Edit Item' : 'Add to Vault'}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.textDim} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={[styles.label, { color: colors.textDim }]}>Name *</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={name} onChangeText={setName} placeholder="e.g. OpenAI API Key" placeholderTextColor={colors.textMuted} />
            <Text style={[styles.label, { color: colors.textDim }]}>Value *</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={value} onChangeText={setValue} placeholder="Secret value" placeholderTextColor={colors.textMuted} secureTextEntry />
            <Text style={[styles.label, { color: colors.textDim }]}>Category</Text>
            <View style={styles.catRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity key={c}
                  style={[styles.catPill, { borderColor: category === c ? colors.primary : colors.border }, category === c && { backgroundColor: colors.primaryBg }]}
                  onPress={() => setCategory(c)}>
                  <Ionicons name={CAT_ICONS[c] as any} size={16} color={category === c ? colors.primary : colors.textDim} />
                  <Text style={{ color: category === c ? colors.primary : colors.textDim, fontSize: 13 }}>{CAT_LABELS[c]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.label, { color: colors.textDim }]}>Notes</Text>
            <TextInput style={[styles.modalInput, styles.textarea, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={notes} onChangeText={setNotes} placeholder="Optional notes" placeholderTextColor={colors.textMuted} multiline />
          </ScrollView>
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            {isEdit && onDelete && (
              <TouchableOpacity style={[styles.deleteBtn, { borderColor: colors.error }]}
                onPress={() => Alert.alert('Delete', 'Remove from vault?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: onDelete }])}>
                <Text style={{ color: colors.error, fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (!name.trim() || !value.trim()) { Alert.alert('Error', 'Name and value are required'); return; }
                onSave({ name: name.trim(), value: value.trim(), category, notes: notes.trim() });
              }}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 42, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  list: { padding: 16, gap: 12 },
  vaultCard: { borderRadius: 14, padding: 16, borderWidth: 1 },
  vaultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  vaultInfo: { flex: 1 },
  vaultName: { fontSize: 16, fontWeight: '600' },
  vaultCat: { fontSize: 12, marginTop: 2 },
  valueRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingLeft: 14, height: 42 },
  valueText: { flex: 1, fontSize: 14, fontFamily: 'monospace' },
  actionBtn: { padding: 10 },
  notesText: { fontSize: 13, marginTop: 10, lineHeight: 18 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { fontSize: 14, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '92%', maxHeight: '80%', borderRadius: 18, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalBody: { padding: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, gap: 6 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, gap: 12, borderTopWidth: 1 },
  deleteBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1.5 },
  saveBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
