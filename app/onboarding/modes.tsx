import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';

const MODES = [
  {
    key: 'dating',
    label: 'Dating',
    emoji: '💚',
    description: 'Looking for a romantic connection with someone honest and verified.',
  },
  {
    key: 'social',
    label: 'Social',
    emoji: '🤝',
    description: 'Expanding your circle and meeting interesting people in your area.',
  },
  {
    key: 'friendship',
    label: 'Friendship',
    emoji: '🌿',
    description: 'Finding genuine friendships built on shared values and transparency.',
  },
];

export default function Modes() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected) { Alert.alert('Please select a mode'); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ user_id: user.id, mode: selected });
    }
    setLoading(false);
    router.push('/onboarding/profile');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.step}>Step 1 of 4</Text>
        <Text style={styles.title}>How do you want to connect?</Text>
        <Text style={styles.subtitle}>Choose your primary mode — you can change this later</Text>

        <View style={styles.cards}>
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode.key}
              style={[styles.card, selected === mode.key && styles.cardSelected]}
              onPress={() => setSelected(mode.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{mode.emoji}</Text>
              <Text style={[styles.cardLabel, selected === mode.key && styles.cardLabelSelected]}>
                {mode.label}
              </Text>
              <Text style={styles.cardDesc}>{mode.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={!selected}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  container: { flex: 1, padding: 24 },
  step: { fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: colors.dark, marginBottom: 8, lineHeight: 32 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 32, lineHeight: 20 },
  cards: { gap: 12, marginBottom: 32 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.lightMint,
  },
  emoji: { fontSize: 28, marginBottom: 8 },
  cardLabel: { fontSize: 18, fontWeight: '700', color: colors.dark, marginBottom: 4 },
  cardLabelSelected: { color: colors.primary },
  cardDesc: { fontSize: 14, color: colors.muted, lineHeight: 20 },
});
