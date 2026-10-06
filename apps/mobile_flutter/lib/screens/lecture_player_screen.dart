import 'dart:async';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import '../config/theme.dart';
import '../models/lecture_model.dart';
import '../services/api_service.dart';
import '../widgets/app_header.dart';

class LecturePlayerScreen extends StatefulWidget {
  final String lectureId;

  const LecturePlayerScreen({super.key, required this.lectureId});

  @override
  State<LecturePlayerScreen> createState() => _LecturePlayerScreenState();
}

class _LecturePlayerScreenState extends State<LecturePlayerScreen>
    with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  LectureModel? _lecture;
  bool _isLoading = true;
  String? _errorMessage;

  YoutubePlayerController? _mainController;
  YoutubePlayerController? _solutionController;

  late TabController _tabController;
  Timer? _telemetryTimer;
  int _activeTabIndex = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        setState(() {
          _activeTabIndex = _tabController.index;
        });
      }
    });
    _fetchLectureData();
  }

  Future<void> _fetchLectureData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiService.get('/lectures/${widget.lectureId}');
      if (response is Map<String, dynamic>) {
        final lecture = LectureModel.fromJson(response);

        // Fetch videos list
        try {
          final videosRes = await _apiService.get('/lectures/${widget.lectureId}/videos');
          if (videosRes is List) {
            String? mainUrl = lecture.mainVideoUrl;
            String? solutionUrl = lecture.solutionVideoUrl;

            for (var v in videosRes) {
              final type = v['video_type']?.toString().toUpperCase();
              final url = v['video_url']?.toString() ?? v['url']?.toString();
              if (type == 'MAIN') mainUrl = url;
              if (type == 'SOLUTION') solutionUrl = url;
            }

            _lecture = LectureModel(
              id: lecture.id,
              title: lecture.title,
              description: lecture.description,
              thumbnailUrl: lecture.thumbnailUrl,
              durationMinutes: lecture.durationMinutes,
              orderIndex: lecture.orderIndex,
              isFree: lecture.isFree,
              isLocked: lecture.isLocked,
              mainVideoUrl: mainUrl,
              solutionVideoUrl: solutionUrl,
              progressPercent: lecture.progressPercent,
              lastPositionSeconds: lecture.lastPositionSeconds,
              isCompleted: lecture.isCompleted,
              attachments: lecture.attachments,
            );
          } else {
            _lecture = lecture;
          }
        } catch (_) {
          _lecture = lecture;
        }

        _initializePlayers();
        _startTelemetryHeartbeat();

        setState(() {
          _isLoading = false;
        });
      } else {
        throw Exception('فشل في جلب بيانات المحاضرة');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _initializePlayers() {
    if (_lecture?.mainVideoUrl != null && _lecture!.mainVideoUrl!.isNotEmpty) {
      final videoId = YoutubePlayer.convertUrlToId(_lecture!.mainVideoUrl!) ?? '';
      if (videoId.isNotEmpty) {
        _mainController = YoutubePlayerController(
          initialVideoId: videoId,
          flags: const YoutubePlayerFlags(
            autoPlay: false,
            mute: false,
            enableCaption: false,
            forceHD: true,
          ),
        );
      }
    }

    if (_lecture?.solutionVideoUrl != null && _lecture!.solutionVideoUrl!.isNotEmpty) {
      final videoId = YoutubePlayer.convertUrlToId(_lecture!.solutionVideoUrl!) ?? '';
      if (videoId.isNotEmpty) {
        _solutionController = YoutubePlayerController(
          initialVideoId: videoId,
          flags: const YoutubePlayerFlags(
            autoPlay: false,
            mute: false,
            enableCaption: false,
            forceHD: true,
          ),
        );
      }
    }
  }

  void _startTelemetryHeartbeat() {
    _telemetryTimer?.cancel();
    _telemetryTimer = Timer.periodic(const Duration(seconds: 15), (timer) {
      _sendProgressTelemetry();
    });
  }

  Future<void> _sendProgressTelemetry() async {
    final activeController = _activeTabIndex == 0 ? _mainController : _solutionController;
    if (activeController == null || !activeController.value.isPlaying) return;

    try {
      final currentPos = activeController.value.position.inSeconds;
      final totalDuration = activeController.value.metaData.duration.inSeconds;

      if (totalDuration > 0) {
        final progress = (currentPos / totalDuration) * 100;
        await _apiService.post(
          '/videos/telemetry/heartbeat',
          body: {
            'lecture_id': widget.lectureId,
            'current_position': currentPos,
            'duration': totalDuration,
            'progress_percent': progress.clamp(0.0, 100.0),
            'video_type': _activeTabIndex == 0 ? 'MAIN' : 'SOLUTION',
          },
          requiresAuth: true,
        );
      }
    } catch (_) {
      // Telemetry failure should not disrupt user playback
    }
  }

  @override
  void dispose() {
    _telemetryTimer?.cancel();
    _mainController?.dispose();
    _solutionController?.dispose();
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppHeader(
        title: _lecture?.title ?? 'مشاهدة المحاضرة',
        showBackButton: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, size: 56, color: AppColors.error),
                        const SizedBox(height: 16),
                        Text(_errorMessage!, textAlign: TextAlign.center),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: _fetchLectureData,
                          child: const Text('إعادة المحاولة'),
                        ),
                      ],
                    ),
                  ),
                )
              : _buildPlayerContent(isDark),
    );
  }

  Widget _buildPlayerContent(bool isDark) {
    final lecture = _lecture!;

    return Column(
      children: [
        // Video Player Box
        Container(
          width: double.infinity,
          color: Colors.black,
          child: AspectRatio(
            aspectRatio: 16 / 9,
            child: _activeTabIndex == 0
                ? (_mainController != null
                    ? YoutubePlayer(
                        controller: _mainController!,
                        showVideoProgressIndicator: true,
                        progressIndicatorColor: AppColors.primary,
                      )
                    : const Center(
                        child: Text(
                          'فيديو الشرح الأساسي غير متاح حالياً',
                          style: TextStyle(color: Colors.white70),
                        ),
                      ))
                : (_solutionController != null
                    ? YoutubePlayer(
                        controller: _solutionController!,
                        showVideoProgressIndicator: true,
                        progressIndicatorColor: AppColors.primary,
                      )
                    : const Center(
                        child: Text(
                          'فيديو الحل والواجب غير متاح حالياً',
                          style: TextStyle(color: Colors.white70),
                        ),
                      )),
          ),
        ),

        // Dual Video Tabs Header
        Container(
          color: isDark ? AppColors.darkCard : AppColors.lightCard,
          child: TabBar(
            controller: _tabController,
            labelColor: AppColors.primary,
            unselectedLabelColor: isDark ? Colors.white54 : Colors.black54,
            indicatorColor: AppColors.primary,
            indicatorWeight: 3,
            tabs: const [
              Tab(
                icon: Icon(Icons.play_circle_outline, size: 20),
                text: 'فيديو الشرح',
              ),
              Tab(
                icon: Icon(Icons.check_circle_outline, size: 20),
                text: 'فيديو الحل والواجب',
              ),
            ],
          ),
        ),

        // Tab Content / Details & Attachments
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title and Progress Badge
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        lecture.title,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ),
                    if (lecture.isCompleted)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.check_circle, size: 14, color: AppColors.primary),
                            SizedBox(width: 4),
                            Text(
                              'مكتملة',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),

                // Description
                if (lecture.description != null && lecture.description!.isNotEmpty) ...[
                  Text(
                    lecture.description!,
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? Colors.white70 : Colors.black87,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                const Divider(),
                const SizedBox(height: 10),

                // Attachments / PDF Section
                const Row(
                  children: [
                    Icon(Icons.attach_file, color: AppColors.primary, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'المذكرات والملفات المرفقة',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                if (lecture.attachments.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkCard : AppColors.lightCard,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Center(
                      child: Text(
                        'لا توجد ملفات مرفقة مع هذه المحاضرة',
                        style: TextStyle(fontSize: 13, color: Colors.grey),
                      ),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: lecture.attachments.length,
                    itemBuilder: (context, index) {
                      final att = lecture.attachments[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        elevation: 0,
                        color: isDark ? AppColors.darkCard : AppColors.lightCard,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                          side: BorderSide(
                            color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                          ),
                        ),
                        child: ListTile(
                          leading: const Icon(Icons.picture_as_pdf, color: Colors.red),
                          title: Text(att.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          trailing: const Icon(Icons.download, color: AppColors.primary),
                          onTap: () async {
                            if (att.fileUrl.isNotEmpty) {
                              final uri = Uri.parse(att.fileUrl);
                              if (await canLaunchUrl(uri)) {
                                await launchUrl(uri, mode: LaunchMode.externalApplication);
                              }
                            }
                          },
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
