'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Link as LinkIcon, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizePerImageMB?: number;
  acceptedFormats?: string[];
  className?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 6,
  maxSizePerImageMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className = ''
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `File type ${file.type} not supported. Please use JPEG, PNG, or WebP.`;
    }
    if (file.size > maxSizePerImageMB * 1024 * 1024) {
      return `File size must be less than ${maxSizePerImageMB}MB`;
    }
    return null;
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFiles = async (files: FileList) => {
    if (images.length >= maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles: File[] = [];
    const errorMessages: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errorMessages.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errorMessages.length > 0) {
      setUploadError(errorMessages.join('; '));
      return;
    }

    if (validFiles.length + images.length > maxImages) {
      setUploadError(`Can only add ${maxImages - images.length} more images`);
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const newImagePromises = validFiles.map(file => convertFileToBase64(file));
      const newImages = await Promise.all(newImagePromises);
      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError('Failed to process images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles, images.length, maxImages]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const addImageFromUrl = () => {
    if (!urlInput.trim()) return;

    try {
      new URL(urlInput);
      if (images.includes(urlInput)) {
        setUploadError('This image URL is already added');
        return;
      }
      if (images.length >= maxImages) {
        setUploadError(`Maximum ${maxImages} images allowed`);
        return;
      }
      
      onImagesChange([...images, urlInput]);
      setUrlInput('');
      setShowUrlInput(false);
      setUploadError('');
    } catch {
      setUploadError('Please enter a valid URL');
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onImagesChange(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div className="relative">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${dragActive 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
            }
            ${uploading ? 'pointer-events-none opacity-75' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <div className="flex flex-col items-center space-y-4">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="text-gray-600">Processing images...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drop images here or click to upload
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Up to {maxImages} images, max {maxSizePerImageMB}MB each
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPEG, PNG, WebP supported
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUrlInput(!showUrlInput);
                    }}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Add URL
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* URL Input */}
        {showUrlInput && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex space-x-2">
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageFromUrl();
                  }
                }}
              />
              <Button type="button" onClick={addImageFromUrl} size="sm">
                Add
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlInput('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
          <span className="text-red-700 text-sm">{uploadError}</span>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Uploaded Images ({images.length}/{maxImages})
            </h4>
            {images.length > 1 && (
              <p className="text-xs text-gray-500">
                Drag to reorder • First image will be the main photo
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative group cursor-move"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString());
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  moveImage(fromIndex, index);
                }}
              >
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-orange-300 transition-colors">
                  <Image
                    src={imageUrl}
                    alt={`Car image ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  
                  {/* Main photo badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                      Main Photo
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Loading overlay for base64 images */}
                  {imageUrl.startsWith('data:') && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="bg-white px-2 py-1 rounded text-xs">
                        Uploaded
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-1 truncate">
                  Image {index + 1}
                  {imageUrl.startsWith('http') ? ' (URL)' : ' (File)'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No images uploaded yet. Add some photos to showcase your car!
          </p>
        </div>
      )}
    </div>
  );
}
