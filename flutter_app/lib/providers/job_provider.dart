import 'package:flutter/foundation.dart';
import 'package:mobile/api/models/job_model.dart';
import 'package:mobile/api/models/page_result.dart';
import 'package:mobile/api/services/job_service.dart';

class JobProvider extends ChangeNotifier {
  final List<JobModel> _jobs = [];
  List<JobModel> get jobs => List.unmodifiable(_jobs);

  bool isLoading = false;
  bool isLoadingMore = false;
  bool hasMore = true;
  int _currentPage = 0;
  int _lastPage = 1;

  Future<void> fetchFirstPage() async {
    if (isLoading) return;
    isLoading = true;
    notifyListeners();

    try {
      _jobs.clear();
      _currentPage = 1;

      final PageResult<JobModel> page = await JobService.fetchJobs(
        page: _currentPage,
      );

      _jobs.addAll(page.items);
      _lastPage = page.lastPage;
      hasMore = page.hasMore;
    } catch (e) {
      hasMore = false;
      if (kDebugMode) print('fetchFirstPage error: $e');
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchNextPage() async {
    if (isLoadingMore || !hasMore) return;
    isLoadingMore = true;
    notifyListeners();

    try {
      _currentPage += 1;
      if (_currentPage > _lastPage) {
        hasMore = false;
      } else {
        final PageResult<JobModel> page = await JobService.fetchJobs(
          page: _currentPage,
        );
        _jobs.addAll(page.items);
        _lastPage = page.lastPage;
        hasMore = page.hasMore;
      }
    } catch (e) {
      _currentPage -= 1;
      if (kDebugMode) print('fetchNextPage error: $e');
    } finally {
      isLoadingMore = false;
      notifyListeners();
    }
  }

  JobModel? detail;
  bool isDetailLoading = false;
  String? detailError;

  Future<void> fetchJobDetail(int id) async {
    isDetailLoading = true;
    detailError = null;
    notifyListeners();
    try {
      detail = await JobService.fetchJobDetail(id);
    } catch (e) {
      detail = null;
      detailError = 'Không tải được chi tiết công việc.\n$e';
      if (kDebugMode) print('fetchJobDetail error: $e');
    } finally {
      isDetailLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchJobDetailBySlug(String slug) async {
    isDetailLoading = true;
    detailError = null;
    notifyListeners();
    try {
      detail = await JobService.fetchJobDetailBySlug(slug);
    } catch (e) {
      detail = null;
      detailError = 'Không tải được chi tiết công việc.\n$e';
      if (kDebugMode) print('fetchJobDetailBySlug error: $e');
    } finally {
      isDetailLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshCurrentDetail() async {
    if (detail == null) return;
    await fetchJobDetail(detail!.id);
  }

  void clearDetail() {
    detail = null;
    detailError = null;
    isDetailLoading = false;
    notifyListeners();
  }
}
