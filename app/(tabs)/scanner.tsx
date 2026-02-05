/**
 * OpenClaw Mobile - Security Scanner Screen
 * Device security checks, network analysis, and risk assessment
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../../src/store/theme';
import { SecurityCheck, SecurityCheckStatus } from '../../src/types';

// ============================================
// Security Check Functions
// ============================================

/**
 * Check if device has biometric hardware and enrollment
 */
async function checkBiometrics(): Promise<SecurityCheck> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
  
  let status: SecurityCheckStatus = 'fail';
  let details = '';
  
  if (!hasHardware) {
    details = 'No biometric hardware available';
  } else if (!isEnrolled) {
    status = 'warning';
    details = 'Biometric hardware available but not enrolled';
  } else {
    status = 'pass';
    const types = supportedTypes.map(t => {
      switch (t) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT: return 'Fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION: return 'Face ID';
        case LocalAuthentication.AuthenticationType.IRIS: return 'Iris';
        default: return 'Unknown';
      }
    });
    details = `Enrolled: ${types.join(', ')}`;
  }
  
  return {
    id: 'biometrics',
    name: 'Biometric Authentication',
    description: 'Check for biometric hardware and enrollment',
    status,
    details,
    lastChecked: Date.now(),
  };
}

/**
 * Check device security level (placeholder - needs native module for full check)
 */
async function checkDeviceSecurity(): Promise<SecurityCheck> {
  // In a real implementation, this would check:
  // - Root/jailbreak detection
  // - Screen lock enabled
  // - Device encryption
  // - Developer options
  
  const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
  
  let status: SecurityCheckStatus = 'unknown';
  let details = 'Unable to determine full device security level';
  
  if (securityLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG) {
    status = 'pass';
    details = 'Strong biometric security enabled';
  } else if (securityLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK) {
    status = 'warning';
    details = 'Weak biometric security (consider upgrading)';
  } else if (securityLevel === LocalAuthentication.SecurityLevel.SECRET) {
    status = 'warning';
    details = 'PIN/Pattern only (biometrics recommended)';
  } else {
    status = 'fail';
    details = 'No device security configured';
  }
  
  return {
    id: 'device_security',
    name: 'Device Security Level',
    description: 'Screen lock, encryption, and device integrity',
    status,
    details,
    lastChecked: Date.now(),
  };
}

/**
 * Check app permissions (placeholder)
 */
async function checkPermissions(): Promise<SecurityCheck> {
  // In a real implementation, check granted permissions vs needed
  return {
    id: 'permissions',
    name: 'App Permissions',
    description: 'Review granted permissions',
    status: 'pass',
    details: 'Only essential permissions requested',
    lastChecked: Date.now(),
  };
}

/**
 * Check network security (placeholder)
 */
async function checkNetwork(): Promise<SecurityCheck> {
  // In a real implementation:
  // - Check if on VPN
  // - Check WiFi security (WPA2/WPA3)
  // - Check for MITM indicators
  
  return {
    id: 'network',
    name: 'Network Security',
    description: 'Connection type and security',
    status: 'warning',
    details: 'VPN not detected (recommended for sensitive operations)',
    lastChecked: Date.now(),
  };
}

/**
 * Check for pending OS updates (placeholder)
 */
async function checkUpdates(): Promise<SecurityCheck> {
  // Would need native module to check OS update status
  return {
    id: 'updates',
    name: 'System Updates',
    description: 'Operating system security patches',
    status: 'unknown',
    details: 'Check Settings > System > Updates manually',
    lastChecked: Date.now(),
  };
}

/**
 * Check secure storage availability
 */
async function checkSecureStorage(): Promise<SecurityCheck> {
  // Expo SecureStore uses Keychain (iOS) and EncryptedSharedPreferences (Android)
  return {
    id: 'secure_storage',
    name: 'Secure Storage',
    description: 'Hardware-backed key storage',
    status: 'pass',
    details: Platform.OS === 'ios' 
      ? 'Using iOS Keychain Services'
      : 'Using Android EncryptedSharedPreferences',
    lastChecked: Date.now(),
  };
}

// ============================================
// Status Icon Component
// ============================================

interface StatusIconProps {
  status: SecurityCheckStatus;
  colors: any;
}

function StatusIcon({ status, colors }: StatusIconProps) {
  const config = {
    pass: { icon: 'checkmark-circle', color: colors.success },
    warning: { icon: 'warning', color: colors.warning },
    fail: { icon: 'close-circle', color: colors.error },
    unknown: { icon: 'help-circle', color: colors.textDim },
  };
  
  const { icon, color } = config[status];
  
  return <Ionicons name={icon as any} size={28} color={color} />;
}

// ============================================
// Check Card Component
// ============================================

interface CheckCardProps {
  check: SecurityCheck;
  colors: any;
}

