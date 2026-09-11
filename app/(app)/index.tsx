import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { ProfileCard } from '../../components/ProfileCard';
import { colors } from '../../constants/colors';
import { Profile } from '../../lib/types';

const MODES = ['All', 'Dating', 'Social', 'Friendship'];

export default function Discover() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchProfiles();
  }, [userId, filter]);

  async function fetchProfiles() {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .eq('is_complete', true)
      .neq('user_id', userId);

    if (filter !== 'All') {
      query = query.eq('mode', filter.toLowerCase());
    }

    const { data, error } = await query.limit(20);
    if (error) console.error(error);
    setProfiles(data || []);
    setLoading(false);
  }

  async function handleLike(profileId: string) {
    if (!userId) return;
    await supabase.from('likes').upsert({ liker_id: userId, liked_id: profileId });
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
  }

  function handlePass(profileId: string) {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>truvows</Text>
        <Text style={styles.headerSub}>Discover</Text>
      </View>

      <View style={styles.filterRow}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.filterChip, filter === m && styles.filterChipActive]}
            onPress={() => setFilter(m)}
          >
            <Text style={[styles.filterText, filter === m && styles.filterTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : profiles.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🌿</Text>
          <Text style={styles.emptyTitle}>No profiles yet</Text>
          <Text style={styles.emptyText}>Check back soon — more members are joining every day</Text>
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProfileCard
              profile={item}
              onLike={() => handleLike(item.id)}
              onPass={() => handlePass(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { fontSize: 22, fontWeight: '800', color: colors.primary, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  filterTextActive: { color: colors.white, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.dark, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
});
