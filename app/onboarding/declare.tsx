import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';

const STATUSES = ['Single', 'Divorced', 'Widowed', 'Separated'];

export default function Declare() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    if (!status) { Alert.alert('Please declare your relationship status'); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({
        user_id: user.id,
        relationship_status: status,
        status_declared: true,
        is_complete: true,
        is_active: true,
      });
    }
    setLoading(false);
    router.replace('/(app)');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.step}>Step 4 of 4</Text>
        <Text style={styles.title}>Declare your status</Text>
        <Text style={styles.subtitle}>
          Truvows is built on honesty. Declaring your relationship status helps matches make informed decisions.
        </Text>

        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>📌</Text>
          <Text style={styles.noticeText}>
            By continuing you confirm your declared status is accurate. Misrepresentation is a violation of our community standards and may result in permanent removal.
          </Text>
        </View>

        <Text style={styles.fieldLabel}>Current relationship status</Text>
        <View style={styles.options}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.option, status === s && styles.optionSelected]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.optionText, status === s && styles.optionTextSelected]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Complete profile"
          onPress={handleComplete}
          loading={loading}
          disabled={!status}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  container: { padding: 24, paddingBottom: 48 },
  step: { fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: colors.dark, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 24, lineHeight: 20 },
  notice: {
    flexDirection: 'row',
    backgroundColor: colors.lightMint,
    borderRadius: 12,
    padding: 14,
    marginBottom: 28,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.mint,
  },
  noticeIcon: { fontSize: 16, marginTop: 1 },
  noticeText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 20 },
  fieldLabel: { fontSize: 16, fontWeight: '600', color: colors.dark, marginBottom: 12 },
  options: { gap: 10, marginBottom: 32 },
  option: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.lightMint },
  optionText: { fontSize: 16, color: colors.text, fontWeight: '500' },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },
});
