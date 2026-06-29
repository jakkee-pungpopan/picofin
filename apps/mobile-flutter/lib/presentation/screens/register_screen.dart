import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../state/auth_state.dart';
import '../widgets/states.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          TextField(controller: _name, decoration: const InputDecoration(labelText: 'Full name')),
          const SizedBox(height: 14),
          TextField(controller: _email, decoration: const InputDecoration(labelText: 'Email')),
          const SizedBox(height: 14),
          TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Password (min 8 chars)')),
          const SizedBox(height: 8),
          if (auth.error != null) Text(auth.error!, style: const TextStyle(color: Colors.red)),
          const SizedBox(height: 16),
          auth.loading ? const LoadingState() : ElevatedButton(
            onPressed: () async {
              final ok = await auth.register(_email.text.trim(), _password.text, _name.text.trim());
              if (ok && context.mounted) Navigator.pop(context);
            },
            child: const Text('Create account'),
          ),
        ]),
      ),
    );
  }
}
