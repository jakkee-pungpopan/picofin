import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';
import '../data/services/security_service.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/pin_screen.dart';

/// Decides what to show based on auth + PIN/biometric lock state.
class AppGate extends StatefulWidget {
  const AppGate({super.key});
  @override State<AppGate> createState() => _AppGateState();
}

class _AppGateState extends State<AppGate> {
  bool _unlockedThisSession = false;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    final security = context.read<SecurityService>();

    if (!auth.loggedIn) {
      _unlockedThisSession = false;
      return const LoginScreen();
    }

    return FutureBuilder<bool>(
      future: security.isPinSet,
      builder: (c, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        final pinSet = snap.data ?? false;

        // First-time after login & no PIN -> prompt to set one (skippable).
        if (!pinSet && !_unlockedThisSession) {
          return PinScreen(
            security: security, mode: 'set',
            onSuccess: () => setState(() => _unlockedThisSession = true),
          );
        }
        // PIN set but not yet unlocked this session -> require verify/biometric.
        if (pinSet && !_unlockedThisSession) {
          return PinScreen(
            security: security, mode: 'verify', allowBiometric: true,
            onSuccess: () => setState(() => _unlockedThisSession = true),
          );
        }
        return const DashboardScreen();
      },
    );
  }
}
