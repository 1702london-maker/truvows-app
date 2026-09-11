import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { MessageBubble } from '../../../components/MessageBubble';
import { colors } from '../../../constants/colors';
import { Message } from '../../../lib/types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!id || !userId) return;
    fetchMessages();
    fetchOtherName();

    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, userId]);

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  }

  async function fetchOtherName() {
    const { data: conv } = await supabase
      .from('conversations')
      .select('match_id')
      .eq('id', id)
      .single();
    if (!conv) return;
    const { data: match } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', conv.match_id)
      .single();
    if (!match) return;
    const otherId = match.user1_id === userId ? match.user2_id : match.user1_id;
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('user_id', otherId)
      .single();
    if (profile) setOtherName(profile.first_name);
  }

  async function handleSend() {
    if (!text.trim() || !userId) return;
    const content = text.trim();
    setText('');
    await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: userId,
      content,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Emergency bar */}
      <View style={styles.emergencyBar}>
        <Text style={styles.emergencyText}>In active danger? Dial 999 immediately.</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{otherName || 'Chat'}</Text>
          <Text style={styles.encryptedNotice}>End-to-end encrypted</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isSent={item.sender_id === userId} />
          )}
          contentContainerStyle={styles.messageList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  emergencyBar: { backgroundColor: colors.emergency, paddingVertical: 6, paddingHorizontal: 16 },
  emergencyText: { color: colors.white, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backBtn: { paddingRight: 4 },
  backText: { fontSize: 22, color: colors.dark },
  headerCenter: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', color: colors.dark },
  encryptedNotice: { fontSize: 11, color: colors.primary },
  flex: { flex: 1 },
  messageList: { paddingVertical: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.dark,
    backgroundColor: colors.offWhite,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.mint },
  sendBtnText: { color: colors.white, fontSize: 20, fontWeight: '700' },
});
