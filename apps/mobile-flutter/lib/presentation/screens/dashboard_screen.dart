import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../data/models/models.dart';
import '../../data/services/api_client.dart';
import '../../state/auth_state.dart';
import '../widgets/states.dart';
import 'transfer_screen.dart';
import 'security_settings_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _hideBalance = false;
  late Future<List<Account>> _accounts;
  late Future<List<Txn>> _txns;

  @override void initState() { super.initState(); _load(); }
  void _load() {
    final api = context.read<ApiClient>();
    _accounts = api.get('/accounts').then((d) => (d as List).map((e) => Account.fromJson(e)).toList());
    _txns = api.get('/transactions').then((d) => (d as List).map((e) => Txn.fromJson(e)).toList());
    setState(() {});
  }

  final _baht = NumberFormat.currency(locale: 'en_US', symbol: '฿', decimalDigits: 2);

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthState>();
    return Scaffold(
      appBar: AppBar(
        title: Text('Hi, ${auth.fullName ?? 'Customer'}'),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () {}),
          IconButton(icon: const Icon(Icons.shield_outlined), onPressed: () =>
              Navigator.push(context, MaterialPageRoute(builder: (_) => const SecuritySettingsScreen()))),
          IconButton(icon: const Icon(Icons.logout), onPressed: () => auth.logout()),
        ],
      ),
      body: Column(children: [
        const DemoBanner(),
        Expanded(child: RefreshIndicator(
          onRefresh: () async => _load(),
          child: ListView(padding: const EdgeInsets.all(16), children: [
            // ----- Accounts / balance card -----
            FutureBuilder<List<Account>>(
              future: _accounts,
              builder: (c, snap) {
                if (snap.connectionState != ConnectionState.done) return const LoadingState();
                if (snap.hasError) return ErrorState(message: snap.error.toString(), onRetry: _load);
                final accts = snap.data!;
                if (accts.isEmpty) return const EmptyState(message: 'No accounts yet');
                final total = accts.fold<double>(0, (s, a) => s + a.balance);
                return Column(children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [NovaColors.primary, NovaColors.primaryDark]),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        const Text('Total balance', style: TextStyle(color: Colors.white70)),
                        IconButton(
                          icon: Icon(_hideBalance ? Icons.visibility_off : Icons.visibility, color: Colors.white70),
                          onPressed: () => setState(() => _hideBalance = !_hideBalance),
                        ),
                      ]),
                      Text(_hideBalance ? '฿ ••••••' : _baht.format(total),
                          style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                    ]),
                  ),
                  const SizedBox(height: 16),
                  ...accts.map((a) => Card(
                    child: ListTile(
                      leading: const CircleAvatar(backgroundColor: NovaColors.accent, child: Icon(Icons.account_balance_wallet, color: Colors.white)),
                      title: Text(a.name),
                      subtitle: Text('${a.type} • ${a.accountNumber}'),
                      trailing: Text(_hideBalance ? '••••' : _baht.format(a.balance),
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  )),
                  const SizedBox(height: 8),
                  // ----- quick actions -----
                  Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                    _action(Icons.send, 'Transfer', () async {
                      await Navigator.push(context, MaterialPageRoute(builder: (_) => TransferScreen(accounts: accts)));
                      _load();
                    }),
                    _action(Icons.qr_code_scanner, 'Scan QR', () {}),
                    _action(Icons.receipt_long, 'Pay Bill', () {}),
                    _action(Icons.phone_android, 'Top-up', () {}),
                  ]),
                ]);
              },
            ),
            const SizedBox(height: 20),
            const Text('Recent transactions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            FutureBuilder<List<Txn>>(
              future: _txns,
              builder: (c, snap) {
                if (snap.connectionState != ConnectionState.done) return const LoadingState();
                if (snap.hasError) return ErrorState(message: snap.error.toString(), onRetry: _load);
                final txns = snap.data!;
                if (txns.isEmpty) return const EmptyState(message: 'No transactions yet', icon: Icons.history);
                return Column(children: txns.map((t) {
                  final credit = t.direction == 'CREDIT';
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: credit ? NovaColors.accent : NovaColors.danger,
                      child: Icon(credit ? Icons.south_west : Icons.north_east, color: Colors.white, size: 18),
                    ),
                    title: Text(t.description ?? t.type),
                    subtitle: Text(DateFormat('dd MMM yyyy HH:mm').format(t.createdAt)),
                    trailing: Text('${credit ? '+' : '-'}${_baht.format(t.amount)}',
                        style: TextStyle(color: credit ? Colors.green : NovaColors.danger, fontWeight: FontWeight.bold)),
                  );
                }).toList());
              },
            ),
          ]),
        )),
      ]),
    );
  }

  Widget _action(IconData i, String label, VoidCallback onTap) => InkWell(
    onTap: onTap,
    child: Column(children: [
      CircleAvatar(radius: 26, backgroundColor: Colors.white, child: Icon(i, color: NovaColors.primary)),
      const SizedBox(height: 6),
      Text(label, style: const TextStyle(fontSize: 12)),
    ]),
  );
}
