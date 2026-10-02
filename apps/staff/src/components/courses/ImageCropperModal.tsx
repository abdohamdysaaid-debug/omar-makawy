'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File, previewUrl: string) => void;
  aspectRatio?: number; // default 16 / 9 = 1.777777778
}

export function ImageCropperModal({
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio = 16 / 9,
}: ImageCropperModalProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>('course-thumbnail.jpg');
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setImageSrc(null);
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setError(null);
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError(
        isAr
          ? 'نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP.'
          : 'Unsupported file type. Please select a JPG, PNG, or WEBP image.'
      );
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(
        isAr
          ? 'حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 10 ميجابايت.'
          : 'Image size exceeds the 10 MB limit.'
      );
      return;
    }

    setError(null);
    setOriginalFilename(file.name.replace(/\.[^/.]+$/, '') + '.jpg');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImageSrc(result);
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCropAndSave = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    // Output target canvas at 1280x720 (16:9 standard HD)
    const targetWidth = 1280;
    const targetHeight = 720;

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background with clean solid dark color if translucent
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Calculate transformations
    const container = containerRef.current;
    const containerWidth = container ? container.clientWidth : 480;
    const containerHeight = containerWidth / aspectRatio;

    const scaleFactor = targetWidth / containerWidth;

    ctx.save();
    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale * scaleFactor, scale * scaleFactor);

    // Center image and apply offset
    const imgAspect = img.width / img.height;
    let drawWidth = containerWidth;
    let drawHeight = containerWidth / imgAspect;

    if (imgAspect < aspectRatio) {
      drawHeight = containerHeight;
      drawWidth = containerHeight * imgAspect;
    }

    ctx.drawImage(
      img,
      -drawWidth / 2 + position.x / scale,
      -drawHeight / 2 + position.y / scale,
      drawWidth,
      drawHeight
    );
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError(isAr ? 'فشل معالجة واقتصاص الصورة' : 'Failed to crop image');
          return;
        }

        const croppedFile = new File([blob], originalFilename, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        const previewUrl = URL.createObjectURL(blob);
        onCropComplete(croppedFile, previewUrl);
        onClose();
      },
      'image/jpeg',
      0.92
    );
  }, [aspectRatio, isAr, onClose, onCropComplete, originalFilename, position.x, position.y, rotation, scale]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/70 dark:text-brand-400">
              <Crop className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {isAr ? 'محرر واقتصاص صورة الغلاف (16:9)' : 'Course Thumbnail Cropper (16:9)'}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {isAr
                  ? 'قم بضبط أبعاد وتمركز الصورة بما يتناسب مع نسبة العرض 16:9'
                  : 'Adjust zoom, position, and rotation to fit 16:9 banner standard'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {!imageSrc ? (
            /* Upload Initial Step */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-900/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                {isAr ? 'اختر صورة من جهازك للبدء' : 'Select an image from your device'}
              </p>
              <p className="text-xs text-neutral-400 max-w-xs">
                {isAr
                  ? 'الصيغ المدعومة: JPG, PNG, WEBP (الحد الأقصى: 10 ميجابايت)'
                  : 'Supported formats: JPG, PNG, WEBP (Max: 10 MB)'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            /* Active Crop Canvas Container */
            <div className="space-y-4">
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative aspect-video w-full bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-700 cursor-grab active:cursor-grabbing select-none"
              >
                {/* Image Container with Transforms */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Crop preview"
                    className="max-w-none max-h-none object-contain"
                  />
                </div>

                {/* 16:9 Rule of Thirds Crop Overlay Guide */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/40">
                  <div className="border-e border-b border-white/20" />
                  <div className="border-e border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-e border-b border-white/20" />
                  <div className="border-e border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-e border-white/20" />
                  <div className="border-e border-white/20" />
                  <div />
                </div>
              </div>

              {/* Controls Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                    title={isAr ? 'تصغير' : 'Zoom Out'}
                    className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.05}
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                  <button
                    type="button"
                    onClick={() => setScale((s) => Math.min(3, s + 0.1))}
                    title={isAr ? 'تكبير' : 'Zoom In'}
                    className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] font-mono text-neutral-500 w-10 text-center">
                    {Math.round(scale * 100)}%
                  </span>
                </div>

                {/* Rotate & Reset Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScale(1);
                      setRotation(0);
                      setPosition({ x: 0, y: 0 });
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                  >
                    {isAr ? 'إعادة ضبط' : 'Reset'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageSrc(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    {isAr ? 'تغيير الصورة' : 'Replace'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          {imageSrc && (
            <button
              type="button"
              onClick={handleCropAndSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all active:scale-[0.99]"
            >
              <Check className="h-4 w-4" />
              <span>{isAr ? 'تطبيق الاقتصاص واعتماد الصورة' : 'Apply Crop & Use Image'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
