import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mobile/api/models/applied_job.dart';
import 'package:mobile/api/models/saved_job.dart';
import 'package:mobile/api/services/my_jobs_service.dart';
import 'package:mobile/screens/job/job_detail_screen.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:mobile/providers/auth_provider.dart';

class MyJobsProvider extends ChangeNotifier {
  final List<AppliedJob> applied = [];
  bool isAppliedLoading = false;
  bool isAppliedMore = false;
  bool _appliedHasMore = true;
  int _appliedPage = 1;
  final ScrollController appliedScroll = ScrollController();

  // ===== ĐÃ LƯU =====
  final List<SavedJob> saved = [];
  bool isSavedLoading = false;
  bool isSavedMore = false;
  bool _savedHasMore = true;
  final ScrollController savedScroll = ScrollController();

  MyJobsProvider() {
    appliedScroll.addListener(_onAppliedScroll);
    savedScroll.addListener(_onSavedScroll);
  }

  Future<void> ensureLoaded(BuildContext context) async {
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) return;

    if (applied.isEmpty && !isAppliedLoading) {
      await refreshApplied();
    }
    if (saved.isEmpty && !isSavedLoading) {
      await refreshSaved();
    }
  }

  /* ================== ĐÃ ỨNG TUYỂN ================== */

  Future<void> refreshApplied() async {
    if (isAppliedLoading) return;
    isAppliedLoading = true;
    _appliedPage = 1;
    _appliedHasMore = true;
    applied.clear();
    notifyListeners();

    try {
      final res = await MyJobsService.fetchApplied(page: _appliedPage);
      applied.addAll(res.items);
      _appliedHasMore = res.currentPage < res.lastPage;
    } catch (e) {
      if (kDebugMode) print('refreshApplied error: $e');
      _appliedHasMore = false;
    } finally {
      isAppliedLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMoreApplied() async {
    if (isAppliedMore || !_appliedHasMore) return;
    isAppliedMore = true;
    notifyListeners();

    try {
      _appliedPage += 1;
      final res = await MyJobsService.fetchApplied(page: _appliedPage);
      applied.addAll(res.items);
      _appliedHasMore = res.currentPage < res.lastPage;
    } catch (e) {
      _appliedPage -= 1;
      if (kDebugMode) print('loadMoreApplied error: $e');
    } finally {
      isAppliedMore = false;
      notifyListeners();
    }
  }

  void _onAppliedScroll() {
    if (appliedScroll.position.pixels >=
        appliedScroll.position.maxScrollExtent - 280) {
      loadMoreApplied();
    }
  }

  Future<void> refreshSaved() async {
    if (isSavedLoading) return;
    isSavedLoading = true;
    _savedHasMore = true;
    saved.clear();
    notifyListeners();

    try {
      // final page = await MyJobsService.fetchSaved(page: _savedPage);
      // saved.addAll(page.items);
      // _savedHasMore = page.hasMore;

      await Future.delayed(const Duration(milliseconds: 500)); // mock
    } catch (e) {
      if (kDebugMode) print('refreshSaved error: $e');
    } finally {
      isSavedLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMoreSaved() async {
    if (isSavedMore || !_savedHasMore) return;
    isSavedMore = true;
    notifyListeners();

    try {
      // final page = await MyJobsService.fetchSaved(page: _savedPage);
      // saved.addAll(page.items);
      // _savedHasMore = page.hasMore;

      await Future.delayed(const Duration(milliseconds: 500)); // mock
    } catch (e) {
      if (kDebugMode) print('loadMoreSaved error: $e');
    } finally {
      isSavedMore = false;
      notifyListeners();
    }
  }

  void _onSavedScroll() {
    if (savedScroll.position.pixels >=
        savedScroll.position.maxScrollExtent - 280) {
      loadMoreSaved();
    }
  }

  void openJobDetail(
    BuildContext context,
    int? jobId,
    bool initialApplied,
    String? appliedStatus,
  ) {
    if (jobId != null) {
      Navigator.of(
        context,
      ).push(MaterialPageRoute(builder: (_) => JobDetailScreen(jobId: jobId)));
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Không tìm thấy ID công việc.')),
    );
  }

  Future<void> unsave(int id) async {
    // TODO: gọi API bỏ lưu
    // await MyJobsService.unsave(id);
    saved.removeWhere((e) => e.id == id);
    notifyListeners();
  }

  @override
  void dispose() {
    appliedScroll.dispose();
    savedScroll.dispose();
    super.dispose();
  }
}
