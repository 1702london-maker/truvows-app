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
import { supabase } from '../../../lib/supabase';
import { colors } from '../../../constants/colors';

interface ConvItem {
  id: string;
  match_id: string;
  other_name: string;
  last_message?: string;
  last_time?: string;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function MessagesIndex() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConvItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchConversations();
  }, [userId]);

  async function fetchConversations() {
    setLoading(true);
    const { data: convs } = await supabase.from('conversations').select('id, match_id, created_at');
    if (!convs) { setLoading(false); return; }

    const items: ConvItem[] = [];
    for (const c of convs) {
      const { data: match } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', c.match_id)
        .single();

      let otherUserId = match?.user1_id === userId ? match?.user2_id : match?.user1_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('user_id', otherUserId)
        .single();

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('conversation_id', c.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      items.push({
        id: c.id,
        match_id: c.match_id,
        other_name: profile?.first_name || 'Unknown',
        last_message: lastMsg?.content,
        last_time: lastMsg?.created_at,
      });
    }
    setConversations(items);
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptyText}>Match with someone and start a conversation</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push(`/(app)/messages/${item.id}`)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.other_name.slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={styles.name}>{item.other_name}</Text>
                  <Text style={styles.time}>{timeAgo(item.last_time)}</Text>
                </View>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.last_message || 'No messages yet'}
                </Text>
              </View>
            </TouchableOpacity>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.dark, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  list: { paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  info: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  name: { fontSize: 15, fontWeight: '700', color: colors.dark },
  time: { fontSize: 12, color: colors.muted },
  preview: { fontSize: 13, color: colors.muted },
});
