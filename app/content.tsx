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
import { useContentStore, ContentItem, ContentStatus } from '../src/store/content';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const STATUS_COLORS = {
  draft: '#fb923c',
  scheduled: '#818cf8',
  published: '#34d399',
};

const STATUS_LABELS = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
};

export default function ContentScreen() {
  const { colors } = useTheme();
  const {
    items,
    fetchContent,
    addDraft,
    updateContent,
    deleteContent,
    publishContent,
    getStats,
  } = useContentStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    body: '',
    platform: 'blog' as 'twitter' | 'blog' | 'linkedin' | 'other',
    tags: [] as string[],
  });

  const stats = getStats();

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    if (editingItem) {
      await updateContent(editingItem.id, formData);
    } else {
      await addDraft(formData);
    }

    setModalVisible(false);
    resetForm();
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      excerpt: item.excerpt,
      body: item.body,
      platform: item.platform,
      tags: item.tags,
    });
    setModalVisible(true);
  };

  const handleDelete = async (itemId: string) => {
    await deleteContent(itemId);
  };

  const handlePublish = async (itemId: string) => {
    await publishContent(itemId);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      excerpt: '',
      body: '',
      platform: 'blog',
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
    statsRow: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
    },
    contentList: {
      padding: 16,
    },
    contentItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    contentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    contentTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
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
    contentMeta: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 8,
    },
    contentExcerpt: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
      marginBottom: 12,
    },
    contentFooter: {
      flexDirection: 'row',
      gap: 8,
    },
    editButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    publishButton: {
      backgroundColor: '#34d399',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    deleteButton: {
      backgroundColor: '#f87171',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 12,
    },
    contentStats: {
      flexDirection: 'row',
      gap: 12,
    },
    contentStat: {
      fontSize: 12,
      color: colors.textMuted,
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
        <Text style={styles.headerTitle}>📝 Content</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Draft</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Drafts</Text>
            <Text style={styles.statValue}>{stats.drafts}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Scheduled</Text>
            <Text style={styles.statValue}>{stats.scheduled}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Published (30d)</Text>
            <Text style={styles.statValue}>{stats.published30d}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Reach</Text>
            <Text style={styles.statValue}>
              {stats.totalReach >= 1000
                ? `${(stats.totalReach / 1000).toFixed(1)}K`
                : stats.totalReach}
            </Text>
          </View>
        </View>

        {/* Content List */}
        <View style={styles.contentList}>
          {items.map((item) => (
            <View key={item.id} style={styles.contentItem}>
              <View style={styles.contentHeader}>
                <Text style={styles.contentTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                  <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
                </View>
              </View>
              
              <Text style={styles.contentMeta}>
                {item.platform} • {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
              
              <Text style={styles.contentExcerpt} numberOfLines={2}>
                {item.excerpt}
              </Text>
              
              {item.status === 'published' && item.stats ? (
                <View style={styles.contentStats}>
                  <Text style={styles.contentStat}>👁️ {item.stats.views.toLocaleString()} views</Text>
                  <Text style={styles.contentStat}>💬 {item.stats.comments} comments</Text>
                  <Text style={styles.contentStat}>❤️ {item.stats.likes} likes</Text>
                </View>
              ) : (
                <View style={styles.contentFooter}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(item)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  {item.status === 'draft' && (
                    <TouchableOpacity
                      style={styles.publishButton}
                      onPress={() => handlePublish(item.id)}
                    >
                      <Text style={styles.buttonText}>Publish</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>
                {editingItem ? 'Edit Content' : 'New Draft'}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Title"
                placeholderTextColor={colors.textMuted}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Excerpt"
                placeholderTextColor={colors.textMuted}
                value={formData.excerpt}
                onChangeText={(text) => setFormData({ ...formData, excerpt: text })}
                multiline
              />
              
              <TextInput
                style={[styles.input, { height: 150 }]}
                placeholder="Body"
                placeholderTextColor={colors.textMuted}
                value={formData.body}
                onChangeText={(text) => setFormData({ ...formData, body: text })}
                multiline
                textAlignVertical="top"
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
                  <Text style={styles.buttonText}>Save Draft</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
