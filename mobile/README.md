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
# or a smaller per-ABI package:
flutter build apk --debug --split-per-abi
```

Application id: `com.altrastate.metroskool.monitor`

APK output (confirmed on this branch):

| Artifact | Path |
| --- | --- |
| Universal debug | `mobile/build/app/outputs/flutter-apk/app-debug.apk` |
| arm64-v8a (phones) | `mobile/build/app/outputs/flutter-apk/app-arm64-v8a-debug.apk` |
| x86_64 (emulator) | `mobile/build/app/outputs/flutter-apk/app-x86_64-debug.apk` |
| armeabi-v7a | `mobile/build/app/outputs/flutter-apk/app-armeabi-v7a-debug.apk` |

## Signed release APK (Play upload)

Release builds use an **upload** keystore. The JKS and `android/key.properties` are
gitignored — do not commit passwords or the keystore.

```bash
cd mobile/android
# If you do not already have an upload key:
#   keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA \
#     -keysize 2048 -validity 10000 -alias upload
cp key.properties.example key.properties
# Fill storePassword, keyPassword, keyAlias, storeFile locally.
cd ..
flutter build apk --release
```

Store identity (from `pubspec.yaml` / Gradle):

- applicationId: `com.altrastate.metroskool.monitor`
- versionName: `0.0.1`
- versionCode: `1`

Release APK path:

`mobile/build/app/outputs/flutter-apk/app-release.apk`
