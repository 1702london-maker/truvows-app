import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { colors } from '../../constants/colors';
import { Profile } from '../../lib/types';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [occupation, setOccupation] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) {
      setProfile(data);
      setFirstName(data.first_name || '');
      setBio(data.bio || '');
      setCity(data.city || '');
      setOccupation(data.occupation || '');
      setIsActive(data.is_active ?? true);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ first_name: firstName, bio, city, occupation, is_active: isActive })
      .eq('id', profile.id);
    setSaving(false);
    if (error) {
      Alert.alert('Error', 'Could not save profile');
    } else {
      Alert.alert('Saved', 'Your profile has been updated');
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {firstName ? firstName.slice(0, 1).toUpperCase() : '?'}
              </Text>
            </View>
            <Text style={styles.name}>{firstName || 'Your Profile'}</Text>
            <Text style={styles.modeLabel}>{profile?.mode ? `Mode: ${profile.mode}` : ''}</Text>
          </View>

          {/* Verification badges */}
          <View style={styles.badgesRow}>
            {profile?.identity_verified && (
              <Badge label="Identity verified" variant="success" />
            )}
            {profile?.status_declared && (
              <Badge label="Status declared" variant="primary" />
            )}
            {profile?.document_reviewed && (
              <Badge label="Document reviewed" variant="primary" />
            )}
            {!profile?.identity_verified && !profile?.status_declared && (
              <Badge label="Not yet verified" variant="muted" />
            )}
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Edit profile</Text>
            <Input label="First name" value={firstName} onChangeText={setFirstName} placeholder="Your name" />
            <Input label="City" value={city} onChangeText={setCity} placeholder="e.g. London" />
            <Input label="Occupation" value={occupation} onChangeText={setOccupation} placeholder="e.g. Nurse" />
            <Input
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself..."
              multiline
              numberOfLines={4}
              style={styles.bioInput}
            />

            <View style={styles.pauseRow}>
              <View>
                <Text style={styles.pauseLabel}>Profile visible</Text>
                <Text style={styles.pauseSub}>Turn off to pause your profile</Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <Button title="Save changes" onPress={handleSave} loading={saving} />
          </View>

          <Button
            title="Sign out"
            onPress={handleSignOut}
            variant="outline"
            style={styles.signOutBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.muted },
  container: { padding: 20, paddingBottom: 48 },
  avatarSection: { alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: colors.primary },
  name: { fontSize: 22, fontWeight: '800', color: colors.dark },
  modeLabel: { fontSize: 13, color: colors.muted, marginTop: 2, textTransform: 'capitalize' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 },
  form: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.dark, marginBottom: 16 },
  bioInput: { height: 100, textAlignVertical: 'top' },
  pauseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 16,
    marginTop: 4,
  },
  pauseLabel: { fontSize: 15, fontWeight: '600', color: colors.dark },
  pauseSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  signOutBtn: { marginTop: 4 },
});
