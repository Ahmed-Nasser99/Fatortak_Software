
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
          <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-3 shadow-lg hover:shadow-xl transition-all">
            <div className="relative w-full h-56 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden">
              <img
                src={preview}
                alt={t('imageUpload.preview')}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Success Badge */}
            <div className={cn(
              "absolute top-5 bg-green-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-10",
              isRTL ? "right-5" : "left-5"
            )}>
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold">{t('imageUpload.uploaded')}</span>
            </div>
            
            {/* Change Image Overlay */}
            {!disabled && (
              <div 
                onClick={handleClick}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer rounded-xl z-0"
              >
                <div className="bg-white dark:bg-slate-800 px-6 py-3 rounded-xl flex items-center gap-2 shadow-2xl transform group-hover:scale-105 transition-transform">
                  <Upload className="w-4 h-4 text-blue-600" />
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
                  "absolute top-5 w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl hover:scale-110 z-20",
                  isRTL ? "left-5" : "right-5"
                )}
                onClick={onImageRemove}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group",
            dragActive
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 scale-[1.02] shadow-xl"
              : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gradient-to-br hover:from-slate-50 hover:to-blue-50/30 dark:hover:from-slate-800/50 dark:hover:to-blue-950/20 hover:shadow-lg",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center space-y-5">
            {/* Premium Icon */}
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300",
              dragActive 
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 scale-110" 
                : "bg-gradient-to-br from-blue-500/90 to-purple-600/90 group-hover:scale-110 group-hover:shadow-2xl"
            )}>
              <Upload className={cn(
                "w-9 h-9 text-white transition-transform duration-300",
                dragActive && "animate-bounce"
              )} />
            </div>
            
            {/* Text Content */}
            <div className="space-y-2">
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {dragActive ? t('imageUpload.dropItHere') : t('imageUpload.uploadImage')}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {t('imageUpload.dragAndDrop')} <span className="text-blue-600 dark:text-blue-400 underline">{t('imageUpload.clickToBrowse')}</span>
              </p>
              
              {/* Info Pills */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('imageUpload.maxSize', { size: maxSize })}
                </span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('imageUpload.allowedFormats')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-300 text-sm font-medium text-left">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
