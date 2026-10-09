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
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SecureCustomPlayerProps {
  videoId: string;
  resumePosition?: number;
  title: string;
  studentName?: string;
  onStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function SecureCustomPlayer({
  videoId,
  resumePosition = 0,
  title,
  studentName,
  onStateChange,
  onTimeUpdate,
}: SecureCustomPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(resumePosition);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [centerFeedback, setCenterFeedback] = useState<'play' | 'pause' | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Send JSON-RPC command to YouTube iframe API
  const sendCommand = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
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
    } else {
      sendCommand('playVideo');
      setIsPlaying(true);
      setCenterFeedback('play');
    }
    setTimeout(() => setCenterFeedback(null), 800);
  }, [isPlaying, sendCommand]);

  const maxWatchedTimeRef = useRef<number>(resumePosition || 0);

  // Keep maxWatchedTimeRef updated as video plays forward
  useEffect(() => {
    if (currentTime > maxWatchedTimeRef.current) {
      maxWatchedTimeRef.current = currentTime;
    }
  }, [currentTime]);

  // Strict Seek helper
  const handleSeek = (seconds: number) => {
    const maxAllowed = maxWatchedTimeRef.current;

    // Block seeking forward beyond watched position
    if (seconds > maxAllowed + 2) {
      sendCommand('seekTo', [maxAllowed, true]);
      setCurrentTime(maxAllowed);
      return;
    }

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
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

      if (data.event === 'onStateChange') {
        if (data.info === 1) setIsPlaying(true);
        if (data.info === 2) setIsPlaying(false);
        if (data.info === 0) {
          setIsPlaying(false);
          setCurrentTime(duration);
        }
      }

      if (data.event === 'infoDelivery' && data.info) {
        if (typeof data.info.currentTime === 'number') {
          setCurrentTime(data.info.currentTime);
        }
        if (typeof data.info.duration === 'number' && data.info.duration > 0) {
          setDuration(data.info.duration);
        }
        if (typeof data.info.playerState === 'number') {
          if (data.info.playerState === 1) setIsPlaying(true);
          if (data.info.playerState === 2) setIsPlaying(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [duration]);

  // Polling position backup while playing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.5 * playbackSpeed;
          return duration > 0 ? Math.min(duration, next) : next;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, duration]);

  // Mouse activity auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 4000);
    }
  };

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

  // Embed URL with controls=0 to eliminate native controls & video actions
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&controls=0&rel=0&playsinline=1&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1&fs=0${
    resumePosition > 0 ? `&start=${Math.floor(resumePosition)}` : ''
  }`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border-2 border-[#0d6e4f] shadow-2xl shadow-[#0d6e4f]/20 group select-none font-cairo"
    >
      {/* 1. Underlying YouTube IFrame */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="w-full h-full border-0 pointer-events-none"
      />

      {/* 2. FULL TRANSPARENT CLICK SHIELD */}
      <div
        className="absolute inset-0 z-20 cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* 3. CENTER CUSTOM PLAY / PAUSE BUTTON (Hides native YouTube play button) */}
      {(!isPlaying || centerFeedback) && (
        <div
          className="absolute inset-0 z-25 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all animate-fade-in"
          onClick={togglePlay}
        >
          <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-gradient-to-tr from-[#064e3b] via-[#0d6e4f] to-[#10b981] text-white flex items-center justify-center shadow-2xl shadow-[#0d6e4f]/60 hover:scale-110 transition-transform border-2 border-white/30">
            {isPlaying ? (
              <Pause className="w-10 sm:w-12 h-10 sm:h-12 fill-current" />
            ) : (
              <Play className="w-10 sm:w-12 h-10 sm:h-12 fill-current ms-1.5" />
            )}
          </div>

          {!isPlaying && (
            <div className="flex items-center gap-2 bg-[#064e3b]/90 text-white text-xs sm:text-sm font-black px-4 py-1.5 rounded-full border border-emerald-400/40 shadow-lg backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{currentTime > 0 ? 'استئناف تشغيل المحاضرة' : 'اضغط لبدء مشاهدة المحاضرة'}</span>
            </div>
          )}
        </div>
      )}

      {/* 4. TOP GREEN BRANDING & SECURITY FRAME (Covers YouTube channel logo, title, and buttons) */}
      <div
        className={`absolute top-0 inset-x-0 z-30 px-4 sm:px-6 py-3 bg-gradient-to-r from-[#042f24] via-[#0d6e4f] to-[#042f24] text-white border-b border-emerald-500/30 shadow-lg flex items-center justify-between transition-opacity duration-300 pointer-events-auto ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2.5 max-w-[65%]">
          <div className="w-7 h-7 rounded-lg bg-black/30 border border-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
          </div>
          <span className="font-black text-xs sm:text-sm text-white truncate drop-shadow-xs">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {studentName && (
            <span className="hidden md:inline text-[11px] font-mono text-emerald-100 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
              طالب: {studentName}
            </span>
          )}
          <span className="text-[10px] sm:text-xs font-black bg-white/20 text-white px-3 py-1 rounded-xl backdrop-blur-md border border-white/30 shadow-xs">
            منصة مستر عمر مكاوي
          </span>
        </div>
      </div>

      {/* 5. BOTTOM GREEN CONTROLS FRAME (Covers YouTube control bar with custom platform controls) */}
      <div
        className={`absolute bottom-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-r from-[#042f24] via-[#0d6e4f] to-[#042f24] text-white border-t border-emerald-500/30 shadow-2xl transition-opacity duration-300 pointer-events-auto space-y-2 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Custom Progress Bar with Green Theme */}
        <div className="relative group/timeline flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-emerald-300 hover:h-2.5 transition-all"
            style={{
              background: `linear-gradient(to right, #34d399 0%, #10b981 ${(currentTime / (duration || 1)) * 100}%, rgba(0,0,0,0.6) ${(currentTime / (duration || 1)) * 100}%, rgba(0,0,0,0.6) 100%)`,
            }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-xs font-bold gap-2">
          {/* Left Controls: Play/Pause, Volume, Timer */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all shadow-sm cursor-pointer border border-white/20"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ms-0.5" />
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-100 hover:text-white transition-all cursor-pointer"
                title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-300" />
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
                className="w-16 sm:w-20 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-emerald-300 hidden sm:block"
              />
            </div>

            {/* Time Display */}
            <span className="text-[11px] font-mono text-emerald-100 ps-1 font-bold">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls: Speed Selector & Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer border border-white/20 shadow-xs"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{playbackSpeed}x</span>
              </button>

              {/* Speed Menu Popover */}
              {showSpeedMenu && (
                <div className="absolute bottom-full end-0 mb-2 w-32 bg-[#064e3b] border border-emerald-500/40 rounded-2xl p-1.5 shadow-2xl z-50 text-xs font-bold space-y-0.5 animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-3 py-1.5 text-[10px] text-emerald-200 border-b border-emerald-700/50">
                    سرعة التشغيل
                  </div>
                  {SPEED_OPTIONS.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleSpeedChange(rate)}
                      className={`w-full px-3 py-1.5 rounded-xl text-start flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        playbackSpeed === rate
                          ? 'bg-[#0d6e4f] text-white font-black'
                          : 'text-emerald-100 hover:bg-white/10'
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
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer border border-white/20 shadow-xs"
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
