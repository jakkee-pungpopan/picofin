import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/app_config.dart';

class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override String toString() => message;
}

class ApiClient {
  final _storage = const FlutterSecureStorage();
  String? _accessToken;

  Future<void> _loadToken() async => _accessToken ??= await _storage.read(key: 'access');
  Future<void> saveTokens(String access, String refresh) async {
    _accessToken = access;
    await _storage.write(key: 'access', value: access);
    await _storage.write(key: 'refresh', value: refresh);
  }
  Future<void> clear() async { _accessToken = null; await _storage.deleteAll(); }
  Future<String?> get refreshToken => _storage.read(key: 'refresh');

  Map<String, String> _headers() => {
        'Content-Type': 'application/json',
        if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
      };

  Uri _u(String path) => Uri.parse('${AppConfig.apiBaseUrl}$path');

  Future<dynamic> get(String path) async {
    await _loadToken();
    final r = await http.get(_u(path), headers: _headers());
    return _handle(r);
  }

  Future<dynamic> post(String path, [Map<String, dynamic>? body]) async {
    await _loadToken();
    final r = await http.post(_u(path), headers: _headers(), body: jsonEncode(body ?? {}));
    return _handle(r);
  }

  Future<dynamic> patch(String path, [Map<String, dynamic>? body]) async {
    await _loadToken();
    final r = await http.patch(_u(path), headers: _headers(), body: jsonEncode(body ?? {}));
    return _handle(r);
  }

  dynamic _handle(http.Response r) {
    final data = r.body.isNotEmpty ? jsonDecode(r.body) : null;
    if (r.statusCode >= 200 && r.statusCode < 300) return data;
    final msg = data is Map ? (data['error']?.toString() ?? data['message']?.toString() ?? 'Request failed') : 'Request failed';
    throw ApiException(msg);
  }
}
