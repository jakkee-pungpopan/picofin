import 'package:flutter/material.dart';
import '../data/services/api_client.dart';

class AuthState extends ChangeNotifier {
  final ApiClient api;
  AuthState(this.api);

  bool loggedIn = false;
  String? fullName;
  bool loading = false;
  String? error;

  Future<bool> login(String email, String password) async {
    loading = true; error = null; notifyListeners();
    try {
      final res = await api.post('/auth/login', {'email': email, 'password': password});
      await api.saveTokens(res['accessToken'], res['refreshToken']);
      fullName = res['user']['fullName'];
      loggedIn = true;
      return true;
    } catch (e) {
      error = e.toString();
      return false;
    } finally { loading = false; notifyListeners(); }
  }

  Future<bool> register(String email, String password, String fullName) async {
    loading = true; error = null; notifyListeners();
    try {
      final res = await api.post('/auth/register', {'email': email, 'password': password, 'fullName': fullName});
      await api.saveTokens(res['accessToken'], res['refreshToken']);
      this.fullName = res['user']['fullName'];
      loggedIn = true;
      return true;
    } catch (e) { error = e.toString(); return false; }
    finally { loading = false; notifyListeners(); }
  }

  Future<void> logout() async {
    try { await api.post('/auth/logout'); } catch (_) {}
    await api.clear();
    loggedIn = false; fullName = null;
    notifyListeners();
  }
}
