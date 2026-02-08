'use client';

import { useState } from 'react';
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';
import { getUnsplashImageUrl } from '@/lib/unsplash';

interface ImageSelectorProps {
    onImageSelect: (url: string) => void;
    currentImageUrl?: string;
}

// Curated stock images with labels matching the screenshot
const STOCK_IMAGES = [
    { id: 0, label: 'Laptop and coffee', width: 800, height: 600 },
    { id: 1, label: 'Startup office', width: 800, height: 600 },
    { id: 2, label: 'Data visualization', width: 800, height: 600 },
    { id: 3, label: 'Modern workspace', width: 800, height: 600 },
    { id: 4, label: 'Technology', width: 800, height: 600 },
    { id: 5, label: 'Business meeting', width: 800, height: 600 },
];

/**
 * ImageSelector Component
 *
 * Allows users to select images from Unsplash stock gallery or upload custom URL
 * for Image-to-Video (I2V) models.
 */
export default function ImageSelector({ onImageSelect, currentImageUrl }: ImageSelectorProps) {
    const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
    const [inputUrl, setInputUrl] = useState(currentImageUrl || '');
    const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
    const [previewError, setPreviewError] = useState(false);

    const handleStockImageSelect = (id: number) => {
        const imageUrl = getUnsplashImageUrl(id, 800, 600);
        setSelectedStockId(id);
        onImageSelect(imageUrl);
        setPreviewError(false);
    };

    const handleSubmitUrl = () => {
        const trimmed = inputUrl.trim();
        if (trimmed) {
            onImageSelect(trimmed);
            setSelectedStockId(null);
            setPreviewError(false);
        }
    };

    const handleClear = () => {
        setInputUrl('');
        setSelectedStockId(null);
        onImageSelect('');
        setPreviewError(false);
    };

    return (
        <div className="space-y-3">
            {/* Tab Navigation */}
            <div className="flex items-center gap-4 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] transition-colors ${
                        activeTab === 'gallery'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    Unsplash Gallery
                </button>
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] transition-colors ${
                        activeTab === 'upload'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                >
                    <Upload className="w-4 h-4" />
                    Upload Image
                </button>
            </div>

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
                <div className="space-y-3">
                    <p className="text-sm text-gray-400">
                        Select a stock image from our curated collection
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        {STOCK_IMAGES.map((stock) => {
                            const imageUrl = getUnsplashImageUrl(stock.id, stock.width, stock.height);
                            const isSelected = selectedStockId === stock.id;

                            return (
                                <button
                                    key={stock.id}
                                    onClick={() => handleStockImageSelect(stock.id)}
                                    className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                                        isSelected
                                            ? 'border-green-500 ring-2 ring-green-500/20'
                                            : 'border-white/10 hover:border-primary/50'
                                    }`}
                                >
                                    <div className="aspect-[4/3] bg-white/[0.02]">
                                        <img
                                            src={imageUrl}
                                            alt={stock.label}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-0 left-0 right-0 p-2 text-xs font-medium text-white text-center">
                                        {stock.label}
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {currentImageUrl && selectedStockId !== null && (
                        <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-green-400">Image selected and ready</p>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
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
                    {currentImageUrl && selectedStockId === null && !previewError && (
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
            )}
        </div>
    );
}
