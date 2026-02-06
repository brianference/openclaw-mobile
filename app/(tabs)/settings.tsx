import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking, Modal, TextInput, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, useTheme, ThemeMode } from '../../src/store/theme';
import { useAuthStore } from '../../src/store/auth';
import { useSubscriptionStore, TIER_CONFIG } from '../../src/store/subscription';
import { useChatStore } from '../../src/store/chat';
import { useToast } from '../../src/components/Toast';
import { supabase } from '../../src/lib/supabase';
import PaywallModal from '../../src/components/PaywallModal';
import { APIEndpointType, APIEndpointConfig } from '../../src/types';

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

function ConnectionModal({ visible, onClose, colors, currentConfig, onSave }: {
  visible: boolean; onClose: () => void; colors: any; currentConfig: APIEndpointConfig;
  onSave: (config: APIEndpointConfig) => void;
}) {
  const [type, setType] = useState<APIEndpointType>(currentConfig.type);
  const [url, setUrl] = useState(currentConfig.url || '');
  const [enabled, setEnabled] = useState(currentConfig.enabled);

  useEffect(() => {
    setType(currentConfig.type);
    setUrl(currentConfig.url || '');
    setEnabled(currentConfig.enabled);
  }, [currentConfig]);

  const handleSave = () => {
    if (type !== 'default' && enabled && !url.trim()) {
      Alert.alert('Error', 'URL is required for custom endpoints');
      return;
    }
    onSave({ type, url: url.trim() || undefined, enabled });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>AI Connection</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textDim} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.text }]}>Use Custom Endpoint</Text>
                <Text style={[styles.helpText, { color: colors.textMuted }]}>
                  Connect to a local or cloud OpenClaw instance
                </Text>
              </View>
              <Switch value={enabled} onValueChange={setEnabled} />
            </View>

            {enabled && (
              <>
                <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Endpoint Type</Text>
                <View style={styles.radioGroup}>
                  {(['default', 'local', 'cloud'] as APIEndpointType[]).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.radioOption,
                        { backgroundColor: type === t ? colors.primaryBg : colors.bg, borderColor: colors.border },
                      ]}
                      onPress={() => setType(t)}
                    >
                      <Ionicons
                        name={type === t ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={type === t ? colors.primary : colors.textMuted}
                      />
                      <Text style={[styles.radioLabel, { color: colors.text }]}>
                        {t === 'default' ? 'Default (Supabase)' : t === 'local' ? 'Local Network' : 'Cloud'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {type !== 'default' && (
                  <>
                    <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>
                      {type === 'local' ? 'Local URL' : 'Cloud URL'}
                    </Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
                      value={url}
                      onChangeText={setUrl}
                      placeholder={type === 'local' ? 'http://192.168.1.100:8000' : 'https://api.openclaw.ai'}
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Text style={[styles.helpText, { color: colors.textMuted }]}>
                      {type === 'local'
                        ? 'Enter your local machine IP address and port'
                        : 'Enter your cloud OpenClaw API endpoint'}
                    </Text>
                  </>
                )}
              </>
            )}
          </View>
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const TIER_BADGES: Record<string, { icon: string; color: string }> = {
  free: { icon: 'flash-outline', color: '#64748b' },
  pro: { icon: 'flash', color: '#0d9488' },
  premium: { icon: 'diamond', color: '#d97706' },
};

export default function SettingsScreen() {
  const { colors, mode } = useTheme();
  const { setMode } = useThemeStore();
  const { profile, signOut, fetchProfile } = useAuthStore();
  const { subscription, fetchSubscription } = useSubscriptionStore();
  const { setCustomEndpoint } = useChatStore();
  const toast = useToast();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showConnection, setShowConnection] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState<APIEndpointConfig>(
    profile?.api_endpoint || { type: 'default', enabled: false }
  );

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (profile?.api_endpoint) {
      setConnectionConfig(profile.api_endpoint);
      setCustomEndpoint(profile.api_endpoint);
    }
  }, [profile]);

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

  const handleUpgrade = (tier: string) => {
    Alert.alert(
      'Upgrade Plan',
      `To upgrade to ${TIER_CONFIG[tier as keyof typeof TIER_CONFIG].name}, payment processing needs to be configured. Contact support for early access.`,
      [{ text: 'OK' }]
    );
  };

  const handleSaveConnection = async (config: APIEndpointConfig) => {
    const { error } = await supabase
      .from('profiles')
      .update({ api_endpoint: config, updated_at: new Date().toISOString() })
      .eq('id', profile!.id);

    if (error) {
      toast.show('Failed to save connection settings', 'error');
    } else {
      setConnectionConfig(config);
      setCustomEndpoint(config);
      await fetchProfile();
      toast.show('Connection settings saved', 'success');
    }
  };

  const currentTier = subscription?.tier || 'free';
  const tierBadge = TIER_BADGES[currentTier];
  const tierConfig = TIER_CONFIG[currentTier];
  const creditsUsed = profile ? tierConfig.credits_per_month - profile.credits : 0;
  const creditsProgress = tierConfig.credits_per_month > 0
    ? Math.min(1, Math.max(0, creditsUsed / tierConfig.credits_per_month))
    : 0;

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
          <View style={[styles.tierBadge, { backgroundColor: `${tierBadge.color}18` }]}>
            <Ionicons name={tierBadge.icon as any} size={14} color={tierBadge.color} />
            <Text style={[styles.tierBadgeText, { color: tierBadge.color }]}>
              {tierConfig.name}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>SUBSCRIPTION</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={[styles.creditsRow, { borderBottomColor: colors.border }]}>
          <View style={styles.creditsInfo}>
            <Text style={[styles.creditsTitle, { color: colors.text }]}>AI Credits</Text>
            <Text style={[styles.creditsCount, { color: colors.primary }]}>
              {profile?.credits ?? 0}
              <Text style={[styles.creditsTotal, { color: colors.textMuted }]}>
                {tierConfig.credits_per_month > 0 ? ` / ${tierConfig.credits_per_month}` : ''}
              </Text>
            </Text>
          </View>
          {tierConfig.credits_per_month > 0 && (
            <View style={[styles.progressBar, { backgroundColor: colors.surface2 }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: creditsProgress > 0.8 ? colors.warning : colors.primary,
                    width: `${(1 - creditsProgress) * 100}%`,
                  },
                ]}
              />
            </View>
          )}
        </View>
        <SettingRow
          icon="rocket-outline"
          title="Upgrade Plan"
          subtitle={currentTier === 'premium' ? 'You have the best plan' : 'Get more credits and features'}
          colors={colors}
          onPress={() => setShowPaywall(true)}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>AI CONNECTION</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow
          icon="server-outline"
          title="Endpoint Configuration"
          subtitle={
            connectionConfig.enabled
              ? `${connectionConfig.type === 'local' ? 'Local' : connectionConfig.type === 'cloud' ? 'Cloud' : 'Default'} ${connectionConfig.url ? `(${connectionConfig.url})` : ''}`
              : 'Using default Supabase endpoint'
          }
          colors={colors}
          onPress={() => setShowConnection(true)}
        />
      </View>

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

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
      />

      <ConnectionModal
        visible={showConnection}
        onClose={() => setShowConnection(false)}
        colors={colors}
        currentConfig={connectionConfig}
        onSave={handleSaveConnection}
      />
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
  tierBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 4 },
  tierBadgeText: { fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginHorizontal: 16, marginTop: 24, marginBottom: 8 },
  section: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  iconBox: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1, marginLeft: 12 },
  rowTitle: { fontSize: 15, fontWeight: '500' },
  rowSub: { fontSize: 13, marginTop: 2 },
  creditsRow: { padding: 16, borderBottomWidth: 1 },
  creditsInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  creditsTitle: { fontSize: 15, fontWeight: '500' },
  creditsCount: { fontSize: 16, fontWeight: '700' },
  creditsTotal: { fontSize: 14, fontWeight: '400' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
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
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  helpText: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  radioGroup: { marginTop: 8, gap: 8 },
  radioOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, gap: 10 },
  radioLabel: { fontSize: 15, fontWeight: '500' },
});
