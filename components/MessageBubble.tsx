import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { Message } from '../lib/types';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function MessageBubble({ message, isSent }: MessageBubbleProps) {
  return (
    <View style={[styles.row, isSent ? styles.rowSent : styles.rowReceived]}>
      <View style={[styles.bubble, isSent ? styles.bubbleSent : styles.bubbleReceived]}>
        <Text style={[styles.text, isSent ? styles.textSent : styles.textReceived]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isSent ? styles.timeSent : styles.timeReceived]}>
          {timeAgo(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  rowSent: {
    alignItems: 'flex-end',
  },
  rowReceived: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleSent: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  textSent: {
    color: colors.white,
  },
  textReceived: {
    color: colors.dark,
  },
  time: {
    fontSize: 11,
    marginTop: 4,
  },
  timeSent: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  timeReceived: {
    color: colors.muted,
  },
});
