import 'package:flutter_test/flutter_test.dart';
import 'package:novabank/core/theme.dart';

void main() {
  test('Nova theme builds with brand colors', () {
    final t = buildNovaTheme();
    expect(t.colorScheme.primary, NovaColors.primary);
  });
}
