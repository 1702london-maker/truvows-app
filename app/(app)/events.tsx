import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';
import { Event } from '../../lib/types';

function formatDate(dateStr: string): { day: string; month: string; time: string } {
  const d = new Date(dateStr);
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleString('en-GB', { month: 'short' }).toUpperCase(),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });
    setEvents(data || []);
    setLoading(false);
  }

  async function handleTickets(url?: string) {
    if (!url) return;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) Linking.openURL(url);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.subtitle}>Truvows community meet-ups</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🎟️</Text>
          <Text style={styles.emptyTitle}>No upcoming events</Text>
          <Text style={styles.emptyText}>Check back soon for community events near you</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const { day, month, time } = formatDate(item.event_date);
            return (
              <View style={styles.card}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateDay}>{day}</Text>
                  <Text style={styles.dateMonth}>{month}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMeta}>📍 {item.location}</Text>
                  <Text style={styles.cardMeta}>🕐 {time}</Text>
                  {item.description ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                  ) : null}
                  {item.ticket_url ? (
                    <TouchableOpacity
                      style={styles.ticketsBtn}
                      onPress={() => handleTickets(item.ticket_url)}
                    >
                      <Text style={styles.ticketsBtnText}>Get Tickets</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          }}
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
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 0,
  },
  dateBadge: {
    width: 64,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  dateDay: { fontSize: 24, fontWeight: '800', color: colors.white },
  dateMonth: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  cardBody: { flex: 1, padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.dark, marginBottom: 4 },
  cardMeta: { fontSize: 13, color: colors.muted, marginBottom: 2 },
  cardDesc: { fontSize: 13, color: colors.text, marginTop: 4, lineHeight: 18 },
  ticketsBtn: {
    marginTop: 10,
    backgroundColor: colors.lightMint,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  ticketsBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
});
