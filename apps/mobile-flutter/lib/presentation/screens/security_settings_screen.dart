import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../data/services/security_service.dart';
import 'pin_screen.dart';

class SecuritySettingsScreen extends StatefulWidget {
  const SecuritySettingsScreen({super.key});
  @override State<SecuritySettingsScreen> createState() => _SecuritySettingsScreenState();
}

class _SecuritySettingsScreenState extends State<SecuritySettingsScreen> {
  bool _biometric = false;
  bool _pinSet = false;
  bool _canBiometric = false;

  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    final s = context.read<SecurityService>();
    _biometric = await s.isBiometricEnabled;
    _pinSet = await s.isPinSet;
    _canBiometric = await s.canUseBiometrics();
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final s = context.read<SecurityService>();
    return Scaffold(
      appBar: AppBar(title: const Text('Security settings')),
      body: ListView(children: [
        ListTile(
          leading: const Icon(Icons.pin_outlined, color: NovaColors.primary),
          title: Text(_pinSet ? 'Change PIN' : 'Set PIN'),
          subtitle: const Text('6-digit PIN verified by the server'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => PinScreen(
            security: s, mode: 'set',
            onSuccess: () { Navigator.pop(context); _load();
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('PIN updated'))); },
          ))),
        ),
        SwitchListTile(
          secondary: const Icon(Icons.fingerprint, color: NovaColors.primary),
          title: const Text('Face ID / Fingerprint unlock'),
          subtitle: Text(_canBiometric ? 'Use device biometrics to unlock' : 'Not available on this device'),
          value: _biometric,
          onChanged: _canBiometric ? (v) async {
            if (v && !await s.authenticateBiometric()) return;
            await s.setBiometricEnabled(v);
            setState(() => _biometric = v);
          } : null,
        ),
        const Divider(),
        const Padding(padding: EdgeInsets.all(16),
          child: Text('This is a demo banking system. Do not use for real financial transactions.',
            style: TextStyle(color: NovaColors.muted, fontSize: 12))),
      ]),
    );
  }
}
