import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../core/app_config.dart';
import '../../data/models/models.dart';
import '../../data/services/api_client.dart';

class TransferScreen extends StatefulWidget {
  final List<Account> accounts;
  const TransferScreen({super.key, required this.accounts});
  @override State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> {
  late Account _from = widget.accounts.first;
  final _to = TextEditingController();
  final _amount = TextEditingController();
  final _note = TextEditingController();
  String _channel = 'OTHER';
  bool _submitting = false;
  String? _error;
  final _baht = NumberFormat.currency(locale: 'en_US', symbol: '฿', decimalDigits: 2);

  Future<void> _submit() async {
    final amount = double.tryParse(_amount.text);
    setState(() => _error = null);
    if (_to.text.trim().isEmpty) { setState(() => _error = 'Enter destination account'); return; }
    if (amount == null || amount <= 0) { setState(() => _error = 'Enter a valid amount'); return; }
    if (amount > _from.balance) { setState(() => _error = 'Insufficient balance'); return; }

    // ----- confirmation dialog -----
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Confirm transfer'),
        content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          _row('From', '${_from.name} (${_from.accountNumber})'),
          _row('To', _to.text.trim()),
          _row('Channel', _channel),
          _row('Amount', _baht.format(amount)),
          const SizedBox(height: 8),
          const Text(AppConfig.demoNotice, style: TextStyle(fontSize: 11, color: NovaColors.muted)),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(minimumSize: const Size(100, 44)), child: const Text('Confirm')),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _submitting = true);
    try {
      final res = await context.read<ApiClient>().post('/transfers', {
        'fromAccountId': _from.id, 'toAccountNumber': _to.text.trim(),
        'amount': amount, 'channel': _channel, 'note': _note.text.trim(),
      });
      if (mounted) _showReceipt(res);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _showReceipt(Map<String, dynamic> res) {
    showDialog(
      context: context, barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: Row(children: const [
          Icon(Icons.check_circle, color: Colors.green), SizedBox(width: 8), Text('Transfer successful'),
        ]),
        content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          _row('Reference', res['reference'].toString()),
          _row('Amount', _baht.format((res['amount'] as num).toDouble())),
          _row('To', res['to'].toString()),
          _row('Balance', _baht.format((res['balanceAfter'] as num).toDouble())),
        ]),
        actions: [
          ElevatedButton(
            onPressed: () { Navigator.pop(context); Navigator.pop(context); },
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  Widget _row(String k, String v) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 3),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(k, style: const TextStyle(color: NovaColors.muted)),
      Flexible(child: Text(v, textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.w600))),
    ]),
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Transfer')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('From account'),
          const SizedBox(height: 6),
          DropdownButtonFormField<Account>(
            value: _from,
            items: widget.accounts.map((a) => DropdownMenuItem(value: a,
                child: Text('${a.name} • ${_baht.format(a.balance)}'))).toList(),
            onChanged: (a) => setState(() => _from = a!),
          ),
          const SizedBox(height: 16),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'OWN', label: Text('Own')),
              ButtonSegment(value: 'OTHER', label: Text('Other')),
              ButtonSegment(value: 'PROMPTPAY', label: Text('PromptPay')),
            ],
            selected: {_channel},
            onSelectionChanged: (s) => setState(() => _channel = s.first),
          ),
          const SizedBox(height: 16),
          TextField(controller: _to, decoration: const InputDecoration(labelText: 'Destination account / PromptPay')),
          const SizedBox(height: 14),
          TextField(controller: _amount, keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Amount (THB)', prefixText: '฿ ')),
          const SizedBox(height: 14),
          TextField(controller: _note, decoration: const InputDecoration(labelText: 'Note (optional)')),
          const SizedBox(height: 12),
          if (_error != null) Text(_error!, style: const TextStyle(color: NovaColors.danger)),
          const SizedBox(height: 16),
          _submitting
              ? const Center(child: CircularProgressIndicator())
              : ElevatedButton.icon(onPressed: _submit, icon: const Icon(Icons.send), label: const Text('Continue')),
        ]),
      ),
    );
  }
}
