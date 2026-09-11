import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'muted' | 'primary' | 'emergency';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'primary', style }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  primary: { backgroundColor: colors.lightMint },
  success: { backgroundColor: '#E8F5E9' },
  muted: { backgroundColor: colors.offWhite },
  emergency: { backgroundColor: '#FDECEA' },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  primaryText: { color: colors.primary },
  successText: { color: '#2E7D32' },
  mutedText: { color: colors.muted },
  emergencyText: { color: colors.emergency },
});
