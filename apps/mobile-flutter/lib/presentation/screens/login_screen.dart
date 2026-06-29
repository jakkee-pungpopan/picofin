import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../core/app_config.dart';
import '../../state/auth_state.dart';
import '../widgets/states.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController(text: 'somchai@novabank.local');
  final _password = TextEditingController(text: 'Password@123');
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    return Scaffold(
      backgroundColor: NovaColors.primary,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            const SizedBox(height: 40),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: const [
              Icon(Icons.hexagon_rounded, color: NovaColors.accent, size: 40),
              SizedBox(width: 10),
              Text('NovaBank', style: TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.bold)),
            ]),
            const SizedBox(height: 8),
            const Text('Smart banking, reimagined',
                textAlign: TextAlign.center, style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 40),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
              child: Column(children: [
                TextField(controller: _email, keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.mail_outline))),
                const SizedBox(height: 14),
                TextField(controller: _password, obscureText: _obscure,
                    decoration: InputDecoration(labelText: 'Password', prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility),
                            onPressed: () => setState(() => _obscure = !_obscure)))),
                const SizedBox(height: 8),
                if (auth.error != null) Padding(padding: const EdgeInsets.only(top: 8),
                    child: Text(auth.error!, style: const TextStyle(color: NovaColors.danger))),
                const SizedBox(height: 12),
                auth.loading
                    ? const LoadingState()
                    : ElevatedButton(
                        onPressed: () => auth.login(_email.text.trim(), _password.text),
                        child: const Text('Login')),
                const SizedBox(height: 8),
                Row(children: [
                  Expanded(child: OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.fingerprint), label: const Text('Biometric'))),
                ]),
                TextButton(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                  child: const Text('Create new account'),
                ),
              ]),
            ),
            const SizedBox(height: 20),
            const Text(AppConfig.demoNotice,
                textAlign: TextAlign.center, style: TextStyle(color: Colors.white60, fontSize: 11)),
          ]),
        ),
      ),
    );
  }
}
