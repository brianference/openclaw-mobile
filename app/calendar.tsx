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
import { useCalendarStore, CalendarEvent } from '../src/store/calendar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const { events, fetchEvents, addEvent, updateEvent, deleteEvent, getUpcomingEvents } = useCalendarStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date().toISOString(),
    endTime: '',
    allDay: false,
    tags: [] as string[],
    reminder: 30,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    if (editingEvent) {
      await updateEvent(editingEvent.id, formData);
    } else {
      await addEvent(formData);
    }

    setModalVisible(false);
    resetForm();
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startTime: event.startTime,
      endTime: event.endTime || '',
      allDay: event.allDay,
      tags: event.tags,
      reminder: event.reminder || 30,
    });
    setModalVisible(true);
  };

  const handleDelete = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      startTime: new Date().toISOString(),
      endTime: '',
      allDay: false,
      tags: [],
      reminder: 30,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const upcomingEvents = getUpcomingEvents(10);

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
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    eventCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: colors.border,
      flexDirection: 'row',
      gap: 12,
    },
    eventTime: {
      alignItems: 'center',
      minWidth: 60,
    },
    eventDate: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    eventHour: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    eventDetails: {
      flex: 1,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    eventDescription: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 8,
    },
    eventTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
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
    eventActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    editButton: {
      backgroundColor: colors.primary,
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
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
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
      height: 80,
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
        <Text style={styles.headerTitle}>📅 Calendar</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Event</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          
          {upcomingEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No upcoming events</Text>
            </View>
          ) : (
            upcomingEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventTime}>
                  <Text style={styles.eventDate}>{formatDate(event.startTime)}</Text>
                  <Text style={styles.eventHour}>
                    {event.allDay ? 'All Day' : formatTime(event.startTime)}
                  </Text>
                </View>
                
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.description && (
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                  )}
                  
                  {event.tags.length > 0 && (
                    <View style={styles.eventTags}>
                      {event.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  <View style={styles.eventActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEdit(event)}
                    >
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(event.id)}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {editingEvent ? 'Edit Event' : 'New Event'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Event title"
              placeholderTextColor={colors.textMuted}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
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
