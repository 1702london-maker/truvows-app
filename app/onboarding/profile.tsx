import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Prefer not to say'];

export default function OnboardingProfile() {
  const router = useRouter();
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [occupation, setOccupation] = useState('');
  const [loading, setLoading] = useState(false);

  function validate18Plus(dobStr: string): boolean {
    const parts = dobStr.split('/');
    if (parts.length !== 3) return false;
    const [day, month, year] = parts.map(Number);
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    return age > 18 || (age === 18 && (m > 0 || (m === 0 && today.getDate() >= birth.getDate())));
  }

  async function handleContinue() {
    if (!dob) { Alert.alert('Please enter your date of birth'); return; }
    if (!validate18Plus(dob)) { Alert.alert('You must be 18 or older to use Truvows'); return; }
    if (!gender) { Alert.alert('Please select your gender'); return; }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({
        user_id: user.id,
        date_of_birth: dob,
        gender,
        bio,
        city,
        occupation,
      });
    }
    setLoading(false);
    router.push('/onboarding/verify');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.step}>Step 2 of 4</Text>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>This appears on your profile</Text>

          <Input
            label="Date of birth (DD/MM/YYYY)"
            value={dob}
            onChangeText={setDob}
            placeholder="01/01/1990"
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderChip, gender === g && styles.genderChipSelected]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderChipText, gender === g && styles.genderChipTextSelected]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="City" value={city} onChangeText={setCity} placeholder="e.g. London" />
          <Input label="Occupation" value={occupation} onChangeText={setOccupation} placeholder="e.g. Nurse" />
          <Input
            label="Bio (optional)"
            value={bio}
            onChangeText={setBio}
            placeholder="A few words about you..."
            multiline
            numberOfLines={4}
            style={styles.bioInput}
          />

          <Button title="Continue" onPress={handleContinue} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  flex: { flex: 1 },
  container: { padding: 24, paddingBottom: 48 },
  step: { fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: colors.dark, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 24 },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: colors.dark, marginBottom: 8 },
  genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  genderChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  genderChipSelected: { borderColor: colors.primary, backgroundColor: colors.lightMint },
  genderChipText: { fontSize: 14, color: colors.muted },
  genderChipTextSelected: { color: colors.primary, fontWeight: '600' },
  bioInput: { height: 100, textAlignVertical: 'top' },
});
