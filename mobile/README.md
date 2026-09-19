# Metroskool Monitor (Android)

Flutter teacher app for Metroskool Monitor. Offline attendance marks use the
encrypted, idempotent queue in `lib/src/queue.dart`. Supabase remains
authoritative (`serverWins`); the same idempotency key cannot create a second
attendance row.

This folder started as a Dart package only (no `android/`). The application
shell and Android host are scaffolded here so `flutter build apk` works from
this module repo.

## Shared types

`metroskool_flutter_core` lives at `../packages/flutter_core` in this
repository. The original suite path was `../../packages/flutter_core`; this
module vendors a compatible contract so Monitor can build standalone.

## Build a debug APK

Requires Flutter (stable, Dart 3.5+) and an Android SDK.

```bash
cd mobile
flutter pub get
flutter test
flutter build apk --debug
```

The APK is written to:

`mobile/build/app/outputs/flutter-apk/app-debug.apk`
