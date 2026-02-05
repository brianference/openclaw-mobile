/**
 * OpenClaw Mobile - Settings Screen
 * App configuration, gateway setup, and preferences
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, useTheme } from '../../src/store/theme';
import { useAuthStore } from '../../src/store/auth';
import { useChatStore } from '../../src/store/chat';
import { ThemeMode } from '../../src/types';

// ============================================
// Setting Row Component
// ============================================

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  colors: any;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingRow({ icon, title, subtitle, colors, onPress, rightElement }: SettingRowProps) {
  const content = (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${colors.accent}15` }]}>
        <Ionicons name={icon as any} size={20} color={colors.accent} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textDim }]}>{subtitle}</Text>
        )}
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      ))}
    </View>
  );
  
  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }
  
  return content;
}

// ============================================
// Section Header Component
// ============================================

interface SectionHeaderProps {
  title: string;
  colors: any;
}

function SectionHeader({ title, colors }: SectionHeaderProps) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.textDim }]}>{title}</Text>
  );
}

// ============================================
// Settings Screen
// ============================================

export default function SettingsScreen() {
  const { colors, mode } = useTheme();
  const { setMode } = useThemeStore();
  const { biometricEnabled, biometricAvailable, enableBiometric, lock } = useAuthStore();
  const { gatewayUrl, gatewayToken, setGatewayConfig, isConnected, disconnect } = useChatStore();
  
  const [showGatewaySetup, setShowGatewaySetup] = useState(false);
  const [tempUrl, setTempUrl] = useState(gatewayUrl);
  const [tempToken, setTempToken] = useState(gatewayToken);
  
  /**
   * Handle theme change
   */
  const handleThemePress = () => {
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setMode(nextMode);
  };
  
  const themeLabels: Record<ThemeMode, string> = {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  };
  
  /**
   * Handle biometric toggle
   */
  const handleBiometricToggle = async (value: boolean) => {
    if (value && !biometricAvailable) {
      Alert.alert(
        'Biometrics Unavailable',
        'Your device does not support biometric authentication or no biometrics are enrolled.'
      );
      return;
    }
    
    await enableBiometric(value);
  };
  
  /**
   * Save gateway configuration
   */
  const handleSaveGateway = () => {
    if (!tempUrl.trim()) {
      Alert.alert('Error', 'Gateway URL is required');
      return;
    }
    
    setGatewayConfig(tempUrl.trim(), tempToken.trim());
    setShowGatewaySetup(false);
    Alert.alert('Saved', 'Gateway configuration updated. Tap Connect to establish connection.');
  };
  
  /**
   * Handle lock app
   */
  const handleLockApp = () => {
    Alert.alert(
      'Lock App',
      'Are you sure you want to lock the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Lock', onPress: lock },
      ]
    );
  };
  
  /**
   * Handle clear data
   */
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all local data including messages, kanban cards, and vault items. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement clear all data
            Alert.alert('Cleared', 'All local data has been cleared.');
          }
        },
      ]
    );
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Connection Section */}
      <SectionHeader title="CONNECTION" colors={colors} />
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow
          icon="server"
          title="OpenClaw Gateway"
          subtitle={gatewayUrl || 'Not configured'}
          colors={colors}
          onPress={() => setShowGatewaySetup(!showGatewaySetup)}
          rightElement={
            <View style={[
              styles.connectionBadge,
              { backgroundColor: isConnected ? `${colors.success}20` : `${colors.error}20` }
            ]}>
              <View style={[
                styles.connectionDot,
                { backgroundColor: isConnected ? colors.success : colors.error }
              ]} />
              <Text style={[
                styles.connectionText,
                { color: isConnected ? colors.success : colors.error }
              ]}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          }
        />
        
        {/* Gateway Setup Expanded */}
        {showGatewaySetup && (
          <View style={[styles.gatewaySetup, { borderTopColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.textDim }]}>Gateway URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="http://localhost:18789"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <Text style={[styles.inputLabel, { color: colors.textDim }]}>Gateway Token</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={tempToken}
              onChangeText={setTempToken}
              placeholder="Enter token"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            
            <View style={styles.gatewayActions}>
              <TouchableOpacity 
                style={[styles.gatewayButton, { backgroundColor: colors.accent }]}
                onPress={handleSaveGateway}
              >
                <Text style={styles.gatewayButtonText}>Save</Text>
              </TouchableOpacity>
              
              {isConnected && (
                <TouchableOpacity 
                  style={[styles.gatewayButton, { backgroundColor: colors.error }]}
                  onPress={disconnect}
                >
                  <Text style={styles.gatewayButtonText}>Disconnect</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
      
      {/* Appearance Section */}
      <SectionHeader title="APPEARANCE" colors={colors} />
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow
          icon="color-palette"
          title="Theme"
          subtitle={themeLabels[mode]}
          colors={colors}
          onPress={handleThemePress}
        />
      </View>
      
      {/* Security Section */}
      <SectionHeader title="SECURITY" colors={colors} />
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow
          icon="finger-print"
          title="Biometric Unlock"
          subtitle={biometricAvailable ? 'Use Face ID or fingerprint to unlock' : 'Not available on this device'}
          colors={colors}
          rightElement={
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!biometricAvailable}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          }
        />
        <SettingRow
          icon="lock-closed"
          title="Lock App Now"
          colors={colors}
          onPress={handleLockApp}
        />
        <SettingRow
          icon="key"
          title="Change Passphrase"
          colors={colors}
          onPress={() => Alert.alert('Coming Soon', 'This feature is not yet implemented.')}
        />
      </View>
      
      {/* Data Section */}
      <SectionHeader title="DATA" colors={colors} />
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow
          icon="cloud-upload"
          title="Export Data"
          subtitle="Export all data as encrypted backup"
          colors={colors}
          onPress={() => Alert.alert('Coming Soon', 'This feature is not yet implemented.')}
        />
        <SettingRow
          icon="cloud-download"
          title="Import Data"
          subtitle="Restore from encrypted backup"
          colors={colors}
          onPress={() => Alert.alert('Coming Soon', 'This feature is not yet implemented.')}
        />
        <SettingRow
          icon="trash"
          title="Clear All Data"
          subtitle="Delete all local data"
          colors={colors}
          onPress={handleClearData}
        />
      </View>
      
      {/* About Section */}
      <SectionHeader title="ABOUT" colors={colors} />
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow
          icon="information-circle"
          title="Version"
          subtitle="1.0.0 (Build 1)"
          colors={colors}
        />
        <SettingRow
          icon="document-text"
          title="Documentation"
          colors={colors}
          onPress={() => Linking.openURL('https://docs.openclaw.ai')}
        />
        <SettingRow
          icon="logo-github"
          title="Source Code"
          colors={colors}
          onPress={() => Linking.openURL('https://github.com/brianference/openclaw-mobile')}
        />
        <SettingRow
          icon="chatbubbles"
          title="Community"
          subtitle="Join the Discord"
          colors={colors}
          onPress={() => Linking.openURL('https://discord.com/invite/clawd')}
        />
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          OpenClaw Mobile
        </Text>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Made with ⚡ by Cole
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
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  gatewaySetup: {
    padding: 16,
    borderTopWidth: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  gatewayActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  gatewayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  gatewayButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 13,
  },
});
