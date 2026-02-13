import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useTheme } from '../src/store/theme';
import { useDocsStore, DocSection } from '../src/store/docs';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const SECTION_ICONS: Record<DocSection, string> = {
  projects: '🚀',
  skills: '🎯',
  agents: '🤖',
  config: '⚙️',
};

const SECTION_LABELS: Record<DocSection, string> = {
  projects: 'Projects',
  skills: 'Skills',
  agents: 'Agents',
  config: 'Configuration',
};

export default function DocsScreen() {
  const { colors } = useTheme();
  const {
    docs,
    fetchDocs,
    searchQuery,
    setSearchQuery,
    searchDocs,
    getRecentDocs,
    getSectionStats,
  } = useDocsStore();
  
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const sectionStats = getSectionStats();
  const recentDocs = getRecentDocs(5);
  const searchResults = localSearchQuery.trim() ? searchDocs(localSearchQuery) : [];

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);
    setSearchQuery(query);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    searchContainer: {
      padding: 16,
    },
    searchInput: {
      backgroundColor: colors.surface,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      paddingLeft: 40,
    },
    searchIcon: {
      position: 'absolute',
      left: 28,
      top: 28,
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
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    docSection: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    docSectionIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    docSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    docSectionDescription: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 16,
      marginBottom: 8,
    },
    docSectionStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    docSectionStat: {
      fontSize: 11,
      color: colors.textMuted,
    },
    docItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: colors.border,
      flexDirection: 'row',
      gap: 12,
    },
    docIcon: {
      width: 40,
      height: 40,
      backgroundColor: colors.background,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    docIconText: {
      fontSize: 20,
    },
    docDetails: {
      flex: 1,
    },
    docTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    docPath: {
      fontSize: 12,
      color: colors.textMuted,
    },
    docMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    docTime: {
      fontSize: 11,
      color: colors.textMuted,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    badgeNew: {
      backgroundColor: '#818cf8',
    },
    badgeUpdated: {
      backgroundColor: '#34d399',
    },
    badgeText: {
      fontSize: 10,
      color: '#fff',
      fontWeight: '600',
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
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📄 Docs</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search documentation..."
          placeholderTextColor={colors.textMuted}
          value={localSearchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView style={styles.content}>
        {localSearchQuery.trim() ? (
          // Search Results
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Search Results ({searchResults.length})
            </Text>
            {searchResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No docs found</Text>
              </View>
            ) : (
              searchResults.map((doc) => (
                <View key={doc.id} style={styles.docItem}>
                  <View style={styles.docIcon}>
                    <Text style={styles.docIconText}>{SECTION_ICONS[doc.section]}</Text>
                  </View>
                  <View style={styles.docDetails}>
                    <Text style={styles.docTitle}>{doc.title}</Text>
                    <Text style={styles.docPath}>{doc.path}</Text>
                    <View style={styles.docMeta}>
                      <Text style={styles.docTime}>{formatDate(doc.updatedAt)}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          <>
            {/* Doc Sections */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Documentation</Text>
              <View style={styles.grid}>
                {(Object.keys(sectionStats) as DocSection[]).map((section) => {
                  const stats = sectionStats[section];
                  return (
                    <View key={section} style={styles.docSection}>
                      <Text style={styles.docSectionIcon}>{SECTION_ICONS[section]}</Text>
                      <Text style={styles.docSectionTitle}>
                        {SECTION_LABELS[section]}
                      </Text>
                      <Text style={styles.docSectionDescription}>
                        Documentation for {SECTION_LABELS[section].toLowerCase()}
                      </Text>
                      <View style={styles.docSectionStats}>
                        <Text style={styles.docSectionStat}>{stats.count} docs</Text>
                        <Text style={styles.docSectionStat}>•</Text>
                        <Text style={styles.docSectionStat}>
                          {formatDate(stats.lastUpdated)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Recent Docs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Updates</Text>
              {recentDocs.map((doc, index) => {
                const isNew = new Date(doc.createdAt).getTime() > Date.now() - 48 * 60 * 60 * 1000;
                const isUpdated = !isNew && new Date(doc.updatedAt).getTime() > Date.now() - 48 * 60 * 60 * 1000;
                
                return (
                  <View key={doc.id} style={styles.docItem}>
                    <View style={styles.docIcon}>
                      <Text style={styles.docIconText}>{SECTION_ICONS[doc.section]}</Text>
                    </View>
                    <View style={styles.docDetails}>
                      <Text style={styles.docTitle}>{doc.title}</Text>
                      <Text style={styles.docPath}>{doc.path}</Text>
                      <View style={styles.docMeta}>
                        <Text style={styles.docTime}>{formatDate(doc.updatedAt)}</Text>
                        {isNew && (
                          <View style={[styles.badge, styles.badgeNew]}>
                            <Text style={styles.badgeText}>New</Text>
                          </View>
                        )}
                        {isUpdated && (
                          <View style={[styles.badge, styles.badgeUpdated]}>
                            <Text style={styles.badgeText}>Updated</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
