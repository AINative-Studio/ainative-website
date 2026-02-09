'use client';

import { useState, useRef } from 'react';
import { Upload, File, X, Music, AlertCircle } from 'lucide-react';

interface AudioFileUploadProps {
    onFileSelect: (file: File) => void;
    currentFile?: File | null;
    acceptedFormats?: string;
    maxSizeMB?: number;
}

/**
 * AudioFileUpload Component
 *
 * Allows users to upload audio/video files for Whisper transcription and translation models.
 * Supports drag & drop and click-to-upload.
 */
export default function AudioFileUpload({
    onFileSelect,
    currentFile = null,
    acceptedFormats = '.mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm',
    maxSizeMB = 25
}: AudioFileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(currentFile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const validateFile = (file: File): string | null => {
        // Check file size
        if (file.size > maxSizeBytes) {
            return `File size exceeds ${maxSizeMB}MB limit`;
        }

        // Check file type
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        const accepted = acceptedFormats.split(',');
        if (!accepted.includes(extension)) {
            return `Invalid file type. Accepted formats: ${acceptedFormats}`;
        }

        return null;
    };

    const handleFileChange = (file: File | null) => {
        if (!file) {
            setError(null);
            setSelectedFile(null);
            return;
        }

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            setSelectedFile(null);
            return;
        }

        setError(null);
        setSelectedFile(file);
        onFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileChange(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileChange(files[0]);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-3">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats}
                onChange={handleInputChange}
                className="hidden"
            />

            {/* Drop zone */}
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
                    isDragging
                        ? 'border-primary bg-primary/10'
                        : selectedFile
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.05]'
                }`}
            >
                {!selectedFile ? (
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="p-3 bg-white/5 rounded-full">
                            <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-300 mb-1">
                                Drop audio file here or click to browse
                            </p>
                            <p className="text-xs text-gray-500">
                                Supports: MP3, MP4, WAV, M4A, WebM (max {maxSizeMB}MB)
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Music className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-400">
                                {formatFileSize(selectedFile.size)}
                            </p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-400">{error}</p>
                </div>
            )}

            {/* Success indicator */}
            {selectedFile && !error && (
                <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <p className="text-xs text-green-400">Audio file selected and ready</p>
                </div>
            )}
        </div>
    );
}
