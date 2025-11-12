import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final int? statusCode;
  final String message;
  ApiException(this.message, {this.statusCode});
  @override
  String toString() => 'ApiException($statusCode): $message';
}

class ApiService {
  // 1) Base URL (ưu tiên --dart-define=BASE_URL)
  static final String baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: _platformBaseUrl,
  );

  // 2) HTTP client + timeout mặc định
  static final http.Client _client = http.Client();
  static const Duration _timeout = Duration(seconds: 20);

  // 3) Token
  static String? _token;
  static void setToken(String? token) => _token = token;

  // 4) Header mặc định
  static Map<String, String> _headers({
    bool json = true,
    Map<String, String>? extra,
  }) {
    final h = <String, String>{
      if (json) 'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (_token != null && _token!.isNotEmpty)
        'Authorization': 'Bearer $_token',
    };
    if (extra != null) h.addAll(extra);
    return h;
  }

  // 5) Build Uri + query (hỗ trợ URL tuyệt đối)
  static Uri _uri(String endpoint, [Map<String, dynamic>? query]) {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return Uri.parse(endpoint).replace(queryParameters: _encodeQuery(query));
    }
    final base = baseUrl.endsWith('/')
        ? baseUrl.substring(0, baseUrl.length - 1)
        : baseUrl;
    final path = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    return Uri.parse(
      '$base$path',
    ).replace(queryParameters: _encodeQuery(query));
  }

  static Map<String, String>? _encodeQuery(Map<String, dynamic>? q) {
    if (q == null) return null;
    final map = <String, String>{};
    q.forEach((k, v) {
      if (v == null) return;
      map[k] = v.toString();
    });
    return map;
  }

  // 6) Xử lý response chung (+ unwrap 'status_code/message/data')
  static T _decode<T>(http.Response r, {T Function(dynamic json)? parser}) {
    dynamic body;
    try {
      body = r.body.isNotEmpty ? jsonDecode(r.body) : null;
    } catch (_) {
      body = r.body; // non-JSON fallback
    }

    // HTTP error
    final httpOk = r.statusCode >= 200 && r.statusCode < 300;
    if (!httpOk) {
      final msg = (body is Map && body['message'] is String)
          ? body['message'] as String
          : 'Request failed';
      throw ApiException(msg, statusCode: r.statusCode);
    }

    // App-level: { status_code, message, data? }
    if (body is Map && body.containsKey('status_code')) {
      final sc = (body['status_code'] as num?)?.toInt() ?? 200;
      if (sc < 200 || sc >= 300) {
        final msg = (body['message'] ?? 'Request failed').toString();
        throw ApiException(msg, statusCode: sc);
      }
      if (body.containsKey('data')) {
        body = body['data'];
      }
    }

    return parser != null ? parser(body) : (body as T);
  }

  // 7) GET
  static Future<T> get<T>(
    String endpoint, {
    Map<String, dynamic>? query,
    Map<String, String>? extraHeaders,
    T Function(dynamic json)? parser,
  }) async {
    final res = await _client
        .get(
          _uri(endpoint, query),
          headers: _headers(json: false, extra: extraHeaders),
        )
        .timeout(_timeout);
    return _decode<T>(res, parser: parser);
  }

  // 8) POST (JSON)
  static Future<T> post<T>(
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, dynamic>? query,
    Map<String, String>? extraHeaders,
    T Function(dynamic json)? parser,
  }) async {
    final res = await _client
        .post(
          _uri(endpoint, query),
          headers: _headers(extra: extraHeaders),
          body: jsonEncode(body ?? {}),
        )
        .timeout(_timeout);
    return _decode<T>(res, parser: parser);
  }

  // 9) PUT
  static Future<T> put<T>(
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, dynamic>? query,
    Map<String, String>? extraHeaders,
    T Function(dynamic json)? parser,
  }) async {
    final res = await _client
        .put(
          _uri(endpoint, query),
          headers: _headers(extra: extraHeaders),
          body: jsonEncode(body ?? {}),
        )
        .timeout(_timeout);
    return _decode<T>(res, parser: parser);
  }

  // 10) DELETE
  static Future<T> delete<T>(
    String endpoint, {
    Map<String, dynamic>? query,
    Map<String, String>? extraHeaders,
    T Function(dynamic json)? parser,
  }) async {
    final res = await _client
        .delete(
          _uri(endpoint, query),
          headers: _headers(json: false, extra: extraHeaders),
        )
        .timeout(_timeout);
    return _decode<T>(res, parser: parser);
  }

  // 11) MULTIPART (upload file)
  static Future<T> upload<T>(
    String endpoint, {
    required Map<String, String> fields,
    required File file,
    String fileField = 'file',
    Map<String, dynamic>? query,
    Map<String, String>? extraHeaders,
    T Function(dynamic json)? parser,
  }) async {
    final uri = _uri(endpoint, query);
    final req = http.MultipartRequest('POST', uri);
    req.headers.addAll(_headers(json: false, extra: extraHeaders));
    req.fields.addAll(fields);
    req.files.add(await http.MultipartFile.fromPath(fileField, file.path));

    final streamed = await req.send().timeout(_timeout);
    final res = await http.Response.fromStream(streamed);
    return _decode<T>(res, parser: parser);
  }

  static void dispose() => _client.close();

  // ===== Helpers =====
  static String get _platformBaseUrl {
    if (Platform.isAndroid) return 'http://192.168.183.1:8000/api';
    return 'http://192.168.183.1:8000/api';
  }
}
