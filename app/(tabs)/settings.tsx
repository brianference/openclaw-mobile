import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, useTheme, ThemeMode } from '../../src/store/theme';
import { useAuthStore } from '../../src/store/auth';
import { useToast } from '../../src/components/Toast';
import { supabase } from '../../src/lib/supabase';

function SettingRow({ icon, title, subtitle, colors, onPress, rightElement, danger }: {
  icon: string; title: string; subtitle?: string; colors: any; onPress?: () => void;
  rightElement?: React.ReactNode; danger?: boolean;
}) {
  const content = (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: danger ? `${colors.error}12` : `${colors.primary}12` }]}>
        <Ionicons name={icon as any} size={20} color={danger ? colors.error : colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: danger ? colors.error : colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.rowSub, { color: colors.textDim }]}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />)}
    </View>
  );
  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.6}>{content}</TouchableOpacity> : content;
}

function ProfileEditModal({ visible, onClose, colors, currentName, onSave }: {
  visible: boolean; onClose: () => void; colors: any; currentName: string;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(currentName);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textDim} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={[styles.label, { color: colors.textDim }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
          </View>
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (!name.trim()) { Alert.alert('Error', 'Name is required'); return; }
                onSave(name.trim());
                onClose();
              }}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const { colors, mode } = useTheme();
  const { setMode } = useThemeStore();
  const { profile, signOut, fetchProfile } = useAuthStore();
  const toast = useToast();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const themeLabels: Record<ThemeMode, string> = { system: 'System', light: 'Light', dark: 'Dark' };
  const themeIcons: Record<ThemeMode, string> = { system: 'phone-portrait-outline', light: 'sunny-outline', dark: 'moon-outline' };

  const handleThemePress = () => {
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    const next = modes[(modes.indexOf(mode) + 1) % modes.length];
    setMode(next);
  };

  const handleUpdateProfile = async (name: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name, updated_at: new Date().toISOString() })
      .eq('id', profile!.id);

    if (error) {
      toast.show('Failed to update profile', 'error');
    } else {
      await fetchProfile();
      toast.show('Profile updated', 'success');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {profile && (
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: colors.surface }]}
          onPress={() => setShowEditProfile(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primaryBg }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(profile.display_name || profile.email).charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{profile.display_name}</Text>
            <Text style={[styles.profileEmail, { color: colors.textDim }]}>{profile.email}</Text>
          </View>
          <View style={[styles.creditsBadge, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="flash" size={14} color={colors.primary} />
            <Text style={[styles.creditsText, { color: colors.primary }]}>{profile.credits}</Text>
          </View>
        </TouchableOpacity>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>PREFERENCES</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow
          icon={themeIcons[mode]}
          title="Theme"
          subtitle={themeLabels[mode]}
          colors={colors}
          onPress={handleThemePress}
        />
        <SettingRow
          icon="person-outline"
          title="Edit Profile"
          subtitle="Change your display name"
          colors={colors}
          onPress={() => setShowEditProfile(true)}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ABOUT</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow icon="information-circle" title="Version" subtitle="1.0.0" colors={colors} />
        <SettingRow icon="document-text" title="Documentation" colors={colors}
          onPress={() => Linking.openURL('https://docs.openclaw.ai')} />
        <SettingRow icon="logo-github" title="Source Code" colors={colors}
          onPress={() => Linking.openURL('https://github.com/brianference/openclaw-mobile')} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ACCOUNT</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow icon="log-out-outline" title="Sign Out" colors={colors} onPress={handleSignOut} danger />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>OpenClaw Mobile v1.0.0</Text>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>Built with Expo + Supabase</Text>
      </View>

      {profile && (
        <ProfileEditModal
          visible={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          colors={colors}
          currentName={profile.display_name}
          onSave={handleUpdateProfile}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 16, gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '600' },
  profileEmail: { fontSize: 13, marginTop: 2 },
  creditsBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 4 },
  creditsText: { fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginHorizontal: 16, marginTop: 24, marginBottom: 8 },
  section: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  iconBox: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1, marginLeft: 12 },
  rowTitle: { fontSize: 15, fontWeight: '500' },
  rowSub: { fontSize: 13, marginTop: 2 },
  footer: { alignItems: 'center', paddingVertical: 32 },
  footerText: { fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '88%', borderRadius: 18, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalBody: { padding: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, borderTopWidth: 1 },
  saveBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
