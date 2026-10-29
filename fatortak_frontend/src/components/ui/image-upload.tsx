
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  preview?: string;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  preview,
  className,
  accept = "image/*",
  maxSize = 5,
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, isRTL } = useLanguage();

  const handleFile = (file: File) => {
    setError('');
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(t('imageUpload.fileSizeError', { size: maxSize }));
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError(t('imageUpload.selectImageError'));
      return;
    }

    onImageSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("relative", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
      />
      {preview ? (
        <div className="relative group">
          {/* Premium Image Preview Card */}
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="relative h-56 w-full overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-950">
              <img
                src={preview}
                alt={t('imageUpload.preview')}
                className="h-full w-full object-contain"
              />
            </div>
            
            {/* Success Badge */}
            <div className={cn(
              "absolute top-5 z-10 flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-white shadow-sm",
              isRTL ? "right-5" : "left-5"
            )}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold">{t('imageUpload.uploaded')}</span>
            </div>
            
            {/* Change Image Overlay */}
            {!disabled && (
              <div 
                onClick={handleClick}
                className="absolute inset-0 z-0 flex cursor-pointer items-center justify-center rounded-xl bg-slate-950/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 shadow-lg dark:bg-slate-800">
                  <Upload className="h-4 w-4 text-brand-600" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{t('imageUpload.changeImage')}</span>
                </div>
              </div>
            )}
            
            {/* Remove Button - Higher z-index to stay on top */}
            {onImageRemove && !disabled && (
              <Button
                variant="destructive"
                size="icon"
                className={cn(
                  "absolute top-5 z-20 h-9 w-9 rounded-full opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100",
                  isRTL ? "left-5" : "right-5"
                )}
                onClick={onImageRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "group relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
            dragActive
              ? "border-brand-400 bg-brand-50/70 dark:border-brand-600 dark:bg-brand-950/30"
              : "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-700 dark:hover:bg-brand-950/20",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Soft upload icon */}
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
              dragActive
                ? "bg-brand-600 text-white"
                : "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300"
            )}>
              <Upload className={cn(
                "h-7 w-7 transition-transform duration-300",
                dragActive && "animate-bounce"
              )} />
            </div>
            
            {/* Text Content */}
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {dragActive ? t('imageUpload.dropItHere') : t('imageUpload.uploadImage')}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('imageUpload.dragAndDrop')} <span className="font-medium text-brand-600 underline dark:text-brand-300">{t('imageUpload.clickToBrowse')}</span>
              </p>
              
              {/* Info Pills */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {t('imageUpload.maxSize', { size: maxSize })}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {t('imageUpload.allowedFormats')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950/30">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
          <p className="text-start text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
