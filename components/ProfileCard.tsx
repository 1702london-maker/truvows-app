import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import { Badge } from './ui/Badge';
import { Profile } from '../lib/types';

interface ProfileCardProps {
  profile: Profile;
  onLike?: () => void;
  onPass?: () => void;
  showActions?: boolean;
}

export function ProfileCard({ profile, onLike, onPass, showActions = true }: ProfileCardProps) {
  const initials = profile.first_name
    ? profile.first_name.slice(0, 1).toUpperCase()
    : '?';

  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        {profile.identity_verified && (
          <View style={styles.verifiedDot} />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{profile.first_name}</Text>
        {profile.city ? (
          <Text style={styles.meta}>📍 {profile.city}</Text>
        ) : null}
        {profile.occupation ? (
          <Text style={styles.meta}>💼 {profile.occupation}</Text>
        ) : null}
        {profile.bio ? (
          <Text style={styles.bio} numberOfLines={3}>
            {profile.bio}
          </Text>
        ) : null}

        <View style={styles.badges}>
          {profile.identity_verified && (
            <Badge label="Identity verified" variant="success" style={styles.badge} />
          )}
          {profile.status_declared && (
            <Badge label="Status declared" variant="primary" style={styles.badge} />
          )}
          {profile.document_reviewed && (
            <Badge label="Document reviewed" variant="primary" style={styles.badge} />
          )}
        </View>
      </View>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.passBtn} onPress={onPass}>
            <Text style={styles.passBtnText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeBtn} onPress={onLike}>
            <Text style={styles.likeBtnText}>♥</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    borderWidth: 2,
    borderColor: colors.white,
  },
  info: {
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 2,
  },
  bio: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  badge: {
    marginRight: 4,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  passBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  passBtnText: {
    fontSize: 22,
    color: colors.muted,
  },
  likeBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lightMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeBtnText: {
    fontSize: 22,
    color: colors.primary,
  },
});
