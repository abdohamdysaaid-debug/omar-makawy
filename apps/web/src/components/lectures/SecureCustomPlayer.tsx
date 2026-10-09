'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SecureCustomPlayerProps {
  videoId: string;
  resumePosition?: number;
  initialDuration?: number;
  title: string;
  studentName?: string;
  onStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function SecureCustomPlayer({
  videoId,
  resumePosition = 0,
  initialDuration = 0,
  title,
  studentName,
  onStateChange,
  onTimeUpdate,
}: SecureCustomPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(resumePosition);
  const [duration, setDuration] = useState<number>(initialDuration || 0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [centerFeedback, setCenterFeedback] = useState<'play' | 'pause' | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxWatchedTimeRef = useRef<number>(resumePosition || 0);

  // Send JSON-RPC command to YouTube iframe API
  const sendCommand = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  }, []);

  const sendListening = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'listening' }),
        '*'
      );
    }
  }, []);

  // Sync state changes back to parent
  useEffect(() => {
    onStateChange?.(isPlaying);
  }, [isPlaying, onStateChange]);

  useEffect(() => {
    onTimeUpdate?.(currentTime, duration);
  }, [currentTime, duration, onTimeUpdate]);

  // Handle Play / Pause Toggle
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      sendCommand('pauseVideo');
      setIsPlaying(false);
      setCenterFeedback('pause');
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      sendCommand('playVideo');
      setIsPlaying(true);
      setCenterFeedback('play');
      // Set 11-second auto-hide timeout when starting play
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 11000);
    }
    setTimeout(() => setCenterFeedback(null), 800);
  }, [isPlaying, sendCommand]);

  // Keep maxWatchedTimeRef updated as video plays forward
  useEffect(() => {
    if (currentTime > maxWatchedTimeRef.current) {
      maxWatchedTimeRef.current = currentTime;
    }
  }, [currentTime]);

  // Strict Seek helper: Prevents forward seeking beyond watched time and accidental reset to 0
  const handleSeek = (seconds: number) => {
    const maxAllowed = maxWatchedTimeRef.current;

    // 1. Block any attempt to seek forward beyond watched position
    if (seconds > maxAllowed + 2) {
      sendCommand('seekTo', [maxAllowed, true]);
      setCurrentTime(maxAllowed);
      return;
    }

    // 2. Prevent accidental reset to 0 if student clicks on the progress bar when already deep into the video
    if (seconds < 2 && maxAllowed > 5) {
      sendCommand('seekTo', [currentTime, true]);
      return;
    }

    const safeTarget = Math.max(0, Math.min(maxAllowed, seconds));
    setCurrentTime(safeTarget);
    sendCommand('seekTo', [safeTarget, true]);
  };

  // Speed Helper
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    sendCommand('setPlaybackRate', [speed]);
    setShowSpeedMenu(false);
  };

  // Volume Helper
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol === 0) {
      setIsMuted(true);
      sendCommand('mute');
    } else {
      if (isMuted) {
        setIsMuted(false);
        sendCommand('unMute');
      }
      sendCommand('setVolume', [newVol]);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      sendCommand('unMute');
      if (volume === 0) setVolume(100);
    } else {
      setIsMuted(true);
      sendCommand('mute');
    }
  };

  // Fullscreen Helper
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
          setShowSpeedMenu(false);
        }, 11000);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isPlaying]);

  // Listen to postMessage from YouTube iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      let data: any = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      if (data.event === 'onReady' || data.event === 'initialDelivery') {
        sendListening();
        sendCommand('getDuration');
        sendCommand('getCurrentTime');
      }

      if (data.event === 'onStateChange') {
        // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
        if (data.info === 1) {
          setIsPlaying(true);
        } else if (data.info === 2 || data.info === 0) {
          setIsPlaying(false);
        }
        if (data.info === 0 && duration > 0) {
          setCurrentTime(duration);
        }
      }

      // Continuous telemetry infoDelivery
      if (data.info && typeof data.info === 'object') {
        if (typeof data.info.duration === 'number' && data.info.duration > 0) {
          setDuration(data.info.duration);
        }
        if (typeof data.info.currentTime === 'number') {
          setCurrentTime(data.info.currentTime);
        }
        if (typeof data.info.playerState === 'number') {
          if (data.info.playerState === 1) setIsPlaying(true);
          if (data.info.playerState === 2) setIsPlaying(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [duration, sendListening, sendCommand]);

  // Periodic heartbeat sync to query exact duration and current time from YouTube iframe
  useEffect(() => {
    sendListening();
    const interval = setInterval(() => {
      sendListening();
      if (iframeRef.current?.contentWindow) {
        sendCommand('getDuration');
        sendCommand('getCurrentTime');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sendListening, sendCommand]);

  // Mouse activity: show controls and auto-hide after 11 seconds when playing
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 11000); // 11-second duration as requested
    }
  }, [isPlaying]);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const sec = Math.floor(seconds || 0);
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const effectiveDuration = duration > 0 ? duration : initialDuration > 0 ? initialDuration : 0;

  // Embed URL with controls=0 (Hides YouTube title, share, logo, and native control bar)
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&controls=0&rel=0&playsinline=1&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1&fs=0${
    resumePosition > 0 ? `&start=${Math.floor(resumePosition)}` : ''
  }`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border-2 border-[#0d6e4f]/40 dark:border-emerald-500/30 shadow-2xl group select-none font-cairo"
    >
      {/* 1. Underlying YouTube IFrame with controls=0 */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="w-full h-full border-0 pointer-events-none"
      />

      {/* 2. FULL TRANSPARENT CLICK SHIELD (Catches 100% of clicks over video) */}
      <div
        className="absolute inset-0 z-20 cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* 3. CENTER PLAY / PAUSE FEEDBACK ANIMATION */}
      {centerFeedback && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-ping duration-500">
          <div className="w-20 h-20 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-emerald-400 border border-emerald-500/40">
            {centerFeedback === 'play' ? (
              <Play className="w-10 h-10 fill-current ms-1" />
            ) : (
              <Pause className="w-10 h-10 fill-current" />
            )}
          </div>
        </div>
      )}

      {/* INITIAL PLAY OVERLAY (Before video starts) */}
      {!isPlaying && currentTime === resumePosition && (
        <div
          className="absolute inset-0 z-25 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-[#0d6e4f] text-white flex items-center justify-center shadow-2xl shadow-[#0d6e4f]/50 hover:scale-110 transition-transform">
            <Play className="w-9 h-9 fill-current ms-1" />
          </div>
          <span className="text-sm font-black text-white bg-black/70 px-4 py-1.5 rounded-full border border-white/10">
            اضغط لبدء مشاهدة المحاضرة
          </span>
        </div>
      )}

      {/* 4. TOP SOLID BLACK FRAME (Hides channel logo & title completely as part of the frame) */}
      <div
        className={`absolute top-0 inset-x-0 z-30 p-3 sm:p-4 bg-black border-b border-white/10 transition-opacity duration-300 pointer-events-auto flex items-center justify-between text-white ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 max-w-[70%]">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-black text-xs sm:text-sm text-gray-100 truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {studentName && (
            <span className="hidden sm:inline text-[11px] font-mono text-gray-400 bg-neutral-900 px-2.5 py-1 rounded-lg border border-white/10">
              طالب: {studentName}
            </span>
          )}
          <span className="text-[10px] font-black bg-[#0d6e4f] text-white px-2.5 py-1 rounded-lg shadow-sm">
            منصة مستر عمر مكاوي
          </span>
        </div>
      </div>

      {/* 5. BOTTOM SOLID BLACK CONTROL BAR FRAME (Hides YouTube watermark logo completely) */}
      <div
        className={`absolute bottom-0 inset-x-0 z-30 p-3 sm:p-4 bg-black border-t border-white/10 transition-opacity duration-300 pointer-events-auto space-y-2.5 text-white ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Interactive Progress Slider */}
        <div className="relative group/timeline flex items-center">
          <input
            type="range"
            min={0}
            max={effectiveDuration > 0 ? effectiveDuration : 100}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-700/80 rounded-lg appearance-none cursor-pointer accent-[#0d6e4f] hover:h-2.5 transition-all"
            style={{
              background: `linear-gradient(to right, #0d6e4f 0%, #10b981 ${
                effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0
              }%, #374151 ${
                effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0
              }%, #374151 100%)`,
            }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-xs font-bold gap-2">
          {/* Left Controls: Play/Pause, Volume, Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-xl bg-[#0d6e4f] hover:bg-[#0a4834] text-white transition-all shadow-md shadow-[#0d6e4f]/30 cursor-pointer"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ms-0.5" />
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/vol relative">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-16 sm:w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-emerald-400 hidden sm:block"
              />
            </div>

            {/* Current / Duration Time */}
            <span className="text-[11px] font-mono text-gray-300 ps-1">
              {formatTime(currentTime)} / {effectiveDuration > 0 ? formatTime(effectiveDuration) : '--:--'}
            </span>
          </div>

          {/* Right Controls: Speed Selector & Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-400 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-emerald-500/30"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{playbackSpeed}x</span>
              </button>

              {/* Speed Menu Popover */}
              {showSpeedMenu && (
                <div className="absolute bottom-full end-0 mb-2 w-32 bg-stone-900 border border-stone-700 rounded-2xl p-1.5 shadow-2xl z-50 text-xs font-bold space-y-0.5 animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-3 py-1.5 text-[10px] text-gray-400 border-b border-stone-800">
                    سرعة التشغيل
                  </div>
                  {SPEED_OPTIONS.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleSpeedChange(rate)}
                      className={`w-full px-3 py-1.5 rounded-xl text-start flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        playbackSpeed === rate
                          ? 'bg-[#0d6e4f] text-white'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{rate === 1 ? '1x (عادي)' : `${rate}x`}</span>
                      {playbackSpeed === rate && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
              title={isFullscreen ? 'إلغاء ملء الشاشة' : 'ملء الشاشة'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
