import 'dart:io';
import 'package:mobile/api/models/cv_model.dart';
import 'package:mobile/api/models/profile_model.dart';
import 'package:mobile/api/services/api_service.dart';

class ProfileService {
  static Future<ProfileModel> fetchBasic() {
    return ApiService.get<ProfileModel>(
      'user/profile/basic-info',
      parser: (json) =>
          ProfileModel.fromJson(Map<String, dynamic>.from(json as Map)),
    );
  }

  static Future<ProfileModel> fetchDetail() async {
    final res = await ApiService.get<Map<String, dynamic>>(
      'user/profile',
      parser: (json) => Map<String, dynamic>.from(json as Map),
    );
    return ProfileModel.fromDetailJson(res);
  }

  static Future<ProfileModel> updateBasic(ProfileModel basic) {
    return ApiService.put<ProfileModel>(
      'user/profile/basic-info',
      body: basic.toUpdatePayload(),
      parser: (json) =>
          ProfileModel.fromJson(Map<String, dynamic>.from(json as Map)),
    );
  }

  static Future<List<CvModel>> fetchCVs() async {
    return ApiService.get<List<CvModel>>(
      '/user/profile/cvs',
      parser: (json) {
        final List list = json as List;
        return list
            .map((e) => CvModel.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      },
    );
  }

  static Future<void> setMainCv(int id) async {
    await ApiService.post<dynamic>(
      '/user/profile/cvs/$id/set-main',
      parser: (_) => null,
    );
  }

  static Future<void> deleteCv(int id) async {
    await ApiService.delete<dynamic>(
      '/user/profile/cvs/$id',
      parser: (_) => null,
    );
  }

  static Future<CvModel> uploadCv(File file) {
    return ApiService.upload<CvModel>(
      '/user/profile/cvs',
      fields: const {},
      file: file,
      fileField: 'cv_file',
      parser: (json) {
        if (json is Map && json['data'] is Map) {
          return CvModel.fromJson(Map<String, dynamic>.from(json['data']));
        }
        if (json is Map) {
          return CvModel.fromJson(Map<String, dynamic>.from(json));
        }
        throw 'Phản hồi không hợp lệ';
      },
    );
  }

  static Future<ProfileModel> uploadAvatar(File file) {
    return ApiService.upload<ProfileModel>(
      'user/profile/avatar',
      file: file,
      fileField: 'avatar',
      fields: const {},
      parser: (json) {
        if (json is Map && json['data'] != null) {
          return ProfileModel.fromJson(Map<String, dynamic>.from(json['data']));
        }
        return ProfileModel.fromJson(Map<String, dynamic>.from(json as Map));
      },
    );
  }
}
