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

  final List<SavedJob> saved = [];
  bool isSavedLoading = false;
  bool isSavedMore = false;
  bool _savedHasMore = true;
  int _savedPage = 1;
  final ScrollController savedScroll = ScrollController();

  final Set<int> _savingIds = {};
  bool _saving = false;

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

  /* ================== ĐÃ LƯU ================== */

  Future<void> refreshSaved() async {
    if (isSavedLoading) return;
    isSavedLoading = true;
    _savedPage = 1;
    _savedHasMore = true;
    saved.clear();
    notifyListeners();

    try {
      final res = await MyJobsService.fetchSaved(page: _savedPage);
      saved.addAll(res.items);
      _savedHasMore = res.currentPage < res.lastPage;
    } catch (e) {
      if (kDebugMode) print('refreshSaved error: $e');
      _savedHasMore = false;
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
      _savedPage += 1;
      final res = await MyJobsService.fetchSaved(page: _savedPage);
      saved.addAll(res.items);
      _savedHasMore = res.currentPage < res.lastPage;
    } catch (e) {
      _savedPage -= 1;
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

  Future<bool> _ensureLoggedIn(BuildContext context) async {
    final auth = context.read<AuthProvider>();
    if (auth.isLoggedIn) return true;
    Navigator.of(context).pushNamed('/login');
    return false;
  }

  Future<void> toggleSaveWithAuth(BuildContext context, int jobId) async {
    if (!await _ensureLoggedIn(context)) return;
    await toggleSave(jobId);
  }

  Future<void> unsave(int id) async {
    final idx = saved.indexWhere((e) => e.id == id);
    SavedJob? removed;
    if (idx >= 0) {
      removed = saved.removeAt(idx);
      notifyListeners();
    }

    try {
      await MyJobsService.unsaveJob(jobId: id);
    } catch (e) {
      if (removed != null) {
        saved.insert(idx, removed);
        notifyListeners();
      }
      rethrow;
    }
  }

  Future<void> save(int jobId) async {
    if (_saving) return;
    _saving = true;
    try {
      final res = await MyJobsService.saveJob(jobId: jobId);
      if (!res.alreadySaved) {
        await refreshSaved();
      }
    } finally {
      _saving = false;
    }
  }

  bool isSaved(int jobId) => saved.any((e) => e.id == jobId);

  Future<void> toggleSave(int jobId) async {
    if (_savingIds.contains(jobId)) return;
    _savingIds.add(jobId);
    notifyListeners();
    try {
      if (isSaved(jobId)) {
        await unsave(jobId);
      } else {
        final res = await MyJobsService.saveJob(jobId: jobId);
        if (!res.alreadySaved) await refreshSaved();
      }
    } finally {
      _savingIds.remove(jobId);
      notifyListeners();
    }
  }

  /* ================== KHÁC ================== */

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

  @override
  void dispose() {
    appliedScroll.dispose();
    savedScroll.dispose();
    super.dispose();
  }
}
