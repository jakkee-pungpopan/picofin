import 'package:flutter/material.dart';
import '../../core/theme.dart';

class LoadingState extends StatelessWidget {
  const LoadingState({super.key});
  @override Widget build(BuildContext c) =>
      const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()));
}

class EmptyState extends StatelessWidget {
  final String message; final IconData icon;
  const EmptyState({super.key, required this.message, this.icon = Icons.inbox_outlined});
  @override Widget build(BuildContext c) => Center(
    child: Column(mainAxisSize: MainAxisSize.min, children: [
      Icon(icon, size: 56, color: NovaColors.muted),
      const SizedBox(height: 12),
      Text(message, style: const TextStyle(color: NovaColors.muted, fontSize: 16)),
    ]),
  );
}

class ErrorState extends StatelessWidget {
  final String message; final VoidCallback? onRetry;
  const ErrorState({super.key, required this.message, this.onRetry});
  @override Widget build(BuildContext c) => Center(
    child: Column(mainAxisSize: MainAxisSize.min, children: [
      const Icon(Icons.error_outline, size: 56, color: NovaColors.danger),
      const SizedBox(height: 12),
      Padding(padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Text(message, textAlign: TextAlign.center, style: const TextStyle(color: NovaColors.danger))),
      if (onRetry != null) ...[
        const SizedBox(height: 16),
        OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
      ],
    ]),
  );
}

class DemoBanner extends StatelessWidget {
  const DemoBanner({super.key});
  @override Widget build(BuildContext c) => Container(
    width: double.infinity,
    color: const Color(0xFFFFF3CD),
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
    child: const Text('⚠ Demo only — not for real financial transactions',
        style: TextStyle(fontSize: 11, color: Color(0xFF7A5C00)), textAlign: TextAlign.center),
  );
}
