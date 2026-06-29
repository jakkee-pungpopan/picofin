import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../data/services/api_client.dart';
import '../../data/services/security_service.dart';

/// Reusable PIN screen. mode 'set' captures + confirms a new PIN;
/// mode 'verify' checks against the server (with optional biometric).
class PinScreen extends StatefulWidget {
  final SecurityService security;
  final String mode; // 'set' | 'verify'
  final VoidCallback onSuccess;
  final bool allowBiometric;
  const PinScreen({super.key, required this.security, required this.mode, required this.onSuccess, this.allowBiometric = false});

  @override State<PinScreen> createState() => _PinScreenState();
}

class _PinScreenState extends State<PinScreen> {
  String _pin = '';
  String? _firstEntry; // for confirm step in 'set' mode
  String? _error;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    if (widget.mode == 'verify' && widget.allowBiometric) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _tryBiometric());
    }
  }

  Future<void> _tryBiometric() async {
    if (!await widget.security.isBiometricEnabled) return;
    if (!await widget.security.canUseBiometrics()) return;
    if (await widget.security.authenticateBiometric()) widget.onSuccess();
  }

  Future<void> _onDigit(String d) async {
    if (_busy || _pin.length >= 6) return;
    setState(() { _pin += d; _error = null; });
    if (_pin.length == 6) await _submit();
  }

  void _onDelete() { if (_pin.isNotEmpty) setState(() => _pin = _pin.substring(0, _pin.length - 1)); }

  Future<void> _submit() async {
    setState(() => _busy = true);
    try {
      if (widget.mode == 'set') {
        if (_firstEntry == null) {
          setState(() { _firstEntry = _pin; _pin = ''; _busy = false; });
          return;
        }
        if (_firstEntry != _pin) {
          setState(() { _error = 'PIN does not match'; _pin = ''; _firstEntry = null; _busy = false; });
          return;
        }
        await widget.security.setPin(_pin);
        widget.onSuccess();
      } else {
        await widget.security.verifyPin(_pin);
        widget.onSuccess();
      }
    } on ApiException catch (e) {
      setState(() { _error = e.toString(); _pin = ''; });
    } catch (e) {
      setState(() { _error = 'Something went wrong'; _pin = ''; });
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String get _title => widget.mode == 'set'
      ? (_firstEntry == null ? 'Set a 6-digit PIN' : 'Confirm your PIN')
      : 'Enter your PIN';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NovaColors.primary,
      body: SafeArea(
        child: Column(children: [
          const SizedBox(height: 60),
          const Icon(Icons.lock_outline, color: Colors.white, size: 40),
          const SizedBox(height: 16),
          Text(_title, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
          const SizedBox(height: 28),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(6, (i) {
            final filled = i < _pin.length;
            return Container(width: 18, height: 18, margin: const EdgeInsets.symmetric(horizontal: 8),
              decoration: BoxDecoration(shape: BoxShape.circle,
                color: filled ? NovaColors.accent : Colors.transparent,
                border: Border.all(color: Colors.white70, width: 2)));
          })),
          const SizedBox(height: 16),
          if (_error != null) Text(_error!, style: const TextStyle(color: Color(0xFFFFD2D2))),
          const Spacer(),
          _keypad(),
          const SizedBox(height: 24),
        ]),
      ),
    );
  }

  Widget _keypad() {
    final keys = ['1','2','3','4','5','6','7','8','9','bio','0','del'];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: GridView.count(
        crossAxisCount: 3, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.4,
        children: keys.map((k) {
          if (k == 'bio') {
            return widget.mode == 'verify' && widget.allowBiometric
                ? IconButton(onPressed: _tryBiometric, icon: const Icon(Icons.fingerprint, color: Colors.white, size: 30))
                : const SizedBox();
          }
          if (k == 'del') {
            return IconButton(onPressed: _onDelete, icon: const Icon(Icons.backspace_outlined, color: Colors.white));
          }
          return TextButton(
            onPressed: () => _onDigit(k),
            style: TextButton.styleFrom(shape: const CircleBorder(), backgroundColor: Colors.white10),
            child: Text(k, style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w500)),
          );
        }).toList(),
      ),
    );
  }
}
