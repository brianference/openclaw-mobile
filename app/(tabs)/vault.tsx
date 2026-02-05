/**
 * OpenClaw Mobile - Secrets Vault Screen
 * Encrypted local storage for API keys, passwords, and secure notes
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/store/theme';
import { VaultItem, SecretCategory } from '../../src/types';

// ============================================
// Mock Vault Store (TODO: Implement full store)
// ============================================

// ⚠️ WARNING: Encryption NOT yet implemented
// Secrets are stored locally but NOT encrypted
// TODO: Implement AES-256-GCM encryption before production release
const ENCRYPTION_WARNING = true;

// Temporary mock data - will be replaced with real encrypted store
const MOCK_ITEMS: VaultItem[] = [];

// ============================================
// Category Icon Component
// ============================================

interface CategoryIconProps {
  category: SecretCategory;
  size?: number;
  color: string;
}

function CategoryIcon({ category, size = 24, color }: CategoryIconProps) {
  const icons: Record<SecretCategory, string> = {
    api_key: 'key',
    password: 'lock-closed',
    note: 'document-text',
    other: 'ellipsis-horizontal-circle',
  };
  
  return <Ionicons name={icons[category] as any} size={size} color={color} />;
}

// ============================================
// Vault Item Component
// ============================================

interface VaultItemRowProps {
  item: VaultItem;
  colors: any;
  onPress: () => void;
  onCopy: () => void;
}

function VaultItemRow({ item, colors, onPress, onCopy }: VaultItemRowProps) {
  const categoryLabels: Record<SecretCategory, string> = {
    api_key: 'API Key',
    password: 'Password',
    note: 'Secure Note',
    other: 'Other',
  };
  
  return (
    <TouchableOpacity 
      style={[styles.itemRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.itemIcon, { backgroundColor: `${colors.accent}15` }]}>
        <CategoryIcon category={item.category} color={colors.accent} />
      </View>
      
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemCategory, { color: colors.textDim }]}>
          {categoryLabels[item.category]}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.copyButton} onPress={onCopy}>
        <Ionicons name="copy-outline" size={20} color={colors.textDim} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ============================================
// Add/Edit Item Modal
// ============================================

interface ItemModalProps {
  visible: boolean;
  item?: VaultItem | null;
  onClose: () => void;
  onSave: (data: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: () => void;
  colors: any;
}

function ItemModal({ visible, item, onClose, onSave, onDelete, colors }: ItemModalProps) {
  const [name, setName] = useState(item?.name || '');
  const [value, setValue] = useState(item?.value || '');
  const [category, setCategory] = useState<SecretCategory>(item?.category || 'api_key');
  const [notes, setNotes] = useState(item?.notes || '');
  const [showValue, setShowValue] = useState(false);
  
  const isEdit = !!item;
  
  const categories: { id: SecretCategory; label: string }[] = [
    { id: 'api_key', label: 'API Key' },
    { id: 'password', label: 'Password' },
    { id: 'note', label: 'Secure Note' },
    { id: 'other', label: 'Other' },
  ];
  
  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!value.trim()) {
      Alert.alert('Error', 'Value is required');
      return;
    }
    
    onSave({ name: name.trim(), value: value.trim(), category, notes: notes.trim() });
    onClose();
  };
  
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {isEdit ? 'Edit Secret' : 'New Secret'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textDim} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            {/* Name */}
            <Text style={[styles.inputLabel, { color: colors.textDim }]}>Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g., GitHub Token"
              placeholderTextColor={colors.textMuted}
            />
            
            {/* Category */}
            <Text style={[styles.inputLabel, { color: colors.textDim }]}>Category</Text>
            <View style={styles.categorySelector}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    { borderColor: category === cat.id ? colors.accent : colors.border },
                    category === cat.id && { backgroundColor: `${colors.accent}15` },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <CategoryIcon category={cat.id} size={18} color={category === cat.id ? colors.accent : colors.textDim} />
                  <Text style={[
                    styles.categoryLabel,
                    { color: category === cat.id ? colors.accent : colors.textDim }
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Value */}
            <Text style={[styles.inputLabel, { color: colors.textDim }]}>Value *</Text>
            <View style={styles.valueInputContainer}>
              <TextInput
                style={[styles.input, styles.valueInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
                value={value}
                onChangeText={setValue}
                placeholder="Enter secret value"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showValue}
                multiline={category === 'note'}
                numberOfLines={category === 'note' ? 4 : 1}
              />
              {category !== 'note' && (
                <TouchableOpacity 
                  style={styles.showValueButton}
                  onPress={() => setShowValue(!showValue)}
                >
                  <Ionicons 
                    name={showValue ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={colors.textDim} 
                  />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Notes */}
            <Text style={[styles.inputLabel, { color: colors.textDim }]}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={2}
            />
          </View>
          
          {/* Actions */}
          <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
            {isEdit && onDelete && (
              <TouchableOpacity 
                style={[styles.deleteButton, { borderColor: colors.error }]}
                onPress={() => {
                  Alert.alert('Delete Secret', 'This cannot be undone.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: onDelete },
                  ]);
                }}
              >
                <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// Vault Screen
// ============================================

export default function VaultScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState<VaultItem[]>(MOCK_ITEMS);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter items by search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleCopyValue = useCallback((item: VaultItem) => {
    // In real implementation, decrypt value first
    Clipboard.setString(item.value);
    Alert.alert('Copied', `${item.name} copied to clipboard.\nWill clear in 30 seconds.`);
    
    // Auto-clear clipboard after 30 seconds
    setTimeout(() => {
      Clipboard.setString('');
    }, 30000);
  }, []);
  
  const handleSaveItem = (data: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedItem) {
      // Update existing
      setItems(items.map(item =>
        item.id === selectedItem.id
          ? { ...item, ...data, updatedAt: Date.now() }
          : item
      ));
    } else {
      // Add new
      const newItem: VaultItem = {
        ...data,
        id: `vault_${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setItems([newItem, ...items]);
    }
  };
  
  const handleDeleteItem = () => {
    if (selectedItem) {
      setItems(items.filter(item => item.id !== selectedItem.id));
    }
    setShowModal(false);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Security Warning Banner */}
      {ENCRYPTION_WARNING && (
        <View style={[styles.warningBanner, { backgroundColor: colors.warning }]}>
          <Ionicons name="warning" size={18} color="#000" />
          <Text style={styles.warningText}>
            ⚠️ Preview Mode — Encryption not yet implemented. Do not store real secrets.
          </Text>
        </View>
      )}
      
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textDim} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search secrets..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VaultItemRow
            item={item}
            colors={colors}
            onPress={() => {
              setSelectedItem(item);
              setShowModal(true);
            }}
            onCopy={() => handleCopyValue(item)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="lock-closed-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textDim }]}>
              {searchQuery ? 'No secrets found' : 'No secrets yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              Tap + to add your first secret
            </Text>
          </View>
        }
      />
      
      {/* Add Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={() => {
          setSelectedItem(null);
          setShowModal(true);
        }}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
      
      {/* Item Modal */}
      <ItemModal
        visible={showModal}
        item={selectedItem}
        onClose={() => setShowModal(false)}
        onSave={handleSaveItem}
        onDelete={selectedItem ? handleDeleteItem : undefined}
        colors={colors}
      />
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemCategory: {
    fontSize: 13,
    marginTop: 2,
  },
  copyButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxHeight: '85%',
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueInput: {
    flex: 1,
  },
  showValueButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 13,
    marginLeft: 6,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
