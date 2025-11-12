import 'package:mobile/api/services/api_service.dart';
import 'package:mobile/api/models/company_model.dart';

class CompanyService {
  static Future<CompanyModel> fetchCompany(int id) {
    return ApiService.get<CompanyModel>(
      'user/companies/$id',
      parser: (json) =>
          CompanyModel.fromJson(Map<String, dynamic>.from(json as Map)),
    );
  }
}
