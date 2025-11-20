import 'package:intl/intl.dart';

String toDdMMyyyy(String? iso) {
  if (iso == null || iso.trim().isEmpty) return '';
  final d = DateTime.tryParse(iso);
  if (d == null) return '';
  return DateFormat('dd/MM/yyyy').format(d);
}

String toYyyyMmDdFromDdMMyyyy(String? ddMMyyyy) {
  if (ddMMyyyy == null || ddMMyyyy.trim().isEmpty) return '';
  try {
    final parts = ddMMyyyy.split('/');
    final d = int.parse(parts[0]);
    final m = int.parse(parts[1]);
    final y = int.parse(parts[2]);
    final dt = DateTime(y, m, d);
    return DateFormat('yyyy-MM-dd').format(dt);
  } catch (_) {
    return '';
  }
}

int? calcRemainingDaysFromString(String? endDateStr) {
  if (endDateStr == null || endDateStr.trim().isEmpty) return null;
  final dt = DateTime.tryParse(endDateStr);
  if (dt == null) return null;
  final diff = dt.difference(DateTime.now());
  return diff.isNegative ? 0 : diff.inDays;
}
