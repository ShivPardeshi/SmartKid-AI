import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const ProfileSetupScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainApp'))}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.name}>{user?.name || 'Student'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Learner · Ages 5–10</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <ProfileRow icon="mail-outline" label="Email" value={user?.email || '—'} />
          <ProfileRow icon="calendar-outline" label="Age group" value="5–10 years" />
          <ProfileRow icon="language-outline" label="Language" value="English" last />
        </View>

        <Button
          title="Log Out"
          variant="outline"
          onPress={logout}
          fullWidth
        />
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const ProfileRow = ({
  icon, label, value, last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) => (
  <View style={[styles.row, last && styles.rowLast]}>
    <Ionicons name={icon} size={18} color={COLORS.primary} />
    <View style={{ flex: 1 }}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.xs,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: -0.3,
  },
  content: { paddingHorizontal: 20, paddingTop: 28 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  name: {
    fontSize: SIZES.xlarge,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  badge: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: { fontSize: SIZES.small, fontWeight: '700', color: COLORS.secondary },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { fontSize: SIZES.small - 1, color: COLORS.lightText, marginBottom: 2 },
  rowValue: { fontSize: SIZES.medium, fontWeight: '600', color: COLORS.text },
});
