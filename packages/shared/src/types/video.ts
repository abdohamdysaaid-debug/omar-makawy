export type VideoProviderType = 'YOUTUBE' | 'BUNNY_STREAM' | 'S3';
export type VideoType = 'MAIN' | 'SOLUTION';

export interface VideoItem {
  id: string;
  lecture_id: string;
  video_type: VideoType;
  provider: VideoProviderType;
  provider_video_id: string;
  duration_seconds: number;
  status: string;
  thumbnail_url?: string | null;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface AttachVideoPayload {
  video_type: VideoType;
  provider?: VideoProviderType;
  video_input: string;
  duration_seconds: number;
  thumbnail_url?: string;
  status?: string;
}

export interface PlaybackAuthorizationInfo {
  provider: VideoProviderType;
  video_type: VideoType;
  provider_video_id: string;
  embed_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  authorized_at: string;
  expires_in_seconds: number;
}

export interface VideoAuthorizationResponse {
  watch_session_id: string;
  playback_info: PlaybackAuthorizationInfo;
  resume_position: number;
  max_position: number;
  validated_unique_seconds: number;
  is_completed: boolean;
  video: {
    id: string;
    lecture_id: string;
    video_type: VideoType;
    provider: VideoProviderType;
    duration_seconds: number;
  };
}

export interface LectureProgressResponse {
  lecture_id: string;
  user_id: string;
  is_completed: boolean;
  completed_at: string | null;
  last_activity_at: string | null;
  main_video: {
    available: boolean;
    completed: boolean;
    duration_seconds: number;
    validated_unique_seconds: number;
    max_position: number;
    percentage: number;
  };
  solution_video: {
    available: boolean;
    completed: boolean;
    duration_seconds: number;
    validated_unique_seconds: number;
    max_position: number;
    percentage: number;
  };
}
