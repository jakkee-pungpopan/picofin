import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';
import 'api_client.dart';

/// Handles PIN (verified server-side) and device biometric unlock.
class SecurityService {
  final ApiClient api;
  final _storage = const FlutterSecureStorage();
  final _localAuth = LocalAuthentication();
  SecurityService(this.api);

  static const _kPinSet = 'pin_set';
  static const _kBiometric = 'biometric_enabled';

  Future<bool> get isPinSet async => (await _storage.read(key: _kPinSet)) == '1';
  Future<bool> get isBiometricEnabled async => (await _storage.read(key: _kBiometric)) == '1';

  /// Set a new 6-digit PIN on the server, then flag locally.
  Future<void> setPin(String pin) async {
    await api.post('/auth/pin', {'pin': pin});
    await _storage.write(key: _kPinSet, value: '1');
  }

  /// Verify PIN against the server. Throws ApiException on mismatch.
  Future<bool> verifyPin(String pin) async {
    await api.post('/auth/pin/verify', {'pin': pin});
    return true;
  }

  Future<void> setBiometricEnabled(bool enabled) async {
    await _storage.write(key: _kBiometric, value: enabled ? '1' : '0');
    try { await api.patch('/users/me/security', {'biometricEnabled': enabled}); } catch (_) {}
  }

  Future<bool> canUseBiometrics() async {
    try {
      return await _localAuth.canCheckBiometrics && await _localAuth.isDeviceSupported();
    } catch (_) { return false; }
  }

  /// Returns true if the OS biometric prompt succeeds.
  Future<bool> authenticateBiometric() async {
    try {
      return await _localAuth.authenticate(
        localizedReason: 'Unlock NovaBank',
        options: const AuthenticationOptions(biometricOnly: true, stickyAuth: true),
      );
    } catch (_) { return false; }
  }
}
