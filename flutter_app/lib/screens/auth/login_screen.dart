import 'package:flutter/material.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:mobile/providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _accountCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _accountCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _doLogin() async {
    if (!_formKey.currentState!.validate()) return;
    final p = context.read<AuthProvider>();
    final ok = await p.login(_accountCtrl.text.trim(), _passCtrl.text);
    if (!mounted) return;

    if (ok) {
      Navigator.of(context).pop(true);
      return;
    } else {
      final msg = p.error ?? 'Đăng nhập thất bại. Vui lòng thử lại.';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;

    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 460),
              child: Card(
                elevation: 0.5,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 22,
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        const SizedBox(height: 4),
                        const Icon(
                          Icons.lock_outline,
                          size: 40,
                          color: Color(0xFF6A5BE2),
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          'Đăng nhập',
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 20,
                          ),
                        ),
                        const SizedBox(height: 18),

                        // Account (email/phone/username)
                        TextFormField(
                          controller: _accountCtrl,
                          decoration: const InputDecoration(
                            labelText: 'Tài khoản (Email/SĐT)',
                            prefixIcon: Icon(Icons.person_outline),
                            border: OutlineInputBorder(),
                          ),
                          validator: (v) {
                            if ((v ?? '').trim().isEmpty) {
                              return 'Vui lòng nhập tài khoản';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),

                        // Password
                        TextFormField(
                          controller: _passCtrl,
                          obscureText: _obscure,
                          decoration: InputDecoration(
                            labelText: 'Mật khẩu',
                            prefixIcon: const Icon(Icons.lock_outline),
                            border: const OutlineInputBorder(),
                            suffixIcon: IconButton(
                              onPressed: () =>
                                  setState(() => _obscure = !_obscure),
                              icon: Icon(
                                _obscure
                                    ? Icons.visibility_off
                                    : Icons.visibility,
                              ),
                            ),
                          ),
                          validator: (v) {
                            if ((v ?? '').isEmpty) {
                              return 'Vui lòng nhập mật khẩu';
                            }
                            if ((v ?? '').length < 6) {
                              return 'Tối thiểu 6 ký tự';
                            }
                            return null;
                          },
                        ),

                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () {}, // TODO: Quên mật khẩu
                            child: const Text('Quên mật khẩu?'),
                          ),
                        ),

                        const SizedBox(height: 6),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: isLoading ? null : _doLogin,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text('Đăng nhập'),
                          ),
                        ),

                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('Chưa có tài khoản?'),
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).pushNamed('/register');
                              },
                              child: const Text('Đăng ký'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
