/**
 * OpenClaw Mobile - Kanban Board Screen
 * Drag-and-drop task management synced with web kanban
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useKanbanStore } from '../../src/store/kanban';
import { useTheme } from '../../src/store/theme';
import { KanbanCard, ColumnId, Priority } from '../../src/types';

// ============================================
// Priority Badge Component
// ============================================

interface PriorityBadgeProps {
  priority: Priority;
  colors: any;
}

function PriorityBadge({ priority, colors }: PriorityBadgeProps) {
  const priorityColors = {
    high: colors.priorityHigh,
    medium: colors.priorityMedium,
    low: colors.priorityLow,
  };
  
  return (
    <View style={[styles.priorityBadge, { backgroundColor: `${priorityColors[priority]}20` }]}>
      <View style={[styles.priorityDot, { backgroundColor: priorityColors[priority] }]} />
      <Text style={[styles.priorityText, { color: priorityColors[priority] }]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Text>
    </View>
  );
}

// ============================================
// Card Component
// ============================================

interface CardProps {
  card: KanbanCard;
  columnId: ColumnId;
  colors: any;
  onPress: () => void;
  onMove: (toColumn: ColumnId) => void;
}

function Card({ card, columnId, colors, onPress, onMove }: CardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  
  const columns: ColumnId[] = ['backlog', 'progress', 'done'];
  const otherColumns = columns.filter(c => c !== columnId);
  
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      onLongPress={() => setShowMoveMenu(true)}
    >
      <PriorityBadge priority={card.priority} colors={colors} />
      
      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
        {card.title}
      </Text>
      
      {card.description && (
        <Text style={[styles.cardDescription, { color: colors.textDim }]} numberOfLines={2}>
          {card.description}
        </Text>
      )}
      
      {/* Tags */}
      {card.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {card.tags.slice(0, 3).map((tag, index) => (
            <View 
              key={index} 
              style={[styles.tag, { backgroundColor: colors.tagDefault.bg }]}
            >
              <Text style={[styles.tagText, { color: colors.tagDefault.text }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Move Menu Modal */}
      <Modal
        visible={showMoveMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoveMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoveMenu(false)}
        >
          <View style={[styles.moveMenu, { backgroundColor: colors.surface }]}>
            <Text style={[styles.moveMenuTitle, { color: colors.text }]}>Move to</Text>
            {otherColumns.map((col) => (
              <TouchableOpacity
                key={col}
                style={[styles.moveMenuItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  onMove(col);
                  setShowMoveMenu(false);
                }}
              >
                <Text style={[styles.moveMenuItemText, { color: colors.text }]}>
                  {col === 'backlog' ? 'Backlog' : col === 'progress' ? 'In Progress' : 'Done'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
}

// ============================================
// Column Component
// ============================================

interface ColumnProps {
  title: string;
  columnId: ColumnId;
  cards: KanbanCard[];
  colors: any;
  onAddCard: () => void;
  onCardPress: (card: KanbanCard) => void;
  onMoveCard: (cardId: string, toColumn: ColumnId) => void;
}

function Column({ title, columnId, cards, colors, onAddCard, onCardPress, onMoveCard }: ColumnProps) {
  const columnColors = {
    backlog: colors.accent,
    progress: colors.warning,
    done: colors.success,
  };
  
  return (
    <View style={[styles.column, { backgroundColor: colors.surface2 }]}>
      {/* Column Header */}
      <View style={styles.columnHeader}>
        <View style={[styles.columnIndicator, { backgroundColor: columnColors[columnId] }]} />
        <Text style={[styles.columnTitle, { color: colors.text }]}>{title}</Text>
        <View style={[styles.cardCount, { backgroundColor: colors.border }]}>
          <Text style={[styles.cardCountText, { color: colors.textDim }]}>{cards.length}</Text>
        </View>
        <TouchableOpacity onPress={onAddCard} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>
      
      {/* Cards */}
      <ScrollView style={styles.cardsList} showsVerticalScrollIndicator={false}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            columnId={columnId}
            colors={colors}
            onPress={() => onCardPress(card)}
            onMove={(toColumn) => onMoveCard(card.id, toColumn)}
          />
        ))}
        {cards.length === 0 && (
          <Text style={[styles.emptyColumn, { color: colors.textMuted }]}>
            No cards
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================
// Add/Edit Card Modal
// ============================================

interface CardModalProps {
  visible: boolean;
  card?: KanbanCard | null;
  onClose: () => void;
  onSave: (data: { title: string; description: string; priority: Priority; tags: string[] }) => void;
  onDelete?: () => void;
  colors: any;
}

function CardModal({ visible, card, onClose, onSave, onDelete, colors }: CardModalProps) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [priority, setPriority] = useState<Priority>(card?.priority || 'medium');
  const [tagsText, setTagsText] = useState(card?.tags.join(', ') || '');
  
  const isEdit = !!card;
  
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    
    const tags = tagsText
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    onSave({ title: title.trim(), description: description.trim(), priority, tags });
    onClose();
  };
  
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.cardModal, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {isEdit ? 'Edit Card' : 'New Card'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textDim} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Title */}
            <Text style={[styles.inputLabel, { color: colors.textDim }]}>Title *</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title"
              placeholderTextColor={colors.textMuted}
            />
            
            {/* Description */}
            <Text style={[styles.inputLabel, { color: colors.textDim }]}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextarea, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
            
            {/* Priority */}
            <Text style={[styles.inputLabel, { color: colors.textDim }]}>Priority</Text>
            <View style={styles.prioritySelector}>
              {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    priority === p && styles.priorityOptionSelected,
                    { borderColor: priority === p ? colors.accent : colors.border }
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <PriorityBadge priority={p} colors={colors} />
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Tags */}
            <Text style={[styles.inputLabel, { color: colors.textDim }]}>Tags (comma-separated)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={tagsText}
              onChangeText={setTagsText}
              placeholder="coding, research, urgent"
              placeholderTextColor={colors.textMuted}
            />
          </ScrollView>
          
          {/* Actions */}
          <View style={styles.modalActions}>
            {isEdit && onDelete && (
              <TouchableOpacity 
                style={[styles.deleteButton, { borderColor: colors.error }]}
                onPress={() => {
                  Alert.alert('Delete Card', 'Are you sure?', [
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
// Kanban Screen
// ============================================

export default function KanbanScreen() {
  const { colors } = useTheme();
  const { columns, addCard, updateCard, moveCard, deleteCard, isSyncing, syncFromWeb } = useKanbanStore();
  
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [addToColumn, setAddToColumn] = useState<ColumnId | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const handleAddCard = (columnId: ColumnId) => {
    setSelectedCard(null);
    setAddToColumn(columnId);
    setShowModal(true);
  };
  
  const handleEditCard = (card: KanbanCard) => {
    setSelectedCard(card);
    setAddToColumn(null);
    setShowModal(true);
  };
  
  const handleSaveCard = (data: { title: string; description: string; priority: Priority; tags: string[] }) => {
    if (selectedCard) {
      // Edit existing
      updateCard(selectedCard.id, data);
    } else if (addToColumn) {
      // Add new
      addCard(addToColumn, data);
    }
  };
  
  const handleDeleteCard = () => {
    if (selectedCard) {
      const column = columns.find(c => c.cards.some(card => card.id === selectedCard.id));
      if (column) {
        deleteCard(selectedCard.id, column.id);
      }
    }
    setShowModal(false);
  };
  
  const handleMoveCard = (cardId: string, toColumn: ColumnId) => {
    const fromColumn = columns.find(c => c.cards.some(card => card.id === cardId));
    if (fromColumn) {
      moveCard(cardId, fromColumn.id, toColumn);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Sync Status */}
      {isSyncing && (
        <View style={[styles.syncBar, { backgroundColor: colors.accent }]}>
          <Text style={styles.syncBarText}>Syncing...</Text>
        </View>
      )}
      
      {/* Columns */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.columnsContainer}
      >
        {columns.map((column) => (
          <Column
            key={column.id}
            title={column.title}
            columnId={column.id}
            cards={column.cards}
            colors={colors}
            onAddCard={() => handleAddCard(column.id)}
            onCardPress={handleEditCard}
            onMoveCard={handleMoveCard}
          />
        ))}
      </ScrollView>
      
      {/* Card Modal */}
      <CardModal
        visible={showModal}
        card={selectedCard}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCard}
        onDelete={selectedCard ? handleDeleteCard : undefined}
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
  syncBar: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  syncBarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  columnsContainer: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  column: {
    width: 300,
    marginHorizontal: 8,
    borderRadius: 12,
    padding: 12,
    maxHeight: '100%',
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  columnIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  cardCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  cardCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    padding: 4,
  },
  cardsList: {
    flex: 1,
  },
  emptyColumn: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  card: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
  },
  cardDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveMenu: {
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
  },
  moveMenuTitle: {
    fontSize: 14,
    fontWeight: '600',
    padding: 12,
  },
  moveMenuItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  moveMenuItemText: {
    fontSize: 16,
  },
  cardModal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
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
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  priorityOptionSelected: {
    borderWidth: 2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
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
