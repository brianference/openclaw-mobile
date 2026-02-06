import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/theme';
import { TIER_CONFIG, useSubscriptionStore } from '../store/subscription';
import { SubscriptionTier } from '../types';

const TIER_ORDER: SubscriptionTier[] = ['free', 'pro', 'premium'];

const TIER_ACCENTS: Record<SubscriptionTier, { gradient: string; badge: string }> = {
  free: { gradient: '#64748b', badge: '#94a3b8' },
  pro: { gradient: '#0d9488', badge: '#14b8a6' },
  premium: { gradient: '#d97706', badge: '#f59e0b' },
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: (tier: SubscriptionTier) => void;
}

export default function PaywallModal({ visible, onClose, onUpgrade }: Props) {
  const { colors } = useTheme();
  const currentTier = useSubscriptionStore((s) => s.getTier());

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Choose Your Plan</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.textDim} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primaryBg }]}>
              <Ionicons name="flash" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Unlock More Power</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textDim }]}>
              Get more AI credits, unlimited features, and priority support
            </Text>
          </View>

          {TIER_ORDER.map((tierId) => {
            const tier = TIER_CONFIG[tierId];
            const accent = TIER_ACCENTS[tierId];
            const isCurrent = tierId === currentTier;
            const isPopular = 'popular' in tier && tier.popular;
            const isUpgrade = TIER_ORDER.indexOf(tierId) > TIER_ORDER.indexOf(currentTier);

            return (
              <View
                key={tierId}
                style={[
                  styles.tierCard,
                  { backgroundColor: colors.surface, borderColor: isCurrent ? accent.gradient : colors.border },
                  isCurrent && { borderWidth: 2 },
                  isPopular && { borderColor: accent.gradient, borderWidth: 2 },
                ]}
              >
                {isPopular && (
                  <View style={[styles.popularBadge, { backgroundColor: accent.gradient }]}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}

                <View style={styles.tierHeader}>
                  <View>
                    <Text style={[styles.tierName, { color: accent.gradient }]}>{tier.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.tierPrice, { color: colors.text }]}>{tier.price}</Text>
                      <Text style={[styles.tierPriceDetail, { color: colors.textMuted }]}>
                        /{tier.priceDetail}
                      </Text>
                    </View>
                  </View>
                  {isCurrent && (
                    <View style={[styles.currentBadge, { backgroundColor: `${accent.gradient}20` }]}>
                      <Text style={[styles.currentText, { color: accent.gradient }]}>Current</Text>
                    </View>
                  )}
                </View>

                <View style={styles.featureList}>
                  {tier.features.map((feature, i) => (
                    <View key={i} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={18} color={accent.gradient} />
                      <Text style={[styles.featureText, { color: colors.textDim }]}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {isUpgrade && (
                  <TouchableOpacity
                    style={[styles.upgradeBtn, { backgroundColor: accent.gradient }]}
                    onPress={() => onUpgrade?.(tierId)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.upgradeBtnText}>
                      Upgrade to {tier.name}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
            Cancel anytime. Prices may vary by region.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: { width: 40 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  closeBtn: { width: 40, alignItems: 'flex-end' },
  content: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 28 },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
  heroSubtitle: { fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22, paddingHorizontal: 20 },
  tierCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
  },
  popularText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  tierName: { fontSize: 18, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  tierPrice: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  tierPriceDetail: { fontSize: 14, marginLeft: 2 },
  currentBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  currentText: { fontSize: 13, fontWeight: '700' },
  featureList: { gap: 10, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, flex: 1, lineHeight: 20 },
  upgradeBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disclaimer: { fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
