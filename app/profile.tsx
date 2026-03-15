/**
 * OpenClaw Mobile - User Profile Screen
 * Personal information, account settings, and activity stats
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/store/theme';

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  colors: any;
}

function StatCard({ label, value, icon, colors }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon as any} size={20} color={colors.accent} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

// ============================================
// Profile Screen
// ============================================

export default function ProfileScreen() {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Brian');
  const [email, setEmail] = useState('brian@openclaw.ai');

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: 'https://avatar.vercel.sh/brian' }} 
            style={[styles.avatar, { borderColor: colors.accent }]} 
          />
          <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: colors.accent }]}>
            <Ionicons name="camera" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
              value={name}
              onChangeText={setName}
              placeholder="Name"
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => setIsEditing(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
            <Text style={[styles.email, { color: colors.textDim }]}>{email}</Text>
            <TouchableOpacity 
              style={[styles.editBtn, { borderColor: colors.border }]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={[styles.editBtnText, { color: colors.text }]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label="Tasks" value="156" icon="checkbox-outline" colors={colors} />
        <StatCard label="Ideas" value="42" icon="bulb-outline" colors={colors} />
        <StatCard label="Trips" value="3" icon="map-outline" colors={colors} />
      </View>

      {/* Connected Services */}
      <Text style={[styles.sectionTitle, { color: colors.textDim }]}>CONNECTED SERVICES</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={[styles.serviceRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="logo-github" size={24} color={colors.text} />
          <Text style={[styles.serviceName, { color: colors.text }]}>GitHub</Text>
          <Text style={[styles.serviceStatus, { color: colors.success }]}>Connected</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.serviceRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="logo-google" size={24} color="#EA4335" />
          <Text style={[styles.serviceName, { color: colors.text }]}>Google Cloud</Text>
          <Text style={[styles.serviceStatus, { color: colors.textMuted }]}>Not Linked</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.serviceRow}>
          <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
          <Text style={[styles.serviceName, { color: colors.text }]}>X (Twitter)</Text>
          <Text style={[styles.serviceStatus, { color: colors.success }]}>Connected</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <Text style={[styles.sectionTitle, { color: colors.textDim }]}>ACCOUNT ACTIONS</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={[styles.actionRow, { borderBottomColor: colors.border }]} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.actionName, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={24} color={colors.error} />
          <Text style={[styles.actionName, { color: colors.error }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          User ID: brian-9284-771
        </Text>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Joined February 2026
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 64,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    marginTop: 4,
  },
  editBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editForm: {
    width: '100%',
    gap: 12,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  editActions: {
    marginTop: 8,
    gap: 8,
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 32,
    overflow: 'hidden',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  serviceName: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  serviceStatus: {
    fontSize: 13,
    marginRight: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  actionName: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 64,
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
  },
});
