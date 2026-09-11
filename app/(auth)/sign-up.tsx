import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSignUp() {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password || password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName } },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Sign up failed', error.message);
      return;
    }
    if (data.user) {
      router.replace('/onboarding/modes');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.wordmark}>truvows</Text>
            <Text style={styles.tagline}>Honest connections</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Join thousands of honest daters</Text>

            <Input
              label="First name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Your first name"
              error={errors.firstName}
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={errors.email}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              secureEntry
              error={errors.password}
            />

            <Button title="Create account" onPress={handleSignUp} loading={loading} />

            <View style={styles.signInRow}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                <Text style={styles.link}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  wordmark: { fontSize: 36, fontWeight: '800', color: colors.primary, letterSpacing: -1 },
  tagline: { fontSize: 14, color: colors.muted, marginTop: 4 },
  form: { backgroundColor: colors.white, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 22, fontWeight: '700', color: colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 24 },
  link: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  signInRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  signInText: { fontSize: 14, color: colors.muted },
});
