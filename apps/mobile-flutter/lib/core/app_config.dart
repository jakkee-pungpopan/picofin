class AppConfig {
  // Use 10.0.2.2 for Android emulator -> host machine; localhost for iOS sim.
  static const String apiBaseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:3000/api',
  );
  static const String demoNotice =
      'This is a demo banking system. Do not use for real financial transactions.';
}
