import 'package:flutter/material.dart';
import 'package:mobile/api/models/province.dart';
import 'package:mobile/api/services/master_data_service.dart';
import 'package:mobile/screens/search/job_search_result_screen.dart';

class JobSearchScreen extends StatefulWidget {
  const JobSearchScreen({super.key});

  @override
  State<JobSearchScreen> createState() => _JobSearchScreenState();
}

class _JobSearchScreenState extends State<JobSearchScreen> {
  final _keywordController = TextEditingController();

  late Future<List<Province>> _provinceFuture;
  int? _selectedLocationId;
  String? _selectedCityLabel;

  final List<String> _recentKeywords = [];

  @override
  void initState() {
    super.initState();
    _provinceFuture = MasterDataService.fetchProvinces();
  }

  @override
  void dispose() {
    _keywordController.dispose();
    super.dispose();
  }

  void _onSearchPressed() {
    final keyword = _keywordController.text.trim();
    if (keyword.isEmpty) return;

    if (!_recentKeywords.contains(keyword)) {
      setState(() {
        _recentKeywords.insert(0, keyword);
      });
    }

    FocusScope.of(context).unfocus();

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => JobSearchResultScreen(
          keyword: keyword,
          location: _selectedLocationId,
          cityLabel: _selectedCityLabel,
        ),
      ),
    );
  }

  InputDecoration _roundedDecoration({
    String? hintText,
    Widget? prefixIcon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      hintText: hintText,
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(30),
        borderSide: BorderSide(color: Colors.blue, width: 1.4),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(30),
        // ignore: deprecated_member_use
        borderSide: BorderSide(color: Colors.blue.withOpacity(0.4), width: 1.2),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(30),
        borderSide: BorderSide(color: Colors.blue, width: 1.6),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primary = theme.colorScheme.primary;

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, size: 20),
            onPressed: () => Navigator.of(context).pop(),
          ),
          centerTitle: true,
          title: Text(
            'Tìm kiếm việc làm',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: Colors.black,
            ),
          ),
        ),
        body: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: _keywordController,
                textInputAction: TextInputAction.search,
                onSubmitted: (_) => _onSearchPressed(),
                decoration: _roundedDecoration(
                  hintText: 'Nhập từ khoá công việc',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _keywordController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () {
                            setState(() {
                              _keywordController.clear();
                            });
                          },
                        )
                      : null,
                ),
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 12),
              FutureBuilder<List<Province>>(
                future: _provinceFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const SizedBox(
                      height: 56,
                      child: Center(child: CircularProgressIndicator()),
                    );
                  }

                  if (snapshot.hasError) {
                    return Text(
                      'Lỗi tải tỉnh/thành: ${snapshot.error}',
                      style: const TextStyle(color: Colors.red),
                    );
                  }

                  if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Text('Danh sách tỉnh/thành trống');
                  }

                  final provinces = snapshot.data!;

                  return DropdownButtonFormField<int>(
                    value: _selectedLocationId,
                    isExpanded: true,
                    hint: const Text('Chọn tỉnh/thành'),
                    items: provinces
                        .map(
                          (p) => DropdownMenuItem<int>(
                            value: p.id,
                            child: Text(p.name),
                          ),
                        )
                        .toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedLocationId = value;
                        _selectedCityLabel = value == null
                            ? null
                            : provinces.firstWhere((p) => p.id == value).name;
                      });
                    },
                    icon: const Icon(Icons.keyboard_arrow_down_rounded),
                    decoration: _roundedDecoration(
                      prefixIcon: const Icon(
                        Icons.location_on_outlined,
                        size: 22,
                      ),
                    ),
                  );
                },
              ),

              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _onSearchPressed,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    textStyle: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  child: Text('Tìm kiếm'),
                ),
              ),

              const SizedBox(height: 24),

              if (_recentKeywords.isNotEmpty) ...[
                Text(
                  'Tìm kiếm gần đây',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: ListView.builder(
                    itemCount: _recentKeywords.length,
                    itemBuilder: (context, index) {
                      final keyword = _recentKeywords[index];
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: Icon(Icons.access_time, color: primary),
                        title: Text(keyword),
                        onTap: () {
                          _keywordController.text = keyword;
                          _onSearchPressed();
                        },
                      );
                    },
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
