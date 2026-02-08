'use client';

import { useState } from 'react';
import { Upload, Link as LinkIcon, X } from 'lucide-react';

interface ImageSelectorProps {
    onImageSelect: (url: string) => void;
    currentImageUrl?: string;
}

/**
 * ImageSelector Component
 *
 * Allows users to provide an image URL for Image-to-Video (I2V) models.
 * Supports URL input with preview.
 */
export default function ImageSelector({ onImageSelect, currentImageUrl }: ImageSelectorProps) {
    const [inputUrl, setInputUrl] = useState(currentImageUrl || '');
    const [previewError, setPreviewError] = useState(false);

    const handleSubmitUrl = () => {
        const trimmed = inputUrl.trim();
        if (trimmed) {
            onImageSelect(trimmed);
            setPreviewError(false);
        }
    };

    const handleClear = () => {
        setInputUrl('');
        onImageSelect('');
        setPreviewError(false);
    };

    return (
        <div className="space-y-3">
            {/* URL Input */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="url"
                        value={inputUrl}
                        onChange={(e) => {
                            setInputUrl(e.target.value);
                            setPreviewError(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSubmitUrl();
                        }}
                        placeholder="Paste image URL..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    />
                    {inputUrl && (
                        <button
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={handleSubmitUrl}
                    disabled={!inputUrl.trim()}
                    className="px-4 py-2.5 text-sm bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                    <Upload className="w-4 h-4" />
                    Load
                </button>
            </div>

            {/* Image Preview */}
            {currentImageUrl && !previewError && (
                <div className="relative rounded-lg overflow-hidden border border-white/10 bg-white/[0.02]">
                    <img
                        src={currentImageUrl}
                        alt="Selected source image"
                        className="w-full max-h-48 object-contain"
                        onError={() => setPreviewError(true)}
                    />
                </div>
            )}

            {previewError && (
                <p className="text-xs text-red-400">
                    Failed to load image preview. Please check the URL.
                </p>
            )}
        </div>
    );
}
