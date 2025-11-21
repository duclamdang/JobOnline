import 'package:flutter/material.dart';
import 'package:mobile/api/models/company_model.dart';
import 'package:mobile/screens/job/widgets/section_title.dart';
import 'package:mobile/utils/open_map.dart';
import 'package:mobile/utils/open_website.dart';

class AboutTab extends StatelessWidget {
  final CompanyModel company;

  const AboutTab({super.key, required this.company});

  String? get mapQuery {
    final addr = company.address?.trim();
    if (addr != null && addr.isNotEmpty) return addr;

    final loc = company.locationName?.trim();
    if (loc != null && loc.isNotEmpty) return loc;

    return null;
  }

  @override
  Widget build(BuildContext context) {
    final rawDescription =
        company.description ?? 'Chưa có nội dung giới thiệu cho công ty này.';
    final description = rawDescription.trim();

    final email = company.email?.trim();
    final phone = company.phone?.trim();
    final address = company.address?.trim();
    final location = company.locationName?.trim();
    final website = company.website?.trim();
    final companySize = company.companySize?.trim();
    final industry = company.industryTitle?.trim();
    final query = mapQuery;

    final hasEmail = email != null && email.isNotEmpty;
    final hasPhone = phone != null && phone.isNotEmpty;
    final hasAddress = address != null && address.isNotEmpty;
    final hasLocation = location != null && location.isNotEmpty;
    final hasWebsite = website != null && website.isNotEmpty;
    final hasCompanySize = companySize != null && companySize.isNotEmpty;
    final hasIndustry = industry != null && industry.isNotEmpty;
    final hasMap = query != null && query.isNotEmpty;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Giới thiệu
          const SectionTitle(title: 'Giới thiệu công ty'),
          const SizedBox(height: 8),
          ExpandableDescription(text: description),
          const SizedBox(height: 16),

          // Email
          if (hasEmail) ...[
            const SectionTitle(title: 'Email'),
            const SizedBox(height: 8),
            Text(
              email,
              style: const TextStyle(
                fontSize: 15,
                height: 1.4,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Số điện thoại
          if (hasPhone) ...[
            const SectionTitle(title: 'Số điện thoại'),
            const SizedBox(height: 8),
            Text(
              phone,
              style: const TextStyle(
                fontSize: 15,
                height: 1.4,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Địa chỉ
          if (hasAddress) ...[
            const SectionTitle(title: 'Địa chỉ'),
            const SizedBox(height: 8),
            Text(
              address,
              style: const TextStyle(
                fontSize: 15,
                height: 1.4,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Khu vực
          if (hasLocation) ...[
            const SectionTitle(title: 'Khu vực'),
            const SizedBox(height: 8),
            Text(
              location,
              style: const TextStyle(
                fontSize: 15,
                height: 1.4,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Website
          if (hasWebsite) ...[
            const SectionTitle(title: 'Website'),
            const SizedBox(height: 8),
            InkWell(
              onTap: () => openWebsite(website, context: context),
              child: Text(
                website,
                style: const TextStyle(
                  fontSize: 15,
                  height: 1.4,
                  color: Colors.blue,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Quy mô
          if (hasCompanySize) ...[
            const SectionTitle(title: 'Quy mô công ty'),
            const SizedBox(height: 8),
            Text(
              companySize,
              style: const TextStyle(
                fontSize: 15,
                height: 1.4,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Ngành nghề
          if (hasIndustry) ...[
            const SectionTitle(title: 'Ngành nghề'),
            const SizedBox(height: 8),
            Text(
              industry,
              style: const TextStyle(
                fontSize: 15,
                height: 1.4,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Bản đồ
          if (hasMap) ...[
            const SectionTitle(title: 'Bản đồ'),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () => openMap(query, context),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  height: 180,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Stack(
                    children: [
                      Align(
                        alignment: Alignment.center,
                        child: Icon(
                          Icons.location_on_outlined,
                          size: 72,
                          color: Colors.grey.shade400,
                        ),
                      ),
                      Positioned(
                        left: 0,
                        right: 0,
                        bottom: 0,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 10,
                          ),
                          // ignore: deprecated_member_use
                          color: Colors.white.withOpacity(0.9),
                          child: Row(
                            children: [
                              const Icon(Icons.map_outlined, size: 18),
                              const SizedBox(width: 8),
                              const Expanded(
                                child: Text(
                                  'Mở vị trí trong Google Maps',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Icon(Icons.open_in_new, size: 16),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              query,
              style: const TextStyle(
                fontSize: 13,
                color: Colors.black54,
                height: 1.4,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Chỉ thu gọn / mở rộng phần mô tả
class ExpandableDescription extends StatefulWidget {
  final String text;

  const ExpandableDescription({super.key, required this.text});

  @override
  State<ExpandableDescription> createState() => _ExpandableDescriptionState();
}

class _ExpandableDescriptionState extends State<ExpandableDescription> {
  bool _expanded = false;
  static const int _trimLength = 220; // ngưỡng coi là dài

  @override
  Widget build(BuildContext context) {
    final raw = widget.text.trim().isEmpty ? '—' : widget.text.trim();
    final bool isLong = raw.length > _trimLength;

    final String displayText;
    if (!_expanded && isLong) {
      displayText = raw.substring(0, _trimLength).trimRight() + '...';
    } else {
      displayText = raw;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          displayText,
          style: const TextStyle(
            fontSize: 15,
            height: 1.6,
            color: Colors.black87,
          ),
        ),
        if (isLong)
          TextButton(
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: const Size(0, 0),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            onPressed: () {
              setState(() {
                _expanded = !_expanded;
              });
            },
            child: Text(
              _expanded ? 'Thu gọn' : 'Xem thêm',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
          ),
      ],
    );
  }
}
