class Account {
  final String id, accountNumber, name, type;
  final double balance;
  Account.fromJson(Map<String, dynamic> j)
      : id = j['id'], accountNumber = j['accountNumber'], name = j['name'],
        type = j['type'], balance = (j['balance'] as num).toDouble();
}

class Txn {
  final String id, reference, type, direction;
  final double amount;
  final String? description, counterparty;
  final DateTime createdAt;
  Txn.fromJson(Map<String, dynamic> j)
      : id = j['id'], reference = j['reference'], type = j['type'],
        direction = j['direction'] ?? 'DEBIT', amount = (j['amount'] as num).toDouble(),
        description = j['description'], counterparty = j['counterparty'],
        createdAt = DateTime.parse(j['createdAt']);
}

class NotificationItem {
  final String id, title, body;
  final bool isRead;
  NotificationItem.fromJson(Map<String, dynamic> j)
      : id = j['id'], title = j['title'], body = j['body'], isRead = j['isRead'] ?? false;
}
