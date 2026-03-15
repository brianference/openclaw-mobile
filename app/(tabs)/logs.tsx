/**
 * OpenClaw Mobile - Logs Viewer Screen
 * Real-time system logs and activity history
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/store/theme';

// ============================================
// Types
// ============================================

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
}

// ============================================
// Log Item Component
// ============================================

function LogItem({ item, colors }: { item: LogEntry; colors: any }) {
  const getLevelColor = () => {
    switch (item.level) {
      case 'error': return colors.error;
      case 'warn': return colors.warning || '#FF9500';
      case 'info': return colors.accent;
      case 'debug': return colors.textMuted;
      default: return colors.text;
    }
  };

  const levelColor = getLevelColor();

  return (
    <View style={[styles.logItem, { borderBottomColor: colors.border }]}>
      <View style={styles.logHeader}>
        <View style={[styles.levelBadge, { backgroundColor: `${levelColor}15` }]}>
          <Text style={[styles.levelText, { color: levelColor }]}>
            {item.level.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.textMuted }]}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={[styles.message, { color: colors.text }]}>{item.message}</Text>
      {item.context && (
        <Text style={[styles.context, { color: colors.textDim }]}>{item.context}</Text>
      )}
    </View>
  );
}

// ============================================
// Logs Screen
// ============================================

export default function LogsScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Simulate real-time logs
  useEffect(() => {
    // Initial logs
    const initialLogs: LogEntry[] = [
      { id: '1', timestamp: new Date().toISOString(), level: 'info', message: 'Gateway initialized', context: 'system' },
      { id: '2', timestamp: new Date().toISOString(), level: 'debug', message: 'WebSocket connecting...', context: 'network' },
      { id: '3', timestamp: new Date().toISOString(), level: 'info', message: 'User authenticated', context: 'auth' },
      { id: '4', timestamp: new Date().toISOString(), level: 'warn', message: 'High memory usage detected', context: 'system' },
      { id: '5', timestamp: new Date().toISOString(), level: 'error', message: 'Failed to sync vault', context: 'sync' },
    ];
    setLogs(initialLogs);
    setLoading(false);

    // Live log simulator
    const interval = setInterval(() => {
      const levels: LogLevel[] = ['info', 'debug', 'warn', 'error'];
      const messages = [
        'Cron job executed: PM Orchestrator',
        'Heartbeat received',
        'Search query processed',
        'Attachment uploaded: image.png',
        'Token usage: 1.2k',
        'Cache hit: places_search',
        'Deployment triggered',
      ];
      
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        context: ['system', 'network', 'auth', 'ui', 'sync'][Math.floor(Math.random() * 5)]
      };

      setLogs(prev => [newLog, ...prev].slice(0, 200));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter logs
  useEffect(() => {
    let result = logs;
    
    if (selectedLevel !== 'all') {
      result = result.filter(log => log.level === selectedLevel);
    }
    
    if (searchQuery) {
      result = result.filter(log => 
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.context?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredLogs(result);
  }, [logs, selectedLevel, searchQuery]);

  const handleExport = async () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.level.toUpperCase()}: ${l.message}`).join('\n');
    try {
      await Share.share({
        message: text,
        title: 'OpenClaw System Logs',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClear = () => {
    setLogs([]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header with Filters */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <div style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search logs..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </div>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {(['all', 'info', 'warn', 'error', 'debug'] as const).map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.filterBadge,
                { backgroundColor: selectedLevel === level ? colors.accent : colors.surface }
              ]}
              onPress={() => setSelectedLevel(level)}
            >
              <Text style={[
                styles.filterText,
                { color: selectedLevel === level ? '#ffffff' : colors.textDim }
              ]}>
                {level.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredLogs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <LogItem item={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
          inverted={true} // Newest at bottom for log-style
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No logs found</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Bar */}
      <View style={[styles.floatingBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.barButton} onPress={handleClear}>
          <Ionicons name="trash-outline" size={20} color={colors.textDim} />
          <Text style={[styles.barText, { color: colors.textDim }]}>Clear</Text>
        </TouchableOpacity>
        <View style={[styles.barDivider, { backgroundColor: colors.border }]} />
        <TouchableOpacity style={styles.barButton} onPress={() => setIsAutoScroll(!isAutoScroll)}>
          <Ionicons 
            name={isAutoScroll ? "radio-button-on" : "radio-button-off"} 
            size={20} 
            color={isAutoScroll ? colors.success : colors.textDim} 
          />
          <Text style={[styles.barText, { color: colors.textDim }]}>Live</Text>
        </TouchableOpacity>
        <View style={[styles.barDivider, { backgroundColor: colors.border }]} />
        <TouchableOpacity style={styles.barButton} onPress={handleExport}>
          <Ionicons name="share-outline" size={20} color={colors.textDim} />
          <Text style={[styles.barText, { color: colors.textDim }]}>Export</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  filterRow: {
    marginTop: 12,
    flexDirection: 'row',
  },
  filterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 100,
  },
  logItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  message: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  context: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
  },
  floatingBar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  barButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barText: {
    fontSize: 12,
    fontWeight: '600',
  },
  barDivider: {
    width: 1,
    height: 20,
  },
});
