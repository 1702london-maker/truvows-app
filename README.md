# Truvows Mobile App

React Native / Expo app for Truvows — the UK dating platform built on honesty and transparency.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your Supabase keys
3. `npx expo start`

## Keys needed

- `EXPO_PUBLIC_SUPABASE_URL` — from Supabase dashboard (same project as web app: `upkbnxbtlwddsxynyelz`)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — from Supabase dashboard (same as `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the web app `.env.local`)

## Test builds

- iOS Simulator: `eas build --profile preview --platform ios`
- Android: `eas build --profile preview --platform android`
- Internal distribution (TestFlight / Play internal): `eas build --profile development`

## Project structure

```
app/
  _layout.tsx          — root layout, auth gate, session listener
  (auth)/              — sign-in, sign-up, forgot-password
  (app)/               — main app: discover, matches, messages, safedate, events, profile
  onboarding/          — modes, profile, verify, declare
lib/
  supabase.ts          — Supabase client
  types.ts             — shared TypeScript interfaces
components/
  ui/                  — Button, Input, Card, Badge
  ProfileCard.tsx
  MessageBubble.tsx
constants/
  colors.ts            — brand palette
  fonts.ts
```

## Brand colours

| Token       | Hex       |
|-------------|-----------|
| primary     | #4C9A7D   |
| eucalyptus  | #76B99F   |
| mint        | #BFE3D3   |
| lightMint   | #EDF8F3   |
| offWhite    | #F5F7F6   |
| text        | #566762   |
| muted       | #7D8B86   |
| emergency   | #D96B6B   |
| dark        | #1a2e29   |
