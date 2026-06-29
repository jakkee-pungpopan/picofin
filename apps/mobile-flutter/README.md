# NovaBank Mobile (Flutter)

Demo banking app. **This is a demo banking system. Do not use for real financial transactions.**

## Run
```bash
flutter pub get
# Android emulator talks to host backend via 10.0.2.2
flutter run --dart-define=API_URL=http://10.0.2.2:3000/api
# iOS simulator:
flutter run --dart-define=API_URL=http://localhost:3000/api
```

Demo login: `somchai@novabank.local` / `Password@123` (PIN `123456`)

## Implemented screens
Login, Register, Dashboard (balance hide/show, accounts, recent transactions, quick actions),
Transfer flow (form → confirmation → success receipt), with loading / empty / error states,
TH/EN localization scaffold, biometric & PIN placeholders.
