import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../src/store/theme';
import { useIdeasStore, Idea, IdeaStatus, IdeaPriority } from '../src/store/ideas';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const STATUS_COLORS = {
  new: '#818cf8',
  'in-progress': '#fb923c',
  done: '#34d399',
};

const STATUS_LABELS = {
  new: 'New',
  'in-progress': 'In Progress',
  done: 'Done',
};

const PRIORITY_COLORS = {
  low: '#9ca3af',
  medium: '#fb923c',
  high: '#f87171',
};

export default function IdeasScreen() {
  const { colors } = useTheme();
  const { ideas, fetchIdeas, addIdea, updateIdea, deleteIdea } = useIdeasStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'new' as IdeaStatus,
    priority: 'medium' as IdeaPriority,
    tags: [] as string[],
  });

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    if (editingIdea) {
      await updateIdea(editingIdea.id, formData);
    } else {
      await addIdea(formData);
    }

    setModalVisible(false);
    resetForm();
  };

  const handleEdit = (idea: Idea) => {
    setEditingIdea(idea);
    setFormData({
      title: idea.title,
      description: idea.description,
      status: idea.status,
      priority: idea.priority || 'medium',
      tags: idea.tags,
    });
    setModalVisible(true);
  };

  const handleDelete = async (ideaId: string) => {
    await deleteIdea(ideaId);
  };

  const resetForm = () => {
    setEditingIdea(null);
    setFormData({
      title: '',
      description: '',
      status: 'new',
      priority: 'medium',
      tags: [],
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
    content: {
      flex: 1,
    },
    grid: {
      padding: 16,
      gap: 12,
    },
    ideaCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    ideaHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '600',
    },
    ideaTime: {
      fontSize: 11,
      color: colors.textMuted,
    },
    ideaTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    ideaDescription: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
      marginBottom: 12,
    },
    ideaTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12,
    },
    tag: {
      backgroundColor: colors.background,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    tagText: {
      fontSize: 11,
      color: colors.textMuted,
    },
    ideaActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    editButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: 'center',
    },
    deleteButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: 'center',
      backgroundColor: '#f87171',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 13,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      marginBottom: 12,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: colors.text,
      fontWeight: '600',
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💡 Ideas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.grid}>
        {ideas.map((idea) => (
          <View key={idea.id} style={styles.ideaCard}>
            <View style={styles.ideaHeader}>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[idea.status] }]}>
                <Text style={styles.statusText}>{STATUS_LABELS[idea.status]}</Text>
              </View>
              <Text style={styles.ideaTime}>
                {new Date(idea.updatedAt).toLocaleDateString()}
              </Text>
            </View>
            
            <Text style={styles.ideaTitle}>{idea.title}</Text>
            <Text style={styles.ideaDescription} numberOfLines={3}>
              {idea.description}
            </Text>
            
            <View style={styles.ideaTags}>
              {idea.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.ideaActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(idea)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(idea.id)}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {editingIdea ? 'Edit Idea' : 'New Idea'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Idea title"
              placeholderTextColor={colors.textMuted}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor={colors.textMuted}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
