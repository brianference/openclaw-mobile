import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, useTheme } from '../../src/store/theme';
import { useAuthStore } from '../../src/store/auth';
import { ThemeMode } from '../../src/types';

function SettingRow({ icon, title, subtitle, colors, onPress, rightElement }: {
  icon: string; title: string; subtitle?: string; colors: any; onPress?: () => void; rightElement?: React.ReactNode;
}) {
  const content = (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: `${colors.primary}12` }]}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.rowSub, { color: colors.textDim }]}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />)}
    </View>
  );
  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.6}>{content}</TouchableOpacity> : content;
}

export default function SettingsScreen() {
  const { colors, mode } = useTheme();
  const { setMode } = useThemeStore();
  const { profile, signOut } = useAuthStore();

  const themeLabels: Record<ThemeMode, string> = { system: 'System', light: 'Light', dark: 'Dark' };
  const handleThemePress = () => {
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    const next = modes[(modes.indexOf(mode) + 1) % modes.length];
    setMode(next);
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
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
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
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>APPEARANCE</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow icon="color-palette" title="Theme" subtitle={themeLabels[mode]} colors={colors} onPress={handleThemePress} />
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
        <SettingRow icon="log-out-outline" title="Sign Out" colors={colors} onPress={handleSignOut} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>OpenClaw Mobile</Text>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>Built with Expo + Supabase</Text>
      </View>
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
});