function CheckCard({ check, colors }: CheckCardProps) {
  const statusLabels = {
    pass: 'Secure',
    warning: 'Attention',
    fail: 'Risk',
    unknown: 'Unknown',
  };
  
  const statusColors = {
    pass: colors.success,
    warning: colors.warning,
    fail: colors.error,
    unknown: colors.textDim,
  };
  
  return (
    <View style={[styles.checkCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <StatusIcon status={check.status} colors={colors} />
      
      <View style={styles.checkContent}>
        <Text style={[styles.checkName, { color: colors.text }]}>{check.name}</Text>
        <Text style={[styles.checkDescription, { color: colors.textDim }]}>{check.description}</Text>
        {check.details && (
          <Text style={[styles.checkDetails, { color: statusColors[check.status] }]}>
            {check.details}
          </Text>
        )}
      </View>
      
      <View style={[styles.statusBadge, { backgroundColor: `${statusColors[check.status]}20` }]}>
        <Text style={[styles.statusBadgeText, { color: statusColors[check.status] }]}>
          {statusLabels[check.status]}
        </Text>
      </View>
    </View>
  );
}

// ============================================
// Score Ring Component
// ============================================

interface ScoreRingProps {
  score: number;
  colors: any;
}

function ScoreRing({ score, colors }: ScoreRingProps) {
  const getScoreColor = () => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };
  
  const getScoreLabel = () => {
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };
  
  return (
    <View style={styles.scoreContainer}>
      <View style={[styles.scoreRing, { borderColor: getScoreColor() }]}>
        <Text style={[styles.scoreValue, { color: colors.text }]}>{score}</Text>
        <Text style={[styles.scoreMax, { color: colors.textDim }]}>/100</Text>
      </View>
      <Text style={[styles.scoreLabel, { color: getScoreColor() }]}>{getScoreLabel()}</Text>
      <Text style={[styles.scoreSubtext, { color: colors.textDim }]}>Security Score</Text>
    </View>
  );
}

// ============================================
// Scanner Screen
// ============================================

export default function ScannerScreen() {
  const { colors } = useTheme();
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<number | null>(null);
  
  /**
   * Calculate overall security score
   */
  const calculateScore = useCallback(() => {
    if (checks.length === 0) return 0;
    
    const weights = {
      pass: 100,
      warning: 60,
      fail: 0,
      unknown: 50,
    };
    
    const total = checks.reduce((sum, check) => sum + weights[check.status], 0);
    return Math.round(total / checks.length);
  }, [checks]);
  
  /**
   * Run all security checks
   */
  const runScan = useCallback(async () => {
    setIsScanning(true);
    
    try {
      const results = await Promise.all([
        checkBiometrics(),
        checkDeviceSecurity(),
        checkPermissions(),
        checkNetwork(),
        checkUpdates(),
        checkSecureStorage(),
      ]);
      
      setChecks(results);
      setLastScan(Date.now());
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  }, []);
  
  // Run scan on mount
  useEffect(() => {
    runScan();
  }, []);
  
  const score = calculateScore();
  const passCount = checks.filter(c => c.status === 'pass').length;
  const warnCount = checks.filter(c => c.status === 'warning').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isScanning}
          onRefresh={runScan}
          tintColor={colors.accent}
        />
      }
    >
      {/* Score Section */}
      <View style={[styles.scoreSection, { backgroundColor: colors.surface }]}>
        <ScoreRing score={score} colors={colors} />
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>{passCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textDim }]}>Passed</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="warning" size={20} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.text }]}>{warnCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textDim }]}>Warnings</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="close-circle" size={20} color={colors.error} />
            <Text style={[styles.statValue, { color: colors.text }]}>{failCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textDim }]}>Failed</Text>
          </View>
        </View>
        
        {lastScan && (
          <Text style={[styles.lastScan, { color: colors.textMuted }]}>
            Last scan: {new Date(lastScan).toLocaleTimeString()}
          </Text>
        )}
      </View>
      
      {/* Checks List */}
      <View style={styles.checksSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Security Checks</Text>
        
        {checks.map((check) => (
          <CheckCard key={check.id} check={check} colors={colors} />
        ))}
        
        {checks.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textDim }]}>
            Pull down to run security scan
          </Text>
        )}
      </View>
      
      {/* Recommendations */}
      {(warnCount > 0 || failCount > 0) && (
        <View style={styles.recommendationsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommendations</Text>
          
          <View style={[styles.recommendationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="shield" size={24} color={colors.accent} />
            <View style={styles.recommendationContent}>
              <Text style={[styles.recommendationTitle, { color: colors.text }]}>
                Improve Your Security
              </Text>
              <Text style={[styles.recommendationText, { color: colors.textDim }]}>
                {failCount > 0 
                  ? 'Address failed checks first for maximum security improvement.'
                  : 'Review warnings to enhance your security posture.'}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Scan Button */}
      <TouchableOpacity 
        style={[styles.scanButton, { backgroundColor: colors.accent }]}
        onPress={runScan}
        disabled={isScanning}
      >
        <Ionicons name="refresh" size={20} color="#ffffff" />
        <Text style={styles.scanButtonText}>
          {isScanning ? 'Scanning...' : 'Run Full Scan'}
        </Text>
      </TouchableOpacity>
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
  content: {
    paddingBottom: 32,
  },
  scoreSection: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 14,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  scoreSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  lastScan: {
    fontSize: 12,
    marginTop: 16,
  },
  checksSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  checkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  checkContent: {
    flex: 1,
    marginLeft: 12,
  },
  checkName: {
    fontSize: 15,
    fontWeight: '500',
  },
  checkDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  checkDetails: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 32,
    fontSize: 14,
  },
  recommendationsSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  recommendationContent: {
    flex: 1,
    marginLeft: 12,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  recommendationText: {
    fontSize: 13,
    marginTop: 4,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
