import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';

const STEPS = [
  {
    icon: '🪪',
    label: 'Identity verified',
    description:
      'We verify your government-issued ID to confirm you are who you say you are. All documents are reviewed securely and never stored permanently.',
  },
  {
    icon: '📋',
    label: 'Status declared',
    description:
      'You declare your current relationship status before connecting with others. Honesty is a core value at Truvows.',
  },
  {
    icon: '✅',
    label: 'Document reviewed',
    description:
      'Our team reviews submitted documents to issue a verified badge on your profile, building trust with potential matches.',
  },
];

export default function Verify() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.step}>Step 3 of 4</Text>
        <Text style={styles.title}>Verified trust</Text>
        <Text style={styles.subtitle}>
          Truvows badges signal honesty — here's what each one means
        </Text>

        <View style={styles.cards}>
          {STEPS.map((s) => (
            <View key={s.label} style={styles.card}>
              <Text style={styles.icon}>{s.icon}</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardLabel}>{s.label}</Text>
                <Text style={styles.cardDesc}>{s.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button title="Start verification" onPress={() => router.push('/onboarding/declare')} />

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.push('/onboarding/declare')}
        >
          <Text style={styles.skipText}>Continue without verifying</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  container: { padding: 24, paddingBottom: 48 },
  step: { fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: colors.dark, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 32, lineHeight: 20 },
  cards: { gap: 16, marginBottom: 32 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  icon: { fontSize: 28, marginTop: 2 },
  cardBody: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700', color: colors.dark, marginBottom: 4 },
  cardDesc: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  skipBtn: { alignItems: 'center', marginTop: 16 },
  skipText: { fontSize: 14, color: colors.muted, textDecorationLine: 'underline' },
});
