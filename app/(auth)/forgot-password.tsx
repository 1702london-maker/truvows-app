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

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.form}>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>We'll send a reset link to your email</Text>

            {sent ? (
              <View style={styles.sentBox}>
                <Text style={styles.sentTitle}>Check your inbox</Text>
                <Text style={styles.sentText}>
                  A reset link has been sent to {email}. Follow the link to set a new password.
                </Text>
                <Button title="Back to sign in" onPress={() => router.replace('/(auth)/sign-in')} />
              </View>
            ) : (
              <>
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                />
                <Button title="Send reset link" onPress={handleReset} loading={loading} />
              </>
            )}
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
  back: { marginBottom: 24 },
  backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  form: { backgroundColor: colors.white, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 22, fontWeight: '700', color: colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 24 },
  sentBox: { alignItems: 'center', gap: 12 },
  sentTitle: { fontSize: 18, fontWeight: '700', color: colors.dark },
  sentText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
