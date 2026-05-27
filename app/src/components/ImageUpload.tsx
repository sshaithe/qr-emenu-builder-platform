import { useRef, useState } from 'react';
import { Upload, X, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000';

interface Props {
  value?: string;           // current image URL
  onChange: (url: string) => void;
  uploadType?: 'logo' | 'cover' | 'menu_item' | 'general';
  label?: string;
  hint?: string;
  className?: string;
  aspectRatio?: 'square' | 'wide' | 'auto';
}

export default function ImageUpload({
  value,
  onChange,
  uploadType = 'general',
  label,
  hint,
  className = '',
  aspectRatio = 'auto',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const displayUrl = preview || (value
    ? (value.startsWith('http') ? value : `${API_BASE}${value}`)
    : null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PNG, JPG, GIF, or WebP images are allowed');
      return;
    }

    // Validate size (10MB max from phone)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to backend
    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);

      const res = await fetch(`${API_BASE}/api/uploads/image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        onChange(data.data.url);
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
      setPreview(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setPreview(null);
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const aspectClass = {
    square: 'aspect-square',
    wide: 'aspect-video',
    auto: '',
  }[aspectRatio];

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      )}

      {/* Hidden file input — accepts camera on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={uploadType === 'menu_item' ? undefined : 'environment'}
        onChange={handleFileChange}
        className="hidden"
        id={`upload-${uploadType}-${label}`}
      />

      {displayUrl ? (
        /* ── Preview ── */
        <div className={`relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 ${aspectClass}`}>
          <img
            src={displayUrl}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
          {/* Overlay buttons */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label
              htmlFor={`upload-${uploadType}-${label}`}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white/90 rounded-lg text-xs font-medium text-gray-800 hover:bg-white transition"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              {isUploading ? 'Uploading...' : 'Change'}
            </label>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 rounded-lg text-xs font-medium text-white hover:bg-red-500 transition"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* ── Drop zone ── */
        <label
          htmlFor={`upload-${uploadType}-${label}`}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-all cursor-pointer ${aspectClass} py-8`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Uploading...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Click or take a photo
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {hint || 'PNG, JPG, WebP up to 10MB'}
                </p>
              </div>
            </>
          )}
        </label>
      )}
    </div>
  );
}
