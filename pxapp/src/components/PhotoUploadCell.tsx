import React, { useRef, useState } from 'react';
import { Camera, Plus, Trash2, Maximize2, X, Loader2, Link2, UploadCloud, Check } from 'lucide-react';

interface PhotoUploadCellProps {
  photos?: string[];
  type: 'before' | 'after';
  bottleneckTitle: string;
  readOnly?: boolean;
  onPhotosChange?: (photos: string[]) => void;
  onOpenLightbox?: (photos: string[], initialIndex: number, title: string, type: 'before' | 'after') => void;
}

// Compress single image file on HTML5 canvas
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let { width, height } = img;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(readerEvent.target?.result as string);
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed);
        } catch (canvasErr) {
          // Fallback to raw base64 data url if canvas fails
          resolve(readerEvent.target?.result as string);
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const PhotoUploadCell: React.FC<PhotoUploadCellProps> = ({
  photos = [],
  type,
  bottleneckTitle,
  readOnly = false,
  onPhotosChange,
  onOpenLightbox
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle local file selection & multi-upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setUploadError(null);

    try {
      const fileList: File[] = Array.from(files);
      const compressedDataUrls = await Promise.all(
        fileList.map((file: File) => compressImageFile(file))
      );

      const validPhotos = compressedDataUrls.filter(Boolean);
      if (validPhotos.length > 0 && onPhotosChange) {
        const updatedList = [...(photos || []), ...validPhotos];
        onPhotosChange(updatedList);
      }
    } catch (err: any) {
      console.error('Photo processing error:', err);
      setUploadError(err.message || 'Failed to process photos');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle adding photo via web URL
  const handleAddUrlPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInputValue.trim();
    if (!cleanUrl) return;

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('data:image/')) {
      setUploadError('Please enter a valid HTTP or HTTPS image URL');
      return;
    }

    if (onPhotosChange) {
      onPhotosChange([...(photos || []), cleanUrl]);
    }
    setUrlInputValue('');
    setShowUrlInput(false);
    setUploadError(null);
  };

  // Remove photo
  const handleRemovePhoto = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    if (!onPhotosChange) return;
    const updated = (photos || []).filter((_, idx) => idx !== indexToRemove);
    onPhotosChange(updated);
  };

  const isBefore = type === 'before';

  return (
    <div className="flex flex-col gap-1 relative">
      {/* Hidden file input */}
      {!readOnly && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {/* Thumbnails preview strip */}
      <div className="flex items-center gap-2 flex-wrap">
        {photos && photos.length > 0 && (
          photos.slice(0, 3).map((photoUrl, idx) => (
            <div
              key={idx}
              onClick={() => onOpenLightbox && onOpenLightbox(photos, idx, bottleneckTitle, type)}
              className="relative group/thumb w-12 h-12 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-xs cursor-pointer hover:border-orange-500 hover:scale-105 transition-all shrink-0"
              title={`Click to preview ${type} photo #${idx + 1}`}
            >
              <img
                src={photoUrl}
                alt={`${type} evidence ${idx + 1}`}
                className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Maximize2 className="w-4 h-4" />
              </div>

              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => handleRemovePhoto(e, idx)}
                  className="absolute top-1 right-1 w-4 h-4 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-xs cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))
        )}

        {/* Count badge if > 3 photos */}
        {photos && photos.length > 3 && (
          <div
            onClick={() => onOpenLightbox && onOpenLightbox(photos, 3, bottleneckTitle, type)}
            className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black flex items-center justify-center cursor-pointer border border-slate-300 shadow-2xs shrink-0"
            title={`+${photos.length - 3} more photos`}
          >
            +{photos.length - 3}
          </div>
        )}

        {/* Processing Spinner */}
        {isProcessing && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 rounded-xl border border-orange-200 text-xs font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
            <span>Processing...</span>
          </div>
        )}

        {/* Upload Action Buttons */}
        {!readOnly && !isProcessing && (
          <div className="flex items-center gap-1.5">
            {/* Direct File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                photos && photos.length > 0
                  ? 'border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50 text-slate-600 hover:text-orange-600'
                  : isBefore
                  ? 'border-dashed border-amber-300 text-amber-900 bg-amber-50/50 hover:bg-amber-100 hover:border-amber-400'
                  : 'border-dashed border-emerald-300 text-emerald-900 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-400'
              }`}
              title={`Upload ${type} photo from device`}
            >
              {photos && photos.length > 0 ? (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>+ {isBefore ? 'Before Photo' : 'After Photo'}</span>
                </>
              )}
            </button>

            {/* Quick URL Input Toggle */}
            <button
              type="button"
              onClick={() => setShowUrlInput((prev) => !prev)}
              className="p-2 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50 text-slate-500 hover:text-orange-600 transition-all cursor-pointer shadow-2xs"
              title="Add photo from URL link"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Read-only empty state */}
        {readOnly && (!photos || photos.length === 0) && (
          <span className="text-xs text-slate-400 italic font-medium">No {type} photos</span>
        )}
      </div>

      {/* URL Link Input Popup */}
      {showUrlInput && (
        <form onSubmit={handleAddUrlPhoto} className="mt-1.5 flex items-center gap-1.5 p-2 bg-white rounded-xl border border-orange-200 shadow-md z-10 max-w-xs animate-in fade-in zoom-in-95">
          <input
            type="url"
            placeholder="Paste image URL (https://...)"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Error feedback */}
      {uploadError && (
        <p className="text-[11px] text-rose-600 font-bold mt-0.5">{uploadError}</p>
      )}
    </div>
  );
};
