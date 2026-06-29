import 'package:flutter/material.dart';

class S {
  final Locale locale;
  S(this.locale);
  static S of(BuildContext c) => Localizations.of<S>(c, S) ?? S(const Locale('en'));
  bool get th => locale.languageCode == 'th';

  String get appName => 'NovaBank';
  String get login => th ? 'เข้าสู่ระบบ' : 'Login';
  String get register => th ? 'สมัครสมาชิก' : 'Register';
  String get balance => th ? 'ยอดเงินคงเหลือ' : 'Balance';
  String get accounts => th ? 'บัญชีของฉัน' : 'My Accounts';
  String get transfer => th ? 'โอนเงิน' : 'Transfer';
  String get history => th ? 'ประวัติธุรกรรม' : 'Transactions';
  String get confirm => th ? 'ยืนยัน' : 'Confirm';
  String get success => th ? 'สำเร็จ' : 'Success';
}

class SDelegate extends LocalizationsDelegate<S> {
  const SDelegate();
  @override bool isSupported(Locale l) => ['en', 'th'].contains(l.languageCode);
  @override Future<S> load(Locale l) async => S(l);
  @override bool shouldReload(SDelegate old) => false;
}
