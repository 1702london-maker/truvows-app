import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';
import { Match, Profile } from '../../lib/types';

interface MatchWithProfile extends Match {
  profile: Profile;
}

export default function Matches() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); }
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchMatches();
  }, [userId]);

  async function fetchMatches() {
    setLoading(true);
    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (!matchData) { setLoading(false); return; }

    const enriched: MatchWithProfile[] = [];
    for (const m of matchData) {
      const otherId = m.user1_id === userId ? m.user2_id : m.user1_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', otherId)
        .single();
      if (profile) enriched.push({ ...m, profile });
    }
    setMatches(enriched);
    setLoading(false);
  }

  async function handleMessage(match: MatchWithProfile) {
    let { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('match_id', match.id)
      .single();

    if (!conv) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ match_id: match.id })
        .select()
        .single();
      conv = newConv;
    }

    if (conv) router.push(`/(app)/messages/${conv.id}`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>{matches.length} mutual connections</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>💚</Text>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptyText}>Discover profiles and like them to get matched</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.profile.first_name?.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.name}>{item.profile.first_name}</Text>
                {item.profile.city ? (
                  <Text style={styles.meta}>📍 {item.profile.city}</Text>
                ) : null}
              </View>
              <TouchableOpacity style={styles.msgBtn} onPress={() => handleMessage(item)}>
                <Text style={styles.msgBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.dark },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.dark, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.primary },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.dark },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  msgBtn: {
    backgroundColor: colors.lightMint,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  msgBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
});
