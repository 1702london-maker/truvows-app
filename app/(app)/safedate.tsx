import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { SafeDatePlan } from '../../lib/types';

export default function SafeDate() {
  const [plans, setPlans] = useState<SafeDatePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [interval, setInterval] = useState('30');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); }
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchPlans();
  }, [userId]);

  async function fetchPlans() {
    setLoading(true);
    const { data } = await supabase
      .from('safedate_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    setPlans(data || []);
    setLoading(false);
  }

  async function handleSubmit() {
    if (!venue || !address || !dateTime || !contactName || !contactPhone) {
      Alert.alert('Please fill in all fields');
      return;
    }
    setSaving(true);
    await supabase.from('safedate_plans').insert({
      user_id: userId,
      venue_name: venue,
      venue_address: address,
      date_time: dateTime,
      trusted_contact_name: contactName,
      trusted_contact_phone: contactPhone,
      checkin_interval_minutes: parseInt(interval, 10),
      is_active: true,
    });
    setVenue(''); setAddress(''); setDateTime('');
    setContactName(''); setContactPhone(''); setInterval('30');
    setShowForm(false);
    setSaving(false);
    fetchPlans();
  }

  async function handleCheckIn(planId: string) {
    await supabase
      .from('safedate_plans')
      .update({ last_checkin: new Date().toISOString() })
      .eq('id', planId);
    Alert.alert('Checked in safely', 'Your trusted contact has been notified.');
    fetchPlans();
  }

  async function handleEnd(planId: string) {
    await supabase.from('safedate_plans').update({ is_active: false }).eq('id', planId);
    fetchPlans();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.emergencyBar}>
        <Text style={styles.emergencyText}>In active danger? Dial 999 immediately.</Text>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>SafeDate</Text>
              <Text style={styles.subtitle}>Your safety, always</Text>
            </View>
            <TouchableOpacity
              style={styles.newBtn}
              onPress={() => setShowForm(!showForm)}
            >
              <Text style={styles.newBtnText}>{showForm ? 'Cancel' : '+ New plan'}</Text>
            </TouchableOpacity>
          </View>

          {showForm && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>New SafeDate plan</Text>
              <Input label="Venue name" value={venue} onChangeText={setVenue} placeholder="e.g. The Ivy" />
              <Input label="Venue address" value={address} onChangeText={setAddress} placeholder="123 High St, London" />
              <Input label="Date & time (DD/MM/YYYY HH:MM)" value={dateTime} onChangeText={setDateTime} placeholder="25/12/2024 19:00" />
              <Input label="Trusted contact name" value={contactName} onChangeText={setContactName} placeholder="Friend or family member" />
              <Input label="Trusted contact phone" value={contactPhone} onChangeText={setContactPhone} placeholder="+44 7700 000000" keyboardType="phone-pad" />
              <Input label="Check-in interval (minutes)" value={interval} onChangeText={setInterval} placeholder="30" keyboardType="numeric" />
              <Button title="Create plan" onPress={handleSubmit} loading={saving} />
            </View>
          )}

          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : plans.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🛡️</Text>
              <Text style={styles.emptyTitle}>No active plans</Text>
              <Text style={styles.emptyText}>Create a SafeDate plan before every date to keep a trusted contact informed</Text>
            </View>
          ) : (
            plans.map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                <Text style={styles.planVenue}>{plan.venue_name}</Text>
                <Text style={styles.planMeta}>📍 {plan.venue_address}</Text>
                <Text style={styles.planMeta}>🕐 {plan.date_time}</Text>
                <Text style={styles.planMeta}>👤 {plan.trusted_contact_name} · {plan.trusted_contact_phone}</Text>
                <Text style={styles.planMeta}>⏱ Check-in every {plan.checkin_interval_minutes} mins</Text>
                {plan.last_checkin && (
                  <Text style={styles.planMeta}>Last check-in: {new Date(plan.last_checkin).toLocaleString()}</Text>
                )}
                <View style={styles.planActions}>
                  <Button title="Check in safe" onPress={() => handleCheckIn(plan.id)} style={styles.checkinBtn} />
                  <Button title="End SafeDate" onPress={() => handleEnd(plan.id)} variant="outline" style={styles.endBtn} />
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  emergencyBar: { backgroundColor: colors.emergency, paddingVertical: 8, paddingHorizontal: 16 },
  emergencyText: { color: colors.white, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 48 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: colors.dark },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  newBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  newBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  form: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.dark, marginBottom: 16 },
  loader: { marginTop: 40 },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.dark, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  planCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  planVenue: { fontSize: 16, fontWeight: '700', color: colors.dark, marginBottom: 6 },
  planMeta: { fontSize: 13, color: colors.muted, marginBottom: 3 },
  planActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  checkinBtn: { flex: 1 },
  endBtn: { flex: 1 },
});
