import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'core/theme.dart';
import 'l10n/strings.dart';
import 'data/services/api_client.dart';
import 'data/services/security_service.dart';
import 'state/auth_state.dart';
import 'presentation/app_gate.dart';

void main() {
  final api = ApiClient();
  runApp(MultiProvider(
    providers: [
      Provider<ApiClient>.value(value: api),
      Provider<SecurityService>(create: (_) => SecurityService(api)),
      ChangeNotifierProvider(create: (_) => AuthState(api)),
    ],
    child: const NovaBankApp(),
  ));
}

class NovaBankApp extends StatelessWidget {
  const NovaBankApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NovaBank',
      debugShowCheckedModeBanner: false,
      theme: buildNovaTheme(),
      supportedLocales: const [Locale('en'), Locale('th')],
      localizationsDelegates: const [
        SDelegate(),
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: const AppGate(),
    );
  }
}
