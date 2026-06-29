import 'package:flutter/material.dart';

// NovaBank brand: deep indigo + teal accent. Distinct, original palette.
class NovaColors {
  static const primary = Color(0xFF1B2A6B);   // deep indigo
  static const primaryDark = Color(0xFF111C4A);
  static const accent = Color(0xFF00C2A8);     // teal
  static const bg = Color(0xFFF4F6FB);
  static const surface = Colors.white;
  static const danger = Color(0xFFE5484D);
  static const text = Color(0xFF1A1D29);
  static const muted = Color(0xFF6B7280);
}

ThemeData buildNovaTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: NovaColors.primary,
    primary: NovaColors.primary,
    secondary: NovaColors.accent,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: NovaColors.bg,
    fontFamily: 'Roboto',
    appBarTheme: const AppBarTheme(
      backgroundColor: NovaColors.primary, foregroundColor: Colors.white, elevation: 0,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: NovaColors.primary, foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(54),
        textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true, fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
    ),
  );
}
