import 'package:flutter/foundation.dart';
import 'package:mobile/api/models/company_model.dart';
import 'package:mobile/api/services/company_service.dart';

class CompanyProvider extends ChangeNotifier {
  final Map<int, CompanyModel> _cache = {};
  bool isLoading = false;
  String? error;
  CompanyModel? getById(int id) => _cache[id];

  Future<void> fetchById(int id) async {
    if (_cache.containsKey(id)) return;
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final c = await CompanyService.fetchCompany(id);
      _cache[id] = c;
    } catch (e) {
      error = '$e';
      if (kDebugMode) print('fetchCompany error: $e');
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
