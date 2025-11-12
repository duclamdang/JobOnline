import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:mobile/api/models/cv_model.dart';
import 'package:mobile/api/services/profile_service.dart';
import 'package:mobile/screens/profile/widgets/cv_list.dart';
import 'package:mobile/screens/profile/widgets/cv_upload_fab.dart';
import 'package:path_provider/path_provider.dart';

class CvScreen extends StatefulWidget {
  const CvScreen({super.key});

  @override
  State<CvScreen> createState() => _CvScreenState();
}

class _CvScreenState extends State<CvScreen> {
  List<CvModel> _items = [];
  bool _loading = false;
  bool _uploading = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final list = await ProfileService.fetchCVs();
      if (!mounted) return;
      setState(() => _items = list);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi tải CV: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _onSetMain(CvModel cv) async {
    try {
      await ProfileService.setMainCv(cv.id);
      if (!mounted) return;
      setState(() {
        _items = _items
            .map(
              (e) => CvModel(
                id: e.id,
                fileName: e.fileName,
                filePath: e.filePath,
                createdAt: e.createdAt,
                main: e.id == cv.id,
              ),
            )
            .toList();
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Đã đặt làm CV chính')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi đặt CV chính: $e')));
    }
  }

  Future<void> _onDelete(CvModel cv) async {
    final ok =
        await showDialog<bool>(
          context: context,
          barrierDismissible: false,
          builder: (dCtx) => AlertDialog(
            title: const Text('Xoá CV'),
            content: Text('Bạn chắc chắn muốn xoá “${cv.fileName}”?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(dCtx).pop(false),
                child: const Text('Huỷ'),
              ),
              FilledButton(
                onPressed: () => Navigator.of(dCtx).pop(true),
                child: const Text('Xoá'),
              ),
            ],
          ),
        ) ??
        false;

    if (!ok) return;

    try {
      await ProfileService.deleteCv(cv.id);
      if (!mounted) return;
      setState(() => _items.removeWhere((e) => e.id == cv.id));
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Đã xoá CV')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi xoá CV: $e')));
    }
  }

  Future<File> _materializeFile(PlatformFile f) async {
    if (f.path != null) return File(f.path!);
    final dir = await getTemporaryDirectory();
    final out = File('${dir.path}/${f.name}');
    await out.writeAsBytes(f.bytes ?? const []);
    return out;
  }

  Future<void> _pickAndUpload() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: const ['pdf'],
        withData: true,
      );
      if (result == null || result.files.isEmpty) return;

      setState(() => _uploading = true);

      final pf = result.files.single;
      final file = await _materializeFile(pf);

      final uploaded = await ProfileService.uploadCv(file);
      if (!mounted) return;

      setState(() => _items.insert(0, uploaded));
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Tải CV thành công')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi tải CV: $e')));
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      appBar: AppBar(
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        title: const Text('CV của tôi'),
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : (_items.isEmpty
                ? const _Empty()
                : CvList(
                    items: _items,
                    onRefresh: _load,
                    onSetMain: _onSetMain,
                    onDelete: _onDelete,
                  )),
      floatingActionButton: CvUploadFab(
        uploading: _uploading,
        onPressed: _pickAndUpload,
      ),
    );
  }
}

/* ------- Empty widget nhỏ gọn (khỏi tạo file riêng) ------- */
class _Empty extends StatelessWidget {
  const _Empty();

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: const [
        SizedBox(height: 120),
        Center(
          child: Text(
            'Chưa có CV nào',
            style: TextStyle(color: Colors.black54),
          ),
        ),
      ],
    );
  }
}
